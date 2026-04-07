require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const { exec }  = require('child_process');
const Anthropic  = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Serve frontend static files ───────────────────────────────────────────
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

// Anthropic client (lazy — key may be set after first launch via env prompt)
let anthropic = null;
function getClient() {
    if (!anthropic && process.env.ANTHROPIC_API_KEY) {
        anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    return anthropic;
}

// ─── Usage Tracking ────────────────────────────────────────────────────────
const usageStore = {
    calls: [],
    totals: {
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreationTokens: 0,
        cacheReadTokens: 0,
    },
};

const sseClients = new Set();

function broadcastUsage() {
    const data = JSON.stringify(buildUsagePayload());
    for (const client of sseClients) {
        client.write(`data: ${data}\n\n`);
    }
}

function buildUsagePayload() {
    const { totals, calls } = usageStore;
    const inputCost  = (totals.inputTokens            / 1_000_000) * 5;
    const outputCost = (totals.outputTokens            / 1_000_000) * 25;
    const cacheCost  = (totals.cacheCreationTokens     / 1_000_000) * 6.25;
    const cacheRead  = (totals.cacheReadTokens         / 1_000_000) * 0.5;
    return {
        totals: {
            ...totals,
            estimatedCostUSD: +(inputCost + outputCost + cacheCost + cacheRead).toFixed(6),
        },
        recentCalls: calls.slice(-50).reverse(),
        hasApiKey: !!process.env.ANTHROPIC_API_KEY,
        model: 'claude-opus-4-6',
        pricing: { inputPerM: 5, outputPerM: 25 },
    };
}

function recordUsage(prompt, response, durationMs) {
    const u = response.usage;
    const input       = u.input_tokens                 || 0;
    const output      = u.output_tokens                || 0;
    const cacheCreate = u.cache_creation_input_tokens  || 0;
    const cacheRead   = u.cache_read_input_tokens      || 0;

    usageStore.totals.requests++;
    usageStore.totals.inputTokens         += input;
    usageStore.totals.outputTokens        += output;
    usageStore.totals.cacheCreationTokens += cacheCreate;
    usageStore.totals.cacheReadTokens     += cacheRead;

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
        costUSD: +((input / 1_000_000) * 5 + (output / 1_000_000) * 25).toFixed(6),
        durationMs,
    });

    if (usageStore.calls.length > 200) usageStore.calls.shift();
    broadcastUsage();
}

// ─── Pet Commerce Endpoints ────────────────────────────────────────────────
let products     = [];
let hospitals    = [];
let reservations = [];
let inquiries    = [];
let memorials    = [];

app.get('/products',      (req, res) => res.json(products));
app.post('/products',     (req, res) => { products.push(req.body); res.status(201).json(req.body); });
app.put('/products/:id',  (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    idx !== -1 ? res.json(products[idx] = req.body) : res.status(404).send('Not found');
});
app.delete('/products/:id', (req, res) => { products = products.filter(p => p.id !== req.params.id); res.status(204).send(); });

app.get('/hospitals',        (req, res) => res.json(hospitals));
app.post('/hospitals',       (req, res) => { hospitals.push(req.body); res.status(201).json(req.body); });
app.get('/hospitals/search', (req, res) => res.json(hospitals.filter(h => h.name.includes(req.query.name))));

app.post('/reservations', (req, res) => { reservations.push(req.body); res.status(201).json(req.body); });
app.post('/inquiries',    (req, res) => { inquiries.push(req.body);    res.status(201).json(req.body); });

app.get('/memorials',       (req, res) => res.json(memorials));
app.post('/memorials',      (req, res) => { memorials.push(req.body); res.status(201).json(req.body); });
app.delete('/memorials/:id',(req, res) => { memorials = memorials.filter(m => m.id !== req.params.id); res.status(204).send(); });

// ─── Claude Usage Dashboard API ────────────────────────────────────────────

app.post('/api/claude/chat', async (req, res) => {
    const { prompt, model = 'claude-opus-4-6', maxTokens = 1024 } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const client = getClient();
    if (!client) return res.status(500).json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' });

    const start = Date.now();
    try {
        const response = await client.messages.create({
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

app.get('/api/usage', (req, res) => res.json(buildUsagePayload()));

app.post('/api/usage/reset', (req, res) => {
    usageStore.calls.length = 0;
    Object.keys(usageStore.totals).forEach(k => (usageStore.totals[k] = 0));
    broadcastUsage();
    res.json({ ok: true });
});

app.get('/api/usage/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`data: ${JSON.stringify(buildUsagePayload())}\n\n`);
    sseClients.add(res);
    const heartbeat = setInterval(() => res.write(': ping\n\n'), 15_000);
    req.on('close', () => { clearInterval(heartbeat); sseClients.delete(res); });
});

// ─── Catch-all: serve dashboard for any unknown route ─────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'dashboard.html'));
});

// ─── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const url = `http://localhost:${PORT}/dashboard.html`;
    console.log('');
    console.log('  ◆  Claude 사용량 대시보드');
    console.log(`  →  ${url}`);
    console.log('');
    if (!process.env.ANTHROPIC_API_KEY) {
        console.log('  ⚠  ANTHROPIC_API_KEY 가 설정되지 않았습니다.');
        console.log('     Claude 테스트 기능은 API 키 설정 후 사용 가능합니다.');
        console.log('');
    }

    // Auto-open browser
    const openCmd = process.platform === 'win32' ? `start ${url}`
                  : process.platform === 'darwin' ? `open ${url}`
                  : `xdg-open ${url}`;
    exec(openCmd, err => { if (err) console.log(`  브라우저를 직접 여세요: ${url}`); });
});
