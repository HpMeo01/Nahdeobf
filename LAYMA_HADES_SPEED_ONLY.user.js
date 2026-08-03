// ==UserScript==
// @name         LAYMA + HADES SPEED x15
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Bypass captcha siêu tốc độ x15
// @author       @tpmodz
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // =============================================================
    //  HADES SPEED x15 – OVERRIDE TIMERS
    // =============================================================
    const SPEED = 15;

    const _setTimeout = window.setTimeout;
    const _setInterval = window.setInterval;
    const _clearTimeout = window.clearTimeout;
    const _clearInterval = window.clearInterval;

    const timeoutMap = new Map();
    const intervalMap = new Map();

    window.setTimeout = function(fn, delay, ...args) {
        const realDelay = Math.max(1, Math.floor(delay / SPEED));
        const id = _setTimeout(() => {
            if (timeoutMap.has(id)) {
                timeoutMap.delete(id);
                fn(...args);
            }
        }, realDelay);
        timeoutMap.set(id, { fn, delay, args });
        return id;
    };

    window.setInterval = function(fn, delay, ...args) {
        const realDelay = Math.max(1, Math.floor(delay / SPEED));
        const id = _setInterval(() => {
            if (intervalMap.has(id)) fn(...args);
        }, realDelay);
        intervalMap.set(id, { fn, delay, args });
        return id;
    };

    window.clearTimeout = function(id) {
        if (timeoutMap.has(id)) timeoutMap.delete(id);
        _clearTimeout(id);
    };

    window.clearInterval = function(id) {
        if (intervalMap.has(id)) intervalMap.delete(id);
        _clearInterval(id);
    };

    console.log('[HadesSpeed] x' + SPEED + ' activated.');

    // =============================================================
    //  THÔNG BÁO HADES (tốc độ)
    // =============================================================
    let hadesShown = false;

    function showHades() {
        if (hadesShown) return;
        hadesShown = true;
        const id = 'hades-speed-notification';
        if (document.getElementById(id)) return;

        const container = document.createElement('div');
        container.id = id;
        container.style.cssText = `
            position: fixed;
            top: 25px;
            right: 25px;
            background: rgba(30,35,50,0.9);
            color: #e0e0e0;
            padding: 12px 18px;
            border-radius: 12px;
            z-index: 2147483647;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            font-family: 'Segoe UI', sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            opacity: 0;
            transform: translateX(120%);
            transition: all 0.5s cubic-bezier(0.25,1,0.5,1);
        `;
        container.innerHTML = `
            <span style="font-size:24px;">⚡</span>
            <div>
                <div style="font-weight:700;color:#fff;">HadesSpeed x${SPEED}</div>
                <div style="font-size:13px;color:#b0b8c8;">Bypass đang chạy siêu tốc</div>
            </div>
            <span class="hades-close" style="font-size:24px;color:#888;cursor:pointer;padding:0 6px;">×</span>
        `;
        document.body.appendChild(container);

        setTimeout(() => container.classList.add('visible'), 100);

        container.querySelector('.hades-close').addEventListener('click', () => {
            container.classList.remove('visible');
            setTimeout(() => container.remove(), 500);
            hadesShown = false;
        });

        // Tự đóng sau 8s
        setTimeout(() => {
            if (container.parentNode) {
                container.classList.remove('visible');
                setTimeout(() => container.remove(), 500);
                hadesShown = false;
            }
        }, 8000);
    }

    // =============================================================
    //  LAYMA BYPASS – UI + LOGIC (rút gọn nhưng đầy đủ)
    // =============================================================
    const CONFIG = {
        apiBase: 'https://layma.net/Traffic/Index/',
        solveEndpoint: 'https://layma.net/Traffic/Solve/',
        timeout: 15000,
        autoSubmit: true
    };

    // CSS (giữ nguyên từ các bản trước)
    const style = document.createElement('style');
    style.textContent = `
        #lm-root, #lm-root * { box-sizing:border-box; margin:0; padding:0; }
        #lm-root {
            position:fixed; top:24px; left:24px; z-index:9999999;
            width:380px; background:rgba(10,10,20,0.92);
            backdrop-filter:blur(18px);
            border:1px solid rgba(56,189,248,0.25);
            border-radius:18px;
            box-shadow:0 24px 70px rgba(0,0,0,0.85);
            font-family:'Segoe UI',system-ui,sans-serif;
            color:#e8edf5; user-select:none;
        }
        #lm-header {
            display:flex; align-items:center; padding:10px 14px;
            background:rgba(255,255,255,0.03);
            border-bottom:1px solid rgba(255,255,255,0.06);
            cursor:move; gap:10px;
        }
        #lm-collapse-btn {
            width:26px; height:26px; border-radius:50%;
            border:1px solid rgba(56,189,248,0.2);
            background:rgba(56,189,248,0.06);
            color:#38bdf8; font-size:14px; font-weight:700;
            cursor:pointer; display:flex; align-items:center; justify-content:center;
            transition:0.2s;
        }
        #lm-collapse-btn:hover { background:rgba(56,189,248,0.18); transform:scale(1.12); }
        #lm-title {
            flex:1; display:flex; align-items:center; gap:8px;
            font-weight:700; font-size:11.5px; letter-spacing:1.8px;
            text-transform:uppercase; color:rgba(255,255,255,0.85);
        }
        #lm-title-dot {
            width:8px; height:8px; border-radius:50%;
            background:#22c55e;
            box-shadow:0 0 0 3px rgba(34,197,94,0.18), 0 0 12px rgba(34,197,94,0.4);
            animation:lm-pulse 2.4s ease-in-out infinite;
        }
        @keyframes lm-pulse {
            0%,100% { box-shadow:0 0 0 3px rgba(34,197,94,0.18),0 0 12px rgba(34,197,94,0.4); }
            50% { box-shadow:0 0 0 6px rgba(34,197,94,0.06),0 0 24px rgba(34,197,94,0.25); }
        }
        #lm-status-tag {
            font-size:9px; font-weight:700; letter-spacing:0.6px;
            padding:3px 10px; border-radius:99px;
            background:rgba(56,189,248,0.13);
            border:1px solid rgba(56,189,248,0.18);
            color:#7dd3fc; text-transform:uppercase; white-space:nowrap;
        }
        #lm-body { padding:14px 16px 16px; display:flex; flex-direction:column; gap:12px; }
        #lm-body.hidden { display:none; }
        #lm-progress-row { display:flex; align-items:center; gap:12px; }
        #lm-bar-track {
            flex:1; height:5px; border-radius:99px;
            background:rgba(255,255,255,0.06); overflow:hidden;
        }
        #lm-bar-fill {
            height:100%; width:0%; border-radius:99px;
            background:linear-gradient(90deg,#0369a1,#0ea5e9,#38bdf8,#7dd3fc);
            background-size:300% 100%;
            transition:width 0.5s cubic-bezier(0.4,0,0.2,1);
            animation:lm-shimmer 3s linear infinite;
        }
        @keyframes lm-shimmer {
            0% { background-position:300% center; }
            100% { background-position:-300% center; }
        }
        #lm-timer-display {
            font-family:'SF Mono','Fira Code',monospace;
            font-weight:800; font-size:14px; color:#38bdf8;
            min-width:48px; text-align:right; letter-spacing:0.5px;
            text-shadow:0 0 14px rgba(56,189,248,0.35);
        }
        #lm-log {
            background:rgba(0,0,0,0.3);
            border:1px solid rgba(255,255,255,0.04);
            border-radius:10px; padding:8px 11px; height:90px;
            overflow-y:auto;
            font-family:'SF Mono','Fira Code',monospace;
            font-size:10.5px; line-height:1.65;
            color:rgba(255,255,255,0.6); word-break:break-all;
        }
        #lm-log::-webkit-scrollbar { width:3px; }
        #lm-log::-webkit-scrollbar-thumb { background:rgba(56,189,248,0.2); border-radius:99px; }
        .lm-box {
            display:flex; flex-direction:column; border-radius:12px;
            overflow:hidden; max-height:0; opacity:0; padding:0;
            border:0px solid transparent;
            transition:max-height 0.38s cubic-bezier(0.4,0,0.2,1),
                        opacity 0.28s ease, padding 0.32s ease, border-width 0.32s ease;
        }
        .lm-box.visible {
            max-height:200px; opacity:1; padding:12px;
            border-width:1px; background:rgba(0,0,0,0.2);
            border-color:rgba(56,189,248,0.12); gap:8px;
        }
        .lm-box-label {
            font-size:10px; font-weight:600;
            color:rgba(125,211,252,0.75);
            text-transform:uppercase; letter-spacing:1.2px;
        }
        #lm-url-row { display:flex; gap:6px; }
        #lm-url-input {
            flex:1; padding:7px 11px;
            border:1px solid rgba(56,189,248,0.15); border-radius:8px;
            background:rgba(0,0,0,0.35); color:rgba(255,255,255,0.85);
            font-size:11.5px; outline:none; transition:0.15s;
        }
        #lm-url-input:focus { border-color:rgba(56,189,248,0.45); box-shadow:0 0 0 3px rgba(56,189,248,0.08); }
        #lm-url-input::placeholder { color:rgba(255,255,255,0.2); }
        #lm-url-submit {
            padding:7px 16px; border-radius:8px; border:none;
            background:#0284c7; color:#fff; font-size:11.5px; font-weight:600;
            cursor:pointer; white-space:nowrap; transition:0.12s;
        }
        #lm-url-submit:hover { background:#0369a1; transform:translateY(-1px); }
        #lm-url-submit:active { transform:none; }
        #lm-captcha-target img { max-width:100%; border-radius:6px; }
        #lm-code-text {
            font-family:'SF Mono',monospace;
            font-size:22px; font-weight:800; color:#fff;
            letter-spacing:3px; text-shadow:0 0 20px rgba(56,189,248,0.35);
            word-break:break-all;
        }
        #lm-copy-btn {
            padding:5px 20px; border-radius:99px;
            background:rgba(255,255,255,0.07);
            border:1px solid rgba(255,255,255,0.12);
            color:rgba(255,255,255,0.75);
            font-size:11px; font-weight:600; cursor:pointer;
            transition:0.12s; align-self:flex-start;
        }
        #lm-copy-btn:hover { background:rgba(255,255,255,0.15); transform:translateY(-1px); }
        #lm-copy-btn.copied {
            background:rgba(34,197,94,0.2);
            border-color:rgba(34,197,94,0.3);
            color:#86efac;
        }
        #lm-footer {
            display:flex; align-items:center; gap:8px;
            font-size:10.5px; color:rgba(255,255,255,0.3);
        }
        #lm-autosubmit-label {
            display:flex; align-items:center; gap:6px;
            cursor:pointer; transition:0.15s;
        }
        #lm-autosubmit-label:hover { color:rgba(255,255,255,0.6); }
        #lm-autosubmit-chk {
            accent-color:#0284c7; width:13px; height:13px; cursor:pointer;
        }
    `;
    document.head.appendChild(style);

    // ===== UI =====
    const root = document.createElement('div');
    root.id = 'lm-root';
    root.innerHTML = `
        <div id="lm-header">
            <button id="lm-collapse-btn">−</button>
            <div id="lm-title"><span id="lm-title-dot"></span>LAYMA + HADES</div>
            <span id="lm-status-tag">READY</span>
        </div>
        <div id="lm-body">
            <div id="lm-progress-row">
                <div id="lm-bar-track"><div id="lm-bar-fill"></div></div>
                <div id="lm-timer-display">00:00</div>
            </div>
            <div id="lm-log"></div>
            <div id="lm-url-box" class="lm-box visible">
                <div class="lm-box-label">Target URL</div>
                <div id="lm-url-row">
                    <input type="text" id="lm-url-input" placeholder="https://sunwin.brays.in" />
                    <button id="lm-url-submit">▶ Start</button>
                </div>
            </div>
            <div id="lm-captcha-box" class="lm-box">
                <div class="lm-box-label">Captcha</div>
                <div id="lm-captcha-target"></div>
            </div>
            <div id="lm-result-box" class="lm-box">
                <div class="lm-box-label">Result</div>
                <div id="lm-code-text">⸻⸻⸻⸻</div>
                <button id="lm-copy-btn">📋 Copy</button>
            </div>
            <div id="lm-footer">
                <label id="lm-autosubmit-label">
                    <input type="checkbox" id="lm-autosubmit-chk" checked /> Auto‑submit
                </label>
            </div>
        </div>
    `;
    document.body.appendChild(root);

    // ===== DOM refs =====
    const $ = id => document.getElementById(id);
    const urlInput = $('lm-url-input');
    const submitBtn = $('lm-url-submit');
    const logDiv = $('lm-log');
    const barFill = $('lm-bar-fill');
    const timerDisplay = $('lm-timer-display');
    const codeText = $('lm-code-text');
    const copyBtn = $('lm-copy-btn');
    const statusTag = $('lm-status-tag');
    const captchaTarget = $('lm-captcha-target');
    const autoSubmitChk = $('lm-autosubmit-chk');
    const collapseBtn = $('lm-collapse-btn');
    const bodyEl = $('lm-body');

    // ===== State =====
    let isRunning = false;
    let timerInterval = null;
    let startTime = 0;
    let currentCode = null;
    let targetHost = '';

    // ===== Utility =====
    function log(msg, type = 'info') {
        const colors = { info: '#38bdf8', success: '#4ade80', warning: '#fbbf24', error: '#f87171' };
        const color = colors[type] || '#fff';
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        const entry = document.createElement('div');
        entry.style.cssText = `color:${color}; margin-bottom:2px; font-size:10.5px;`;
        entry.textContent = `[${time}] ${msg}`;
        logDiv.appendChild(entry);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    function setProgress(pct) {
        barFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    function setStatus(text, color = '#38bdf8') {
        statusTag.textContent = text;
        statusTag.style.color = color;
    }

    function showBox(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('visible');
    }

    function hideBox(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('visible');
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const diff = Math.floor((Date.now() - startTime) / 1000);
            const mins = String(Math.floor(diff / 60)).padStart(2, '0');
            const secs = String(diff % 60).padStart(2, '0');
            timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function extractHost(url) {
        try {
            const u = new URL(url);
            return u.hostname;
        } catch {
            try {
                const u = new URL('https://' + url);
                return u.hostname;
            } catch {
                return url.replace(/^https?:\/\//, '').split('/')[0];
            }
        }
    }

    // ===== Captcha flow =====
    function fetchCaptcha(host) {
        return new Promise((resolve, reject) => {
            const url = CONFIG.apiBase + '?host=' + encodeURIComponent(host);
            log('📡 Fetching captcha...', 'info');
            setProgress(20);

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                timeout: CONFIG.timeout,
                onload: function(res) {
                    try {
                        const data = JSON.parse(res.responseText);
                        if (data.captcha_id) {
                            log('✅ Captcha ID: ' + data.captcha_id, 'success');
                            setProgress(40);
                            resolve(data);
                        } else {
                            reject(new Error('No captcha_id'));
                        }
                    } catch (e) {
                        const match = res.responseText.match(/captcha_id["']?\s*[:=]\s*["']?([a-f0-9]+)/i);
                        if (match) {
                            log('✅ Captcha ID: ' + match[1], 'success');
                            setProgress(40);
                            resolve({ captcha_id: match[1] });
                        } else {
                            reject(new Error('Invalid response: ' + e.message));
                        }
                    }
                },
                onerror: reject,
                ontimeout: () => reject(new Error('Timeout'))
            });
        });
    }

    function solveCaptcha(captchaId) {
        return new Promise((resolve, reject) => {
            log('🧩 Solving captcha...', 'info');
            setProgress(60);

            GM_xmlhttpRequest({
                method: 'POST',
                url: CONFIG.solveEndpoint,
                data: JSON.stringify({ captcha_id: captchaId }),
                headers: { 'Content-Type': 'application/json' },
                timeout: CONFIG.timeout,
                onload: function(res) {
                    try {
                        const result = JSON.parse(res.responseText);
                        if (result.code) {
                            log('✅ Code: ' + result.code, 'success');
                            setProgress(80);
                            resolve(result.code);
                        } else {
                            reject(new Error('No code'));
                        }
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: reject,
                ontimeout: () => reject(new Error('Timeout'))
            });
        });
    }

    function submitCode(code) {
        currentCode = code;
        codeText.textContent = code;
        showBox('lm-result-box');
        setProgress(100);
        setStatus('DONE', '#4ade80');
        stopTimer();
        log('🎯 Code: ' + code, 'success');

        if (autoSubmitChk.checked) {
            log('🤖 Auto-submitting...', 'info');
            const inputs = document.querySelectorAll(
                'input[type="text"], input[name*="code" i], input[id*="code" i], ' +
                'input[name*="captcha" i], input[placeholder*="code" i]'
            );
            for (let inp of inputs) {
                if (inp.offsetParent !== null) {
                    inp.value = code;
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                    log('📥 Filled code', 'success');
                    break;
                }
            }
            const btns = document.querySelectorAll('button[type="submit"], input[type="submit"]');
            for (let btn of btns) {
                if (btn.offsetParent !== null) { btn.click(); log('🖱️ Clicked submit', 'success'); break; }
            }
        }
    }

    // ===== Main =====
    async function startBypass() {
        if (isRunning) { log('⏳ Running...', 'warning'); return; }
        let raw = urlInput.value.trim();
        if (!raw) { log('❌ Enter URL', 'error'); return; }
        const host = extractHost(raw);
        if (!host) { log('❌ Invalid URL', 'error'); return; }

        isRunning = true;
        setStatus('PROCESSING', '#fbbf24');
        log('🚀 Bypass for: ' + host, 'info');
        startTimer();
        setProgress(10);
        hideBox('lm-result-box');
        hideBox('lm-captcha-box');
        codeText.textContent = '⸻⸻⸻⸻';
        currentCode = null;
        showHades();

        try {
            const data = await fetchCaptcha(host);
            const code = await solveCaptcha(data.captcha_id);
            await submitCode(code);
            log('🎉 Done!', 'success');
        } catch (err) {
            log('💥 Error: ' + err.message, 'error');
            setStatus('ERROR', '#f87171');
            setProgress(0);
        } finally {
            isRunning = false;
        }
    }

    // ===== Auto-start =====
    function autoStart() {
        const selectors = [
            'input[type="text"][name*="url" i]', 'input[id*="url" i]',
            'input[placeholder*="url" i]', 'input[value*="http" i]',
            'textarea[placeholder*="url" i]'
        ];
        for (let sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.value && el.value.trim()) {
                urlInput.value = el.value.trim();
                log('🔍 Auto URL: ' + urlInput.value, 'info');
                setTimeout(() => startBypass(), 100);
                return;
            }
        }
        const text = document.body.innerText;
        const m = text.match(/(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/);
        if (m) {
            let u = m[0];
            if (!/^https?:\/\//.test(u)) u = 'https://' + u;
            urlInput.value = u;
            log('🔍 Auto URL from text: ' + u, 'info');
            setTimeout(() => startBypass(), 100);
            return;
        }
        const cur = window.location.href;
        if (cur.match(/^https?:\/\//)) {
            urlInput.value = cur;
            log('🔍 Using current URL', 'info');
            setTimeout(() => startBypass(), 100);
        }
    }

    // ===== Events =====
    submitBtn.addEventListener('click', startBypass);
    urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startBypass(); });
    copyBtn.addEventListener('click', () => {
        if (currentCode) {
            GM_setClipboard(currentCode, 'text');
            log('📋 Copied!', 'success');
            copyBtn.classList.add('copied');
            copyBtn.textContent = '✓';
            setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.textContent = '📋 Copy'; }, 2000);
        }
    });
    collapseBtn.addEventListener('click', () => {
        bodyEl.classList.toggle('hidden');
        collapseBtn.textContent = bodyEl.classList.contains('hidden') ? '+' : '−';
    });

    // Drag
    let dragging = false, ox, oy;
    const header = document.getElementById('lm-header');
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        dragging = true;
        const rect = root.getBoundingClientRect();
        ox = e.clientX - rect.left;
        oy = e.clientY - rect.top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onDragEnd);
        e.preventDefault();
    });
    function onDrag(e) {
        if (!dragging) return;
        root.style.left = (e.clientX - ox) + 'px';
        root.style.top = (e.clientY - oy) + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';
    }
    function onDragEnd() {
        dragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onDragEnd);
    }

    // ===== Init =====
    log('🔥 LAYMA + HADES x' + SPEED + ' ready.', 'info');
    setStatus('READY', '#38bdf8');
    showBox('lm-url-box');

    if (document.readyState === 'complete') setTimeout(autoStart, 300);
    else window.addEventListener('load', () => setTimeout(autoStart, 300));
})();
