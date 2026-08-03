// ==UserScript==
// @name         SUNWIN BYPASS – TỰ ĐỘNG LẤY MÃ (Hades Speed)
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Tự động cuộn, bấm lấy mã, bắt captcha, lấy code
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
    //  HADES SPEED x15
    // =============================================================
    const SPEED = 15;
    const _st = window.setTimeout;
    const _si = window.setInterval;
    const _ct = window.clearTimeout;
    const _ci = window.clearInterval;
    const tm = new Map(),
        im = new Map();

    window.setTimeout = function(fn, d, ...a) {
        const rd = Math.max(1, Math.floor(d / SPEED));
        const id = _st(() => { if (tm.has(id)) { tm.delete(id);
                fn(...a); } }, rd);
        tm.set(id, { fn, d, a });
        return id;
    };
    window.setInterval = function(fn, d, ...a) {
        const rd = Math.max(1, Math.floor(d / SPEED));
        const id = _si(() => { if (im.has(id)) fn(...a); }, rd);
        im.set(id, { fn, d, a });
        return id;
    };
    window.clearTimeout = function(id) { if (tm.has(id)) tm.delete(id);
        _ct(id); };
    window.clearInterval = function(id) { if (im.has(id)) im.delete(id);
        _ci(id); };

    console.log('[HadesSpeed] x' + SPEED + ' active');

    // =============================================================
    //  UI – BẢNG ĐIỀU KHIỂN
    // =============================================================
    function createUI() {
        const style = document.createElement('style');
        style.textContent = `
            #sunwin-bypass-panel {
                position: fixed; bottom: 20px; right: 20px;
                z-index: 9999999;
                width: 340px;
                background: rgba(10,10,20,0.95);
                backdrop-filter: blur(18px);
                border: 1px solid rgba(56,189,248,0.25);
                border-radius: 16px;
                box-shadow: 0 12px 48px rgba(0,0,0,0.8);
                font-family: 'Segoe UI', system-ui, sans-serif;
                color: #e8edf5;
                padding: 16px;
                transition: all 0.3s ease;
                user-select: none;
            }
            #sunwin-bypass-panel .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                cursor: move;
            }
            #sunwin-bypass-panel .header .title {
                font-weight: 700;
                font-size: 13px;
                color: #38bdf8;
                letter-spacing: 1px;
            }
            #sunwin-bypass-panel .header .close {
                cursor: pointer;
                color: #888;
                font-size: 18px;
                padding: 0 6px;
                transition: 0.2s;
            }
            #sunwin-bypass-panel .header .close:hover { color: #fff; }
            #sunwin-bypass-panel .log {
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
            #sunwin-bypass-panel .log::-webkit-scrollbar { width: 3px; }
            #sunwin-bypass-panel .log::-webkit-scrollbar-thumb { background: #2a3456; border-radius: 99px; }
            #sunwin-bypass-panel .actions {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            #sunwin-bypass-panel .actions button {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 12px;
                cursor: pointer;
                transition: 0.12s;
                min-width: 60px;
            }
            #sunwin-bypass-panel .actions .btn-start {
                background: #0284c7;
                color: #fff;
            }
            #sunwin-bypass-panel .actions .btn-start:hover { background: #0369a1; }
            #sunwin-bypass-panel .actions .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }
            #sunwin-bypass-panel .actions .btn-copy {
                background: rgba(255,255,255,0.07);
                color: #b0b8c8;
                border: 1px solid rgba(255,255,255,0.08);
            }
            #sunwin-bypass-panel .actions .btn-copy:hover { background: rgba(255,255,255,0.15); }
            #sunwin-bypass-panel .code-display {
                font-size: 22px;
                font-weight: 800;
                color: #4ade80;
                text-align: center;
                padding: 10px;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
                border: 1px solid rgba(74,222,128,0.2);
                margin-top: 8px;
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
                min-height: 50px;
                display: none;
            }
            #sunwin-bypass-panel .code-display.active { display: block; }
            #sunwin-bypass-panel .captcha-area {
                margin-top: 10px;
                display: none;
                background: rgba(0,0,0,0.3);
                border-radius: 8px;
                padding: 10px;
                border: 1px solid rgba(251,191,36,0.2);
            }
            #sunwin-bypass-panel .captcha-area.active { display: block; }
            #sunwin-bypass-panel .captcha-area iframe {
                width: 100%;
                height: 300px;
                border: none;
                border-radius: 6px;
                background: #fff;
            }
            #sunwin-bypass-panel .captcha-area input {
                width: 100%;
                padding: 8px 10px;
                margin-top: 8px;
                border: 1px solid #2a3456;
                border-radius: 6px;
                background: #1a2236;
                color: #fff;
                font-size: 13px;
                outline: none;
            }
            #sunwin-bypass-panel .captcha-area input:focus { border-color: #38bdf8; }
            #sunwin-bypass-panel .captcha-area button {
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
            #sunwin-bypass-panel .captcha-area button:hover { background: #d97706; }
            .status-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 6px;
                animation: pulse-dot 1.2s infinite;
            }
            @keyframes pulse-dot {
                0%,100% { opacity: 1; }
                50% { opacity: 0.2; }
            }
            .status-dot.ready { background: #38bdf8; }
            .status-dot.running { background: #fbbf24; }
            .status-dot.done { background: #4ade80; animation: none; }
            .status-dot.error { background: #f87171; animation: none; }
        `;
        document.head.appendChild(style);

        const panel = document.createElement('div');
        panel.id = 'sunwin-bypass-panel';
        panel.innerHTML = `
            <div class="header">
                <div class="title"><span class="status-dot ready" id="statusDot"></span>⚡ SUNWIN BYPASS</div>
                <div class="close" id="panelClose">✕</div>
            </div>
            <div class="log" id="bypassLog">⏳ Sẵn sàng...</div>
            <div class="captcha-area" id="captchaArea">
                <iframe id="captchaIframe" src="about:blank"></iframe>
                <input type="text" id="captchaToken" placeholder="Nhập token captcha (hCaptcha response)" />
                <button id="submitCaptchaBtn">✅ Gửi captcha đã giải</button>
            </div>
            <div class="code-display" id="codeDisplay">------</div>
            <div class="actions">
                <button class="btn-start" id="btnStart">▶ Bắt đầu</button>
                <button class="btn-copy" id="btnCopy">📋 Copy</button>
            </div>
        `;
        document.body.appendChild(panel);

        return {
            panel,
            log: document.getElementById('bypassLog'),
            statusDot: document.getElementById('statusDot'),
            btnStart: document.getElementById('btnStart'),
            btnCopy: document.getElementById('btnCopy'),
            codeDisplay: document.getElementById('codeDisplay'),
            captchaArea: document.getElementById('captchaArea'),
            captchaIframe: document.getElementById('captchaIframe'),
            captchaToken: document.getElementById('captchaToken'),
            submitCaptchaBtn: document.getElementById('submitCaptchaBtn'),
            closeBtn: document.getElementById('panelClose')
        };
    }

    const ui = createUI();

    // =============================================================
    //  STATE
    // =============================================================
    let isRunning = false;
    let currentCode = null;
    let pendingCaptchaResolve = null;

    // =============================================================
    //  LOG
    // =============================================================
    function log(msg, type = 'info') {
        const colors = { info: '#38bdf8', success: '#4ade80', warning: '#fbbf24', error: '#f87171' };
        const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
        ui.log.innerHTML += `<div style="color:${colors[type] || '#fff'}">[${time}] ${msg}</div>`;
        ui.log.scrollTop = ui.log.scrollHeight;
    }

    function setStatus(type) {
        ui.statusDot.className = 'status-dot ' + type;
    }

    // =============================================================
    //  CAPTCHA HANDLING
    // =============================================================
    function showCaptcha(iframeSrc) {
        ui.captchaArea.classList.add('active');
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
            ui.captchaArea.classList.remove('active');
            log('✅ Captcha token đã nhận', 'success');
        }
    });

    // =============================================================
    //  MAIN LOGIC – TỰ ĐỘNG LẤY MÃ TRÊN TRANG
    // =============================================================
    async function startBypass() {
        if (isRunning) {
            log('⏳ Đang chạy, vui lòng đợi', 'warning');
            return;
        }

        isRunning = true;
        ui.btnStart.disabled = true;
        ui.btnStart.textContent = '⏳ Đang chạy...';
        setStatus('running');
        log('🚀 Bắt đầu lấy mã...', 'info');

        // Ẩn kết quả cũ
        ui.codeDisplay.classList.remove('active');
        ui.codeDisplay.textContent = '------';
        currentCode = null;

        try {
            // Bước 1: Cuộn xuống cuối trang
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            await sleep(1500);

            // Bước 2: Tìm nút "Lấy mã" và click
            const clicked = await clickButton('lấy mã|lay ma|get code|lấy mẫ');
            if (!clicked) {
                log('⚠️ Không tìm thấy nút "Lấy mã", thử cuộn lại...', 'warning');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                await sleep(1000);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                await sleep(1500);
                const retry = await clickButton('lấy mã|lay ma|get code|lấy mẫ');
                if (!retry) {
                    throw new Error('Không tìm thấy nút "Lấy mã"');
                }
            }
            log('✅ Đã click "Lấy mã"', 'success');

            // Bước 3: Chờ captcha hoặc code xuất hiện
            await sleep(2000);

            // Bước 4: Kiểm tra captcha
            const captchaFrame = document.querySelector('iframe[src*="hcaptcha.com"], iframe[src*="recaptcha"]');
            if (captchaFrame) {
                log('🔐 Phát hiện captcha, đang chờ giải...', 'warning');
                const token = await showCaptcha(captchaFrame.src);

                // Inject token vào hCaptcha
                const textarea = document.querySelector('textarea[name="h-captcha-response"]');
                if (textarea) {
                    textarea.value = token;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true }));
                    log('✅ Đã điền token captcha', 'success');
                } else {
                    log('⚠️ Không tìm thấy input captcha, thử tìm iframe', 'warning');
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
                    log('⚠️ Không tìm thấy nút xác thực, thử click nút "Lấy mã" lại', 'warning');
                    await clickButton('lấy mã|lay ma|get code');
                }
                await sleep(3000);
            }

            // Bước 5: Lấy code từ trang
            const code = await extractCode();
            if (code) {
                currentCode = code;
                ui.codeDisplay.textContent = code;
                ui.codeDisplay.classList.add('active');
                log('🎉 Code: ' + code, 'success');
                setStatus('done');
                // Copy tự động
                GM_setClipboard(code, 'text');
                log('📋 Đã tự động copy code', 'success');
            } else {
                throw new Error('Không tìm thấy code');
            }

        } catch (err) {
            log('💥 Lỗi: ' + err.message, 'error');
            setStatus('error');
        } finally {
            isRunning = false;
            ui.btnStart.disabled = false;
            ui.btnStart.textContent = '▶ Bắt đầu';
            ui.captchaArea.classList.remove('active');
        }
    }

    // =============================================================
    //  HELPERS
    // =============================================================
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
        // Đợi một chút để code xuất hiện
        await sleep(1000);

        const selectors = [
            '#lm-code-text',
            '.code-display',
            '[class*="code"]',
            '[id*="code"]',
            '.result-code',
            '.gift-code',
            'div:has(> strong)',
            '.code-result',
            '#codeResult',
            '.code-value'
        ];

        for (let sel of selectors) {
            try {
                const el = document.querySelector(sel);
                if (el && el.innerText && el.innerText.trim().length > 2) {
                    return el.innerText.trim();
                }
            } catch (e) {}
        }

        // Nếu không tìm thấy, quét toàn bộ text
        const body = document.body.innerText;
        const match = body.match(/[A-Za-z0-9]{6,}/);
        if (match) {
            // Lọc ra những chuỗi có vẻ là code (không phải từ thông thường)
            const candidates = match.filter(s => s.length >= 6 && s.length <= 20);
            if (candidates.length > 0) return candidates[0];
            return match[0];
        }
        return null;
    }

    // =============================================================
    //  UI EVENTS
    // =============================================================
    ui.btnStart.addEventListener('click', startBypass);

    ui.btnCopy.addEventListener('click', () => {
        if (currentCode) {
            GM_setClipboard(currentCode, 'text');
            log('📋 Đã copy code', 'success');
        } else {
            log('⚠️ Chưa có code để copy', 'warning');
        }
    });

    ui.closeBtn.addEventListener('click', () => {
        ui.panel.style.display = 'none';
    });

    // =============================================================
    //  DRAG PANEL
    // =============================================================
    let isDragging = false,
        offsetX, offsetY;
    const header = ui.panel.querySelector('.header');
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.close')) return;
        isDragging = true;
        const rect = ui.panel.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onDragEnd);
        e.preventDefault();
    });

    function onDrag(e) {
        if (!isDragging) return;
        ui.panel.style.right = 'auto';
        ui.panel.style.bottom = 'auto';
        ui.panel.style.left = (e.clientX - offsetX) + 'px';
        ui.panel.style.top = (e.clientY - offsetY) + 'px';
    }

    function onDragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onDragEnd);
    }

    // =============================================================
    //  AUTO-START
    // =============================================================
    function autoStartIfOnTarget() {
        const url = window.location.href;
        if (url.includes('sunwin') || url.includes('brays.in')) {
            log('🔍 Phát hiện trang Sunwin, tự động bắt đầu sau 1.5s', 'info');
            setTimeout(startBypass, 1500 / SPEED);
        } else {
            log('📌 Đang ở trang: ' + url, 'info');
            log('ℹ️ Nếu đây là trang cần bypass, bấm "Bắt đầu"', 'info');
        }
    }

    log('🔥 SUNWIN BYPASS LOADED – Hades Speed x' + SPEED, 'info');
    setStatus('ready');

    if (document.readyState === 'complete') {
        setTimeout(autoStartIfOnTarget, 500);
    } else {
        window.addEventListener('load', () => setTimeout(autoStartIfOnTarget, 500));
    }
})();
