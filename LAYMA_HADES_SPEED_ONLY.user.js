// ==UserScript==
// @name         LAYMA BYPASS – Hades Speed
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Bypass captcha, tự động lấy mã từ trang đích (nút LẤY MÃ)
// @author       @tpmodz
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_openInTab
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // ================================================================
    //  HADES SPEED x15
    // ================================================================
    const SPEED = 15;
    const _st = window.setTimeout;
    const _si = window.setInterval;
    const _ct = window.clearTimeout;
    const _ci = window.clearInterval;
    const tm = new Map(), im = new Map();

    window.setTimeout = function(fn, d, ...a) {
        const rd = Math.max(1, Math.floor(d / SPEED));
        const id = _st(() => { if (tm.has(id)) { tm.delete(id); fn(...a); } }, rd);
        tm.set(id, { fn, d, a });
        return id;
    };
    window.setInterval = function(fn, d, ...a) {
        const rd = Math.max(1, Math.floor(d / SPEED));
        const id = _si(() => { if (im.has(id)) fn(...a); }, rd);
        im.set(id, { fn, d, a });
        return id;
    };
    window.clearTimeout = function(id) { if (tm.has(id)) tm.delete(id); _ct(id); };
    window.clearInterval = function(id) { if (im.has(id)) im.delete(id); _ci(id); };

    console.log('[HadesSpeed] x' + SPEED + ' active');

    // ================================================================
    //  TRẠNG THÁI
    // ================================================================
    const STATE_KEY = 'layma_bypass_state';
    let state = GM_getValue(STATE_KEY, null);

    // ================================================================
    //  UI TẠO
    // ================================================================
    function createUI() {
        const style = document.createElement('style');
        style.textContent = `
            #layma-panel {
                position: fixed;
                top: 24px;
                left: 24px;
                z-index: 9999999;
                width: 380px;
                background: rgba(10,10,20,0.95);
                backdrop-filter: blur(18px);
                border: 1px solid rgba(56,189,248,0.25);
                border-radius: 18px;
                box-shadow: 0 24px 70px rgba(0,0,0,0.85);
                font-family: 'Segoe UI', system-ui, sans-serif;
                color: #e8edf5;
                padding: 16px;
                transition: all 0.3s ease;
                user-select: none;
            }
            #layma-panel .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                cursor: move;
            }
            #layma-panel .header .title {
                font-weight: 700;
                font-size: 13px;
                color: #38bdf8;
                letter-spacing: 1px;
            }
            #layma-panel .header .close {
                cursor: pointer;
                color: #888;
                font-size: 18px;
                padding: 0 6px;
                transition: 0.2s;
            }
            #layma-panel .header .close:hover { color: #fff; }
            #layma-panel .log {
                background: rgba(0,0,0,0.4);
                border-radius: 8px;
                padding: 8px 10px;
                height: 80px;
                overflow-y: auto;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                color: #8b9bb5;
                margin-bottom: 10px;
                border: 1px solid rgba(255,255,255,0.05);
                word-break: break-all;
            }
            #layma-panel .log::-webkit-scrollbar { width: 3px; }
            #layma-panel .log::-webkit-scrollbar-thumb { background: #2a3456; border-radius: 99px; }
            #layma-panel .input-row {
                display: flex;
                gap: 6px;
                margin-bottom: 8px;
            }
            #layma-panel .input-row input {
                flex: 1;
                padding: 8px 10px;
                border: 1px solid #2a3456;
                border-radius: 8px;
                background: #1a2236;
                color: #fff;
                font-size: 12px;
                outline: none;
            }
            #layma-panel .input-row input:focus { border-color: #38bdf8; }
            #layma-panel .input-row button {
                padding: 8px 16px;
                border: none;
                border-radius: 8px;
                background: #0284c7;
                color: #fff;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
                transition: 0.12s;
                white-space: nowrap;
            }
            #layma-panel .input-row button:hover { background: #0369a1; }
            #layma-panel .input-row button:disabled { opacity: 0.5; cursor: not-allowed; }
            #layma-panel .progress {
                background: rgba(255,255,255,0.05);
                border-radius: 99px;
                height: 4px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            #layma-panel .progress .bar {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #0369a1, #0ea5e9, #38bdf8);
                transition: width 0.4s;
                border-radius: 99px;
            }
            #layma-panel .status {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #94a3b8;
                margin-bottom: 8px;
            }
            #layma-panel .status .dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 4px;
            }
            #layma-panel .status .dot.ready { background: #38bdf8; }
            #layma-panel .status .dot.running { background: #fbbf24; animation: pulse-dot 1.2s infinite; }
            #layma-panel .status .dot.done { background: #4ade80; }
            #layma-panel .status .dot.error { background: #f87171; }
            @keyframes pulse-dot {
                0%,100% { opacity: 1; }
                50% { opacity: 0.2; }
            }
            #layma-panel .code-result {
                font-size: 22px;
                font-weight: 800;
                color: #4ade80;
                text-align: center;
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
                border: 1px solid rgba(74,222,128,0.2);
                margin-top: 6px;
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
                min-height: 44px;
                display: none;
            }
            #layma-panel .code-result.active { display: block; }
            #layma-panel .captcha-box {
                margin-top: 8px;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
                padding: 10px;
                border: 1px solid rgba(251,191,36,0.2);
                display: none;
            }
            #layma-panel .captcha-box.active { display: block; }
            #layma-panel .captcha-box iframe {
                width: 100%;
                height: 280px;
                border: none;
                border-radius: 6px;
                background: #fff;
            }
            #layma-panel .captcha-box input {
                width: 100%;
                padding: 8px 10px;
                margin-top: 8px;
                border: 1px solid #2a3456;
                border-radius: 6px;
                background: #1a2236;
                color: #fff;
                font-size: 12px;
                outline: none;
            }
            #layma-panel .captcha-box input:focus { border-color: #38bdf8; }
            #layma-panel .captcha-box button {
                width: 100%;
                padding: 8px;
                margin-top: 6px;
                border: none;
                border-radius: 6px;
                background: #f59e0b;
                color: #000;
                font-weight: 600;
                cursor: pointer;
                transition: 0.12s;
            }
            #layma-panel .captcha-box button:hover { background: #d97706; }
            .bypass-btn-copy {
                margin-top: 6px;
                padding: 6px 12px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 6px;
                background: rgba(255,255,255,0.03);
                color: #b0b8c8;
                font-size: 11px;
                cursor: pointer;
                transition: 0.12s;
                width: 100%;
            }
            .bypass-btn-copy:hover { background: rgba(255,255,255,0.08); }
        `;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'layma-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title"><span class="dot ready" id="statusDot"></span>⚡ LAYMA BYPASS</div>
                <div class="close" id="panelClose">✕</div>
            </div>
            <div class="log" id="bypassLog">⏳ Đang khởi tạo...</div>
            <div class="input-row">
                <input type="text" id="targetUrl" placeholder="https://sunwin.brays.in" />
                <button id="btnStart">▶ Start</button>
            </div>
            <div class="progress"><div class="bar" id="progressBar"></div></div>
            <div class="status">
                <span id="statusText">READY</span>
                <span id="timerDisplay">00:00</span>
            </div>
            <div class="code-result" id="codeResult">------</div>
            <button class="bypass-btn-copy" id="btnCopy">📋 Copy code</button>
            <div class="captcha-box" id="captchaBox">
                <iframe id="captchaIframe" src="about:blank"></iframe>
                <input type="text" id="captchaToken" placeholder="Nhập token captcha (hCaptcha response)" />
                <button id="submitCaptchaBtn">✅ Gửi captcha</button>
            </div>
        `;
        document.body.appendChild(panel);

        return {
            panel,
            log: document.getElementById('bypassLog'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            timerDisplay: document.getElementById('timerDisplay'),
            progressBar: document.getElementById('progressBar'),
            targetUrl: document.getElementById('targetUrl'),
            btnStart: document.getElementById('btnStart'),
            btnCopy: document.getElementById('btnCopy'),
            codeResult: document.getElementById('codeResult'),
            captchaBox: document.getElementById('captchaBox'),
            captchaIframe: document.getElementById('captchaIframe'),
            captchaToken: document.getElementById('captchaToken'),
            submitCaptchaBtn: document.getElementById('submitCaptchaBtn'),
            closeBtn: document.getElementById('panelClose')
        };
    }

    const ui = createUI();

    // ================================================================
    //  LOG
    // ================================================================
    function log(msg, type = 'info') {
        const colors = { info: '#38bdf8', success: '#4ade80', warning: '#fbbf24', error: '#f87171' };
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        ui.log.innerHTML += `<div style="color:${colors[type] || '#fff'}">[${time}] ${msg}</div>`;
        ui.log.scrollTop = ui.log.scrollHeight;
    }

    function setStatus(text, type = 'ready') {
        ui.statusText.textContent = text;
        ui.statusDot.className = 'dot ' + type;
    }

    function setProgress(pct) {
        ui.progressBar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    function showResult(code) {
        ui.codeResult.textContent = code;
        ui.codeResult.classList.add('active');
        GM_setClipboard(code, 'text');
        log('📋 Đã tự động copy code', 'success');
    }

    function clearResult() {
        ui.codeResult.classList.remove('active');
        ui.codeResult.textContent = '------';
    }

    // ================================================================
    //  TIMER
    // ================================================================
    let timerInterval = null;
    let startTime = 0;

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const diff = Math.floor((Date.now() - startTime) / 1000);
            const mins = String(Math.floor(diff / 60)).padStart(2, '0');
            const secs = String(diff % 60).padStart(2, '0');
            ui.timerDisplay.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        ui.timerDisplay.textContent = '00:00';
    }

    // ================================================================
    //  CAPTCHA
    // ================================================================
    let pendingCaptchaResolve = null;

    function showCaptcha(iframeSrc) {
        ui.captchaBox.classList.add('active');
        ui.captchaIframe.src = iframeSrc;
        ui.captchaToken.value = '';
        log('🔐 Vui lòng giải captcha và nhập token', 'warning');
        return new Promise((resolve) => {
            pendingCaptchaResolve = resolve;
        });
    }

    ui.submitCaptchaBtn.addEventListener('click', () => {
        const token = ui.captchaToken.value.trim();
        if (!token) {
            log('❌ Vui lòng nhập token captcha', 'error');
            return;
        }
        if (pendingCaptchaResolve) {
            pendingCaptchaResolve(token);
            pendingCaptchaResolve = null;
            ui.captchaBox.classList.remove('active');
            log('✅ Captcha token đã nhận', 'success');
        }
    });

    // ================================================================
    //  MAIN LOGIC – LẤY MÃ TRÊN TRANG ĐÍCH
    // ================================================================
    async function performBypass(url) {
        // Lưu trạng thái để sau khi chuyển hướng, script biết đang bypass
        GM_setValue(STATE_KEY, JSON.stringify({ url, step: 'start' }));

        // Chuyển hướng đến URL target
        window.location.href = url;
    }

    // Hàm này chạy khi đã ở trang target và state có step
    async function executeBypassOnPage() {
        const raw = GM_getValue(STATE_KEY, null);
        if (!raw) return;
        const stateData = JSON.parse(raw);
        if (!stateData || stateData.step !== 'start') return;

        // Đã vào trang đích
        GM_setValue(STATE_KEY, null); // xóa state để khỏi chạy lại khi reload

        const url = stateData.url;
        log('📍 Đã vào trang: ' + url, 'info');
        setStatus('Đang xử lý...', 'running');
        setProgress(10);
        startTimer();

        try {
            // Bước 1: Cuộn xuống cuối trang
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            await sleep(1500);

            // Bước 2: Tìm nút "LẤY MÃ" và click
            const clicked = await clickButton('lấy mã|lay ma|get code|lấy mẫ');
            if (!clicked) {
                log('⚠️ Không thấy nút "LẤY MÃ", thử cuộn lên...', 'warning');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                await sleep(1000);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                await sleep(1500);
                const retry = await clickButton('lấy mã|lay ma|get code|lấy mẫ');
                if (!retry) {
                    throw new Error('Không tìm thấy nút "LẤY MÃ"');
                }
            }
            log('✅ Đã click "LẤY MÃ"', 'success');
            setProgress(30);

            // Bước 3: Chờ captcha hoặc code xuất hiện
            await sleep(2000);

            // Bước 4: Kiểm tra captcha
            const captchaFrame = document.querySelector('iframe[src*="hcaptcha.com"], iframe[src*="recaptcha"]');
            if (captchaFrame) {
                log('🔐 Phát hiện captcha, đang chờ giải...', 'warning');
                setProgress(40);
                const token = await showCaptcha(captchaFrame.src);

                // Inject token vào hCaptcha
                const textarea = document.querySelector('textarea[name="h-captcha-response"]');
                if (textarea) {
                    textarea.value = token;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true }));
                    log('✅ Đã điền token captcha', 'success');
                } else {
                    // Thử postMessage vào iframe
                    const iframe = document.querySelector('iframe[src*="hcaptcha.com"]');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({ type: 'hcaptcha', token }, '*');
                        log('✅ Đã gửi token qua postMessage', 'success');
                    }
                }

                // Click nút xác thực
                await sleep(1000);
                const verifyClicked = await clickButton('xác thực|verify|submit|tiếp tục|continue|xác nhận');
                if (verifyClicked) {
                    log('✅ Đã click nút xác thực', 'success');
                } else {
                    log('⚠️ Không thấy nút xác thực, thử click "LẤY MÃ" lại', 'warning');
                    await clickButton('lấy mã|lay ma|get code');
                }
                await sleep(3000);
            }

            // Bước 5: Lấy code
            setProgress(70);
            const code = await extractCode();
            if (code) {
                log('🎉 Code: ' + code, 'success');
                setProgress(100);
                setStatus('THÀNH CÔNG', 'done');
                showResult(code);
                stopTimer();
            } else {
                throw new Error('Không tìm thấy code');
            }

        } catch (err) {
            log('💥 Lỗi: ' + err.message, 'error');
            setStatus('LỖI', 'error');
            setProgress(0);
            stopTimer();
        } finally {
            ui.btnStart.disabled = false;
            ui.btnStart.textContent = '▶ Start';
            ui.captchaBox.classList.remove('active');
        }
    }

    // ================================================================
    //  HELPERS
    // ================================================================
    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async function clickButton(regexPattern) {
        const regex = new RegExp(regexPattern, 'i');
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"], span[onclick], input[type="button"], input[type="submit"]'));
        for (let btn of buttons) {
            const text = btn.innerText || btn.textContent || btn.value || '';
            if (regex.test(text)) {
                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await sleep(300);
                btn.click();
                return true;
            }
        }
        return false;
    }

    async function extractCode() {
        await sleep(1500);
        const selectors = [
            '#lm-code-text',
            '.code-display',
            '[class*="code"]',
            '[id*="code"]',
            '.result-code',
            '.gift-code',
            '#codeResult',
            '.code-value',
            'div:has(> strong)'
        ];
        for (let sel of selectors) {
            try {
                const el = document.querySelector(sel);
                if (el && el.innerText && el.innerText.trim().length > 2) {
                    return el.innerText.trim();
                }
            } catch (e) {}
        }
        // Quét text
        const body = document.body.innerText;
        const matches = body.match(/[A-Za-z0-9]{6,}/g);
        if (matches) {
            for (let m of matches) {
                if (m.length >= 6 && m.length <= 20 && !/^(http|www|com|vn|net)/i.test(m)) {
                    return m;
                }
            }
            return matches[0];
        }
        return null;
    }

    // ================================================================
    //  AUTO-START (phát hiện URL trong text)
    // ================================================================
    function autoDetectUrl() {
        const selectors = [
            'input[type="text"][name*="url" i]',
            'input[id*="url" i]',
            'input[placeholder*="url" i]',
            'input[value*="http" i]',
            'textarea[placeholder*="url" i]'
        ];
        for (let sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.value && el.value.trim()) {
                ui.targetUrl.value = el.value.trim();
                log('🔍 Phát hiện URL từ input: ' + ui.targetUrl.value, 'info');
                return true;
            }
        }
        const text = document.body.innerText;
        const match = text.match(/(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/);
        if (match) {
            let u = match[0];
            if (!/^https?:\/\//.test(u)) u = 'https://' + u;
            ui.targetUrl.value = u;
            log('🔍 Phát hiện URL từ văn bản: ' + u, 'info');
            return true;
        }
        return false;
    }

    // ================================================================
    //  EVENT UI
    // ================================================================
    ui.btnStart.addEventListener('click', () => {
        const url = ui.targetUrl.value.trim();
        if (!url) {
            log('❌ Vui lòng nhập URL', 'error');
            return;
        }
        ui.btnStart.disabled = true;
        ui.btnStart.textContent = '⏳ Đang xử lý...';
        clearResult();
        log('🚀 Bắt đầu bypass cho: ' + url, 'info');
        setStatus('Đang chuyển hướng...', 'running');
        setProgress(5);
        performBypass(url);
    });

    ui.btnCopy.addEventListener('click', () => {
        const code = ui.codeResult.textContent;
        if (code && code !== '------') {
            GM_setClipboard(code, 'text');
            log('📋 Đã copy code', 'success');
        } else {
            log('⚠️ Chưa có code', 'warning');
        }
    });

    ui.closeBtn.addEventListener('click', () => {
        ui.panel.style.display = 'none';
    });

    // ================================================================
    //  DRAG
    // ================================================================
    let dragging = false, ox, oy;
    const header = ui.panel.querySelector('.header');
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.close')) return;
        dragging = true;
        const rect = ui.panel.getBoundingClientRect();
        ox = e.clientX - rect.left;
        oy = e.clientY - rect.top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onDragEnd);
        e.preventDefault();
    });
    function onDrag(e) {
        if (!dragging) return;
        ui.panel.style.left = (e.clientX - ox) + 'px';
        ui.panel.style.top = (e.clientY - oy) + 'px';
        ui.panel.style.right = 'auto';
        ui.panel.style.bottom = 'auto';
    }
    function onDragEnd() {
        dragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onDragEnd);
    }

    // ================================================================
    //  KHỞI TẠO
    // ================================================================
    log('🔥 LAYMA BYPASS – Hades Speed x' + SPEED, 'info');
    setStatus('READY', 'ready');
    setProgress(0);

    // Kiểm tra nếu đang trong chế độ bypass (đã được chuyển hướng từ start)
    const stateRaw = GM_getValue(STATE_KEY, null);
    if (stateRaw) {
        const stateData = JSON.parse(stateRaw);
        if (stateData && stateData.step === 'start') {
            // Chạy bypass ngay trên trang này
            setTimeout(() => {
                executeBypassOnPage();
            }, 300);
        }
    } else {
        // Tự động phát hiện URL nếu chưa có state
        if (autoDetectUrl()) {
            log('ℹ️ Đã tự động phát hiện URL, bạn có thể bấm Start', 'info');
        } else {
            log('📌 Nhập URL target và bấm Start', 'info');
        }
    }
})();
