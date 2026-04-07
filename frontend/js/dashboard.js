/* ─── Config ──────────────────────────────────────────────────────── */
const API_BASE = 'http://localhost:3000';

/* ─── State ───────────────────────────────────────────────────────── */
let tokenChart     = null;
let chartHistory   = [];   // { label, input, output }[]

/* ─── DOM Refs ────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const els = {
    totalRequests : $('totalRequests'),
    totalInput    : $('totalInput'),
    totalOutput   : $('totalOutput'),
    totalCost     : $('totalCost'),
    callCount     : $('callCount'),
    callsTableBody: $('callsTableBody'),
    liveIndicator : $('liveIndicator'),
    liveLabel     : $('liveLabel'),
    // test panel
    modelSelect   : $('modelSelect'),
    maxTokens     : $('maxTokens'),
    promptInput   : $('promptInput'),
    sendBtn       : $('sendBtn'),
    resetBtn      : $('resetBtn'),
    responseBox   : $('responseBox'),
    responseMeta  : $('responseMeta'),
    responseText  : $('responseText'),
    toast         : $('toast'),
};

/* ─── Number formatting ───────────────────────────────────────────── */
function fmt(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}

function fmtTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtDuration(ms) {
    if (ms >= 1000) return (ms / 1000).toFixed(1) + 's';
    return ms + 'ms';
}

/* ─── Toast ───────────────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 3000);
}

/* ─── Chart ───────────────────────────────────────────────────────── */
function initChart() {
    const ctx = document.getElementById('tokenChart').getContext('2d');
    tokenChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: '입력 토큰',
                    data: [],
                    backgroundColor: 'rgba(124,106,247,0.7)',
                    borderRadius: 4,
                },
                {
                    label: '출력 토큰',
                    data: [],
                    backgroundColor: 'rgba(46,204,113,0.7)',
                    borderRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            plugins: {
                legend: {
                    labels: { color: '#8890a4', font: { size: 12 } },
                },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString()} 토큰`,
                    },
                },
            },
            scales: {
                x: {
                    ticks: { color: '#555d72', maxTicksLimit: 10, font: { size: 11 } },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                },
                y: {
                    ticks: { color: '#555d72', font: { size: 11 }, callback: v => fmt(v) },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                },
            },
        },
    });
}

function updateChart(calls) {
    const slice = [...calls].reverse().slice(0, 20);
    tokenChart.data.labels             = slice.map((c, i) => `#${i + 1}`);
    tokenChart.data.datasets[0].data   = slice.map(c => c.inputTokens);
    tokenChart.data.datasets[1].data   = slice.map(c => c.outputTokens);
    tokenChart.update('none');
}

/* ─── Table ───────────────────────────────────────────────────────── */
function updateTable(calls) {
    els.callCount.textContent = `${calls.length}건`;

    if (!calls.length) {
        els.callsTableBody.innerHTML = `
            <tr class="empty-row">
                <td colspan="9">아직 API 호출이 없습니다. 위에서 테스트해보세요.</td>
            </tr>`;
        return;
    }

    els.callsTableBody.innerHTML = calls.map(c => `
        <tr>
            <td>${fmtTime(c.timestamp)}</td>
            <td title="${escHtml(c.promptPreview)}">${escHtml(c.promptPreview.slice(0, 40))}${c.promptPreview.length > 40 ? '…' : ''}</td>
            <td>${c.model || '-'}</td>
            <td>${c.inputTokens.toLocaleString()}</td>
            <td>${c.outputTokens.toLocaleString()}</td>
            <td>${c.cacheReadTokens ? c.cacheReadTokens.toLocaleString() : '-'}</td>
            <td>$${c.costUSD.toFixed(6)}</td>
            <td>${fmtDuration(c.durationMs)}</td>
            <td><span class="badge badge-success">${c.stopReason || 'end_turn'}</span></td>
        </tr>
    `).join('');
}

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ─── Render usage payload ────────────────────────────────────────── */
function render(data) {
    const t = data.totals;
    els.totalRequests.textContent = t.requests.toLocaleString();
    els.totalInput.textContent    = fmt(t.inputTokens);
    els.totalOutput.textContent   = fmt(t.outputTokens);
    els.totalCost.textContent     = `$${t.estimatedCostUSD.toFixed(6)}`;

    updateTable(data.recentCalls);
    updateChart(data.recentCalls);
}

/* ─── SSE connection ──────────────────────────────────────────────── */
function connectSSE() {
    const es = new EventSource(`${API_BASE}/api/usage/events`);

    es.onopen = () => {
        els.liveIndicator.className = 'live-dot connected';
        els.liveLabel.textContent   = '실시간 연결됨';
    };

    es.onmessage = e => {
        try { render(JSON.parse(e.data)); }
        catch (_) { /* skip malformed */ }
    };

    es.onerror = () => {
        els.liveIndicator.className = 'live-dot disconnected';
        els.liveLabel.textContent   = '연결 끊김 — 재시도 중';
        es.close();
        setTimeout(connectSSE, 5000);
    };
}

/* ─── Fetch initial state (fallback if SSE not available) ─────────── */
async function fetchUsage() {
    try {
        const res = await fetch(`${API_BASE}/api/usage`);
        if (res.ok) render(await res.json());
    } catch (_) { /* server not running */ }
}

/* ─── Send test message ───────────────────────────────────────────── */
async function sendMessage() {
    const prompt = els.promptInput.value.trim();
    if (!prompt) { showToast('프롬프트를 입력해 주세요.'); return; }

    els.sendBtn.disabled    = true;
    els.sendBtn.textContent = '전송 중…';
    els.responseBox.style.display = 'none';

    try {
        const res = await fetch(`${API_BASE}/api/claude/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                model    : els.modelSelect.value,
                maxTokens: parseInt(els.maxTokens.value, 10) || 512,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(`오류: ${data.error}`);
            return;
        }

        const u = data.usage;
        els.responseMeta.innerHTML = [
            `<span>입력 ${u.input_tokens} 토큰</span>`,
            `<span>출력 ${u.output_tokens} 토큰</span>`,
            `<span>${data.model}</span>`,
            `<span>${fmtDuration(data.durationMs)}</span>`,
        ].join('');
        els.responseText.textContent    = data.text;
        els.responseBox.style.display   = 'block';
        showToast('응답 완료!');
    } catch (err) {
        showToast(`연결 오류: 서버가 실행 중인지 확인하세요.`);
    } finally {
        els.sendBtn.disabled    = false;
        els.sendBtn.textContent = '전송';
    }
}

/* ─── Reset ───────────────────────────────────────────────────────── */
async function resetUsage() {
    if (!confirm('모든 사용량 데이터를 초기화하시겠습니까?')) return;
    try {
        await fetch(`${API_BASE}/api/usage/reset`, { method: 'POST' });
        showToast('초기화 완료');
    } catch (_) {
        showToast('초기화 실패 — 서버 연결을 확인하세요.');
    }
}

/* ─── Event Listeners ─────────────────────────────────────────────── */
els.sendBtn.addEventListener('click', sendMessage);
els.resetBtn.addEventListener('click', resetUsage);

els.promptInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendMessage();
});

/* ─── Init ────────────────────────────────────────────────────────── */
initChart();
fetchUsage();
connectSSE();
