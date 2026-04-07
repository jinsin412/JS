require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Usage Tracking ────────────────────────────────────────────────────────
const usageStore = {
    calls: [],         // Individual call records
    totals: {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
    },
};

// SSE clients for real-time updates
const sseClients = new Set();

function broadcastUsage() {
    const data = JSON.stringify(buildUsagePayload());
    for (const client of sseClients) {
        client.write(`data: ${data}\n\n`);
    }
}

function buildUsagePayload() {
    const { totals, calls } = usageStore;
    // Pricing: claude-opus-4-6 — $5/1M input, $25/1M output
    const inputCost  = (totals.inputTokens  / 1_000_000) * 5;
    const outputCost = (totals.outputTokens / 1_000_000) * 25;
    const cacheCost  = (totals.cacheCreationTokens / 1_000_000) * 6.25; // 1.25x
    const cacheRead  = (totals.cacheReadTokens / 1_000_000) * 0.5;      // 0.1x
    return {
        totals: {
            ...totals,
            estimatedCostUSD: +(inputCost + outputCost + cacheCost + cacheRead).toFixed(6),
        },
        recentCalls: calls.slice(-50).reverse(),
        model: 'claude-opus-4-6',
        pricing: { inputPerM: 5, outputPerM: 25 },
    };
}

function recordUsage(prompt, response, durationMs) {
    const u = response.usage;
    const input  = u.input_tokens  || 0;
    const output = u.output_tokens || 0;
    const cacheCreate = u.cache_creation_input_tokens || 0;
    const cacheRead   = u.cache_read_input_tokens     || 0;

    usageStore.totals.requests++;
    usageStore.totals.inputTokens          += input;
    usageStore.totals.outputTokens         += output;
    usageStore.totals.cacheCreationTokens  += cacheCreate;
    usageStore.totals.cacheReadTokens      += cacheRead;

    const inputCost  = (input  / 1_000_000) * 5;
    const outputCost = (output / 1_000_000) * 25;

    usageStore.calls.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        promptPreview: (prompt || '').slice(0, 80),
        model: response.model,
        stopReason: response.stop_reason,
        inputTokens: input,
        outputTokens: output,
        cacheCreationTokens: cacheCreate,
        cacheReadTokens: cacheRead,
        costUSD: +(inputCost + outputCost).toFixed(6),
        durationMs,
    });

    // Keep last 200 calls
    if (usageStore.calls.length > 200) usageStore.calls.shift();

    broadcastUsage();
}

// ─── Original Pet Commerce Endpoints ──────────────────────────────────────
let products    = [];
let hospitals   = [];
let reservations = [];
let inquiries   = [];
let memorials   = [];

app.get('/', (req, res) => res.status(200).send('Health check OK'));

app.get('/products', (req, res) => res.json(products));
app.post('/products', (req, res) => { products.push(req.body); res.status(201).json(req.body); });
app.put('/products/:id', (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx !== -1) { products[idx] = req.body; res.json(products[idx]); }
    else res.status(404).send('Product not found');
});
app.delete('/products/:id', (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

app.get('/hospitals', (req, res) => res.json(hospitals));
app.post('/hospitals', (req, res) => { hospitals.push(req.body); res.status(201).json(req.body); });
app.get('/hospitals/search', (req, res) => {
    const { name } = req.query;
    res.json(hospitals.filter(h => h.name.includes(name)));
});

app.post('/reservations', (req, res) => { reservations.push(req.body); res.status(201).json(req.body); });
app.post('/inquiries',    (req, res) => { inquiries.push(req.body);    res.status(201).json(req.body); });

app.get('/memorials',  (req, res) => res.json(memorials));
app.post('/memorials', (req, res) => { memorials.push(req.body); res.status(201).json(req.body); });
app.delete('/memorials/:id', (req, res) => {
    memorials = memorials.filter(m => m.id !== req.params.id);
    res.status(204).send();
});

// ─── Claude Usage Dashboard Endpoints ─────────────────────────────────────

// POST /api/claude/chat — send a message to Claude and track usage
app.post('/api/claude/chat', async (req, res) => {
    const { prompt, model = 'claude-opus-4-6', maxTokens = 1024 } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server' });
    }

    const start = Date.now();
    try {
        const response = await anthropic.messages.create({
            model,
            max_tokens: maxTokens,
            messages: [{ role: 'user', content: prompt }],
        });

        const durationMs = Date.now() - start;
        recordUsage(prompt, response, durationMs);

        const text = response.content.find(b => b.type === 'text')?.text || '';
        res.json({ text, usage: response.usage, model: response.model, durationMs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/usage — current accumulated usage stats
app.get('/api/usage', (req, res) => {
    res.json(buildUsagePayload());
});

// GET /api/usage/reset — reset all counters
app.post('/api/usage/reset', (req, res) => {
    usageStore.calls.length = 0;
    Object.keys(usageStore.totals).forEach(k => (usageStore.totals[k] = 0));
    broadcastUsage();
    res.json({ ok: true });
});

// GET /api/usage/events — SSE stream for real-time updates
app.get('/api/usage/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send current state immediately
    res.write(`data: ${JSON.stringify(buildUsagePayload())}\n\n`);

    sseClients.add(res);

    // Heartbeat every 15s to keep connection alive
    const heartbeat = setInterval(() => res.write(': ping\n\n'), 15_000);

    req.on('close', () => {
        clearInterval(heartbeat);
        sseClients.delete(res);
    });
});

// ─── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
