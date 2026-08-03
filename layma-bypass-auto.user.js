// ==UserScript==
// @name         LAYMA + HADES BYPASS – TỐI THƯỢNG
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Tự động bypass captcha layma, tích hợp Hades speed, timeout 60s
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

    // =====================================================
    //  CẤU HÌNH
    // =====================================================
    const CONFIG = {
        apiBase: 'https://layma.net/Traffic/Index/',
        solveEndpoint: 'https://layma.net/Traffic/Solve/',
        timeout: 15000,           // timeout cho mỗi request
        totalTimeout: 60,         // tổng thời gian tối đa để lấy mã (giây)
        autoStart: true,
        autoSubmit: true,
        debug: false
    };

    // =====================================================
    //  HADES NOTIFICATION (kế thừa từ code speed)
    // =====================================================
    let hadesShown = false;

    function showHadesNotification(message = 'Cảm ơn bạn đã sử dụng code by Hades.') {
        if (hadesShown) return;
        hadesShown = true;

        const id = 'hades-bypass-notification';
        if (document.getElementById(id)) return;

        const container = document.createElement('div');
        container.id = id;
        container.style.cssText = `
            position: fixed;
            top: 25px;
            right: 25px;
            background-color: rgba(30, 35, 50, 0.85);
            color: #e0e0e0;
            padding: 14px 20px;
            border-radius: 14px;
            z-index: 2147483647;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            font-family: 'Segoe UI', 'Roboto', sans-serif;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.12);
            display: flex;
            align-items: center;
            gap: 16px;
            opacity: 0;
            transform: translateX(120%);
            transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
            max-width: 420px;
        `;

        const style = document.createElement('style');
        style.textContent = `
            #${id}.visible {
                opacity: 1;
                transform: translateX(0);
            }
            #${id} .hades-icon {
                width: 28px;
                height: 28px;
                color: #a955ff;
                flex-shrink: 0;
            }
            #${id} .hades-content {
                display: flex;
                flex-direction: column;
                flex: 1;
            }
            #${id} .hades-title {
                font-size: 15px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 0.3px;
            }
            #${id} .hades-message {
                font-size: 13px;
                color: #b0b8c8;
                margin-top: 2px;
            }
            #${id} .hades-close {
                font-size: 26px;
                color: #888;
                cursor: pointer;
                padding: 0 6px;
                margin-left: 8px;
                font-weight: 300;
                transition: color 0.2s ease;
                line-height: 1;
            }
            #${id} .hades-close:hover {
                color: #fff;
            }
            #${id} .hades-timer {
                font-size: 14px;
                font-weight: 700;
                color: #fbbf24;
                margin-top: 4px;
            }
        `;
        document.head.appendChild(style);

        container.innerHTML = `
            <div class="hades-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.829 15.632l-1.98-1.144c-.23-.132-.383-.377-.383-.644v-2.288c0-1.851-1.202-3.436-2.92-3.992.052-.224.079-.456.079-.691 0-.968-.38-1.851-.989-2.497l-.001-.001c-.61-.647-1.488-1.03-2.45-1.03s-1.841.383-2.451 1.031c-.609.646-.989 1.529-.989 2.497 0 .235.027.467.079.691-1.718.556-2.92 2.141-2.92 3.992v2.288c0 .267-.153.512-.383.644l-1.98 1.144c-.293.17-.411.536-.296.861.115.324.418.536.759.536h14.9c.341 0 .644-.212.759-.536.115-.325-.003-.691-.296-.861zM12 22c1.105 0 2-.895 2-2h-4c0 1.105.895 2 2 2z"/>
                </svg>
            </div>
            <div class="hades-content">
                <div class="hades-title">🔥 HadesBypass Đã Kích Hoạt</div>
                <div class="hades-message">${message}</div>
                <div class="hades-timer">⏳ Thời gian còn lại: <span id="hades-timer-count">60</span>s</div>
            </div>
            <div class="hades-close" title="Đóng">×</div>
        `;
        document.body.appendChild(container);

        // Hiển thị sau 100ms
        setTimeout(() => container.classList.add('visible'), 100);

        // Xử lý đóng
        const closeBtn = container.querySelector('.hades-close');
        closeBtn.addEventListener('click', () => {
            container.classList.remove('visible');
            setTimeout(() => container.remove(), 500);
            hadesShown = false;
        });

        // Tự động đóng sau 60 giây (khi hết thời gian)
        setTimeout(() => {
            if (container.parentNode) {
                container.classList.remove('visible');
                setTimeout(() => container.remove(), 500);
                hadesShown = false;
            }
        }, CONFIG.totalTimeout * 1000 + 500);

        // Cập nhật timer đếm ngược
        let remaining = CONFIG.totalTimeout;
        const timerEl = document.getElementById('hades-timer-count');
        const interval = setInterval(() => {
            remaining--;
            if (timerEl) timerEl.textContent = remaining;
            if (remaining <= 0) {
                clearInterval(interval);
                // Cập nhật thông báo hết giờ
                const msg = container.querySelector('.hades-message');
                if (msg) msg.textContent = '⏰ Đã hết thời gian! Vui lòng thử lại.';
                const timerDiv = container.querySelector('.hades-timer');
                if (timerDiv) timerDiv.style.display = 'none';
            }
        }, 1000);
    }

    // =====================================================
    //  CSS CHÍNH (LAYMA UI)
    // =====================================================
    const style = document.createElement('style');
    style.textContent = `
        #lm-root, #lm-root * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        #lm-root {
            position: fixed;
            top: 24px;
            left: 24px;
            z-index: 9999999;
            width: 380px;
            background: rgba(10, 10, 20, 0.92);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(56, 189, 248, 0.25);
            border-radius: 18px;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.85);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #e8edf5;
            user-select: none;
            transition: all 0.25s ease;
        }
        #lm-root * { box-sizing: border-box; }
        #lm-header {
            display: flex;
            align-items: center;
            padding: 10px 14px 10px 12px;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            cursor: move;
            gap: 10px;
        }
        #lm-collapse-btn {
            width: 26px; height: 26px;
            border-radius: 50%;
            border: 1px solid rgba(56, 189, 248, 0.2);
            background: rgba(56, 189, 248, 0.06);
            color: #38bdf8;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            transition: 0.2s;
        }
        #lm-collapse-btn:hover {
            background: rgba(56, 189, 248, 0.18);
            transform: scale(1.12);
        }
        #lm-title {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 11.5px;
            letter-spacing: 1.8px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.85);
        }
        #lm-title-dot {
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18), 0 0 12px rgba(34, 197, 94, 0.4);
            animation: lm-pulse 2.4s ease-in-out infinite;
        }
        @keyframes lm-pulse {
            0%, 100% { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.18), 0 0 12px rgba(34, 197, 94, 0.4); }
            50%      { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.06), 0 0 24px rgba(34, 197, 94, 0.25); }
        }
        #lm-status-tag {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.6px;
            padding: 3px 10px;
            border-radius: 99px;
            background: rgba(56, 189, 248, 0.13);
            border: 1px solid rgba(56, 189, 248, 0.18);
            color: #7dd3fc;
            text-transform: uppercase;
            white-space: nowrap;
            transition: background 0.35s, color 0.35s, border-color 0.35s;
        }
        #lm-body {
            padding: 14px 16px 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        #lm-body.hidden { display: none; }
        #lm-progress-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        #lm-bar-track {
            flex: 1;
            height: 5px;
            border-radius: 99px;
            background: rgba(255, 255, 255, 0.06);
            overflow: hidden;
        }
        #lm-bar-fill {
            height: 100%;
            width: 0%;
            border-radius: 99px;
            background: linear-gradient(90deg, #0369a1, #0ea5e9, #38bdf8, #7dd3fc);
            background-size: 300% 100%;
            transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            animation: lm-shimmer 3s linear infinite;
        }
        @keyframes lm-shimmer {
            0%   { background-position: 300% center; }
            100% { background-position: -300% center; }
        }
        #lm-timer-display {
            font-family: 'SF Mono', 'Fira Code', monospace;
            font-weight: 800;
            font-size: 14px;
            color: #38bdf8;
            min-width: 48px;
            text-align: right;
            letter-spacing: 0.5px;
            text-shadow: 0 0 14px rgba(56, 189, 248, 0.35);
        }
        #lm-log {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 10px;
            padding: 8px 11px;
            height: 90px;
            overflow-y: auto;
            font-family: 'SF Mono', 'Fira Code', monospace;
            font-size: 10.5px;
            line-height: 1.65;
            color: rgba(255, 255, 255, 0.6);
            word-break: break-all;
        }
        #lm-log::-webkit-scrollbar { width: 3px; }
        #lm-log::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.2); border-radius: 99px; }
        .lm-box {
            display: flex;
            flex-direction: column;
            border-radius: 12px;
            overflow: hidden;
            max-height: 0;
            opacity: 0;
            padding: 0;
            border: 0px solid transparent;
            transition: max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.28s ease,
                        padding 0.32s ease,
                        border-width 0.32s ease;
        }
        .lm-box.visible {
            max-height: 200px;
            opacity: 1;
            padding: 12px;
            border-width: 1px;
            background: rgba(0, 0, 0, 0.2);
            border-color: rgba(56, 189, 248, 0.12);
            gap: 8px;
        }
        .lm-box-label {
            font-size: 10px;
            font-weight: 600;
            color: rgba(125, 211, 252, 0.75);
            text-transform: uppercase;
            letter-spacing: 1.2px;
        }
        #lm-url-row {
            display: flex;
            gap: 6px;
        }
        #lm-url-input {
            flex: 1;
            padding: 7px 11px;
            border: 1px solid rgba(56, 189, 248, 0.15);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.35);
            color: rgba(255, 255, 255, 0.85);
            font-size: 11.5px;
            outline: none;
            transition: 0.15s;
        }
        #lm-url-input:focus {
            border-color: rgba(56, 189, 248, 0.45);
            box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
        }
        #lm-url-input::placeholder { color: rgba(255, 255, 255, 0.2); }
        #lm-url-submit {
            padding: 7px 16px;
            border-radius: 8px;
            border: none;
            background: #0284c7;
            color: #fff;
            font-size: 11.5px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: 0.12s;
        }
        #lm-url-submit:hover { background: #0369a1; transform: translateY(-1px); }
        #lm-url-submit:active { transform: none; }
        #lm-captcha-target img {
            max-width: 100%;
            border-radius: 6px;
        }
        #lm-code-text {
            font-family: 'SF Mono', monospace;
            font-size: 22px;
            font-weight: 800;
            color: #fff;
            letter-spacing: 3px;
            text-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
            word-break: break-all;
        }
        #lm-copy-btn {
            padding: 5px 20px;
            border-radius: 99px;
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.75);
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.12s;
            align-self: flex-start;
        }
        #lm-copy-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-1px);
        }
        #lm-copy-btn.copied {
            background: rgba(34, 197, 94, 0.2);
            border-color: rgba(34, 197, 94, 0.3);
            color: #86efac;
        }
        #lm-footer {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 10.5px;
            color: rgba(255, 255, 255, 0.3);
        }
        #lm-autosubmit-label {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: 0.15s;
        }
        #lm-autosubmit-label:hover { color: rgba(255, 255, 255, 0.6); }
        #lm-autosubmit-chk {
            accent-color: #0284c7;
            width: 13px;
            height: 13px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // =====================================================
    //  TẠO UI
    // =====================================================
    const root = document.createElement('div');
    root.id = 'lm-root';
    root.innerHTML = `
        <div id="lm-header">
            <button id="lm-collapse-btn">−</button>
            <div id="lm-title">
                <span id="lm-title-dot"></span>
                LAYMA + HADES
            </div>
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
                    <input type="text" id="lm-url-input" placeholder="https://example.com/target" />
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
                    <input type="checkbox" id="lm-autosubmit-chk" checked />
                    Auto‑submit
                </label>
            </div>
        </div>
    `;
    document.body.appendChild(root);

    // =====================================================
    //  DOM REFS
    // =====================================================
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

    // =====================================================
    //  STATE
    // =====================================================
    let isRunning = false;
    let timerInterval = null;
    let startTime = 0;
    let currentCode = null;
    let targetUrl = '';
    let captchaId = null;
    let totalTimeoutId = null;

    // =====================================================
    //  UTILITY
    // =====================================================
    function log(msg, type = 'info') {
        const colors = {
            info: '#38bdf8',
            success: '#4ade80',
            warning: '#fbbf24',
            error: '#f87171'
        };
        const color = colors[type] || '#ffffff';
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
        statusTag.style.background = `rgba(56,189,248,0.13)`;
        statusTag.style.borderColor = `rgba(56,189,248,0.18)`;
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

    // =====================================================
    //  CAPTCHA FLOW
    // =====================================================
    function fetchCaptcha() {
        return new Promise((resolve, reject) => {
            const url = CONFIG.apiBase + '?host=' + encodeURIComponent(targetUrl);
            log('📡 Fetching captcha from ' + url, 'info');
            setProgress(20);

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                timeout: CONFIG.timeout,
                onload: function(res) {
                    try {
                        const data = JSON.parse(res.responseText);
                        if (data.captcha_id) {
                            captchaId = data.captcha_id;
                            log('✅ Captcha ID: ' + captchaId, 'success');
                            setProgress(40);
                            resolve(data);
                        } else {
                            reject(new Error('No captcha_id in response'));
                        }
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: function(err) {
                    log('❌ Network error: ' + err, 'error');
                    reject(err);
                },
                ontimeout: function() {
                    log('⏱️ Request timeout', 'error');
                    reject(new Error('Timeout'));
                }
            });
        });
    }

    function solveCaptcha(captchaData) {
        return new Promise((resolve, reject) => {
            const solveUrl = CONFIG.solveEndpoint;
            log('🧩 Solving captcha...', 'info');
            setProgress(60);

            GM_xmlhttpRequest({
                method: 'POST',
                url: solveUrl,
                data: JSON.stringify({ captcha_id: captchaId }),
                headers: { 'Content-Type': 'application/json' },
                timeout: CONFIG.timeout,
                onload: function(res) {
                    try {
                        const result = JSON.parse(res.responseText);
                        if (result.code) {
                            log('✅ Captcha solved! Code: ' + result.code, 'success');
                            setProgress(80);
                            resolve(result.code);
                        } else {
                            reject(new Error('No code in solve response'));
                        }
                    } catch (e) {
                        reject(e);
                    }
                },
                onerror: reject,
                ontimeout: () => reject(new Error('Solve timeout'))
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
        log('🎯 Code received: ' + code, 'success');

        if (autoSubmitChk.checked) {
            log('🤖 Auto‑submitting code...', 'info');
            const inputs = document.querySelectorAll(
                'input[type="text"], input:not([type]), ' +
                'input[name*="code" i], input[id*="code" i], ' +
                'input[name*="captcha" i], input[id*="captcha" i], ' +
                'input[placeholder*="code" i], input[placeholder*="captcha" i]'
            );
            let filled = false;
            for (let inp of inputs) {
                if (inp.offsetParent !== null) {
                    inp.value = code;
                    inp.dispatchEvent(new Event('input', { bubbles: true }));
                    inp.dispatchEvent(new Event('change', { bubbles: true }));
                    log('📥 Filled code into ' + (inp.id || inp.name || 'input'), 'success');
                    filled = true;
                    break;
                }
            }
            if (!filled) {
                log('⚠️ No visible input found to fill code', 'warning');
            }

            const btns = document.querySelectorAll(
                'button[type="submit"], input[type="submit"], ' +
                'button:not([type])[onclick], button:not([type])[class*="submit"]'
            );
            for (let btn of btns) {
                if (btn.offsetParent !== null) {
                    btn.click();
                    log('🖱️ Clicked submit button', 'success');
                    break;
                }
            }
            const forms = document.querySelectorAll('form');
            for (let form of forms) {
                if (form.offsetParent !== null) {
                    form.submit();
                    log('📤 Submitted form', 'success');
                    break;
                }
            }
        }
    }

    // =====================================================
    //  MAIN – CÓ TIMEOUT 60s
    // =====================================================
    async function startBypass() {
        if (isRunning) {
            log('⏳ Already running, please wait', 'warning');
            return;
        }
        targetUrl = urlInput.value.trim();
        if (!targetUrl) {
            log('❌ Please enter a valid URL', 'error');
            return;
        }
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }
        isRunning = true;
        setStatus('PROCESSING', '#fbbf24');
        log('🚀 Starting bypass for: ' + targetUrl, 'info');
        startTimer();
        setProgress(10);
        hideBox('lm-result-box');
        hideBox('lm-captcha-box');
        codeText.textContent = '⸻⸻⸻⸻';
        currentCode = null;

        // HIỂN THỊ HADES NOTIFICATION – bắt đầu đếm 60s
        showHadesNotification(`Đang xử lý: ${targetUrl}`);

        // Đặt timeout tổng 60 giây
        let timedOut = false;
        totalTimeoutId = setTimeout(() => {
            timedOut = true;
            log('⏰ Đã quá 60 giây! Hủy bỏ quá trình.', 'error');
            setStatus('TIMEOUT', '#f87171');
            setProgress(0);
            isRunning = false;
            stopTimer();
            // Cập nhật notification
            const notif = document.getElementById('hades-bypass-notification');
            if (notif) {
                const msg = notif.querySelector('.hades-message');
                if (msg) msg.textContent = '⏰ Hết thời gian! Vui lòng thử lại.';
                const timerDiv = notif.querySelector('.hades-timer');
                if (timerDiv) timerDiv.style.display = 'none';
            }
        }, CONFIG.totalTimeout * 1000);

        try {
            const captchaData = await fetchCaptcha();
            if (timedOut) return;
            if (captchaData.image) {
                captchaTarget.innerHTML = `<img src="${captchaData.image}" />`;
                showBox('lm-captcha-box');
            }
            const code = await solveCaptcha(captchaData);
            if (timedOut) return;
            await submitCode(code);
            log('🎉 Bypass completed successfully!', 'success');
            clearTimeout(totalTimeoutId);
        } catch (err) {
            if (!timedOut) {
                log('💥 Error: ' + err.message, 'error');
                setStatus('ERROR', '#f87171');
                setProgress(0);
            }
        } finally {
            if (!timedOut) {
                clearTimeout(totalTimeoutId);
            }
            isRunning = false;
        }
    }

    // =====================================================
    //  AUTO-START – PHÁT HIỆN URL
    // =====================================================
    function autoStart() {
        if (!CONFIG.autoStart) return;

        // 1. Tìm trong input
        const inputSelectors = [
            'input[type="text"][name*="url" i]',
            'input[id*="url" i]',
            'input[placeholder*="url" i]',
            'input[placeholder*="link" i]',
            'input[name*="target" i]',
            'input[id*="target" i]',
            'input[value*="http" i]',
            'textarea[placeholder*="url" i]',
            'textarea[placeholder*="link" i]'
        ];
        for (let sel of inputSelectors) {
            const el = document.querySelector(sel);
            if (el && el.value && el.value.trim()) {
                urlInput.value = el.value.trim();
                log('🔍 Phát hiện URL từ input: ' + urlInput.value, 'info');
                setTimeout(() => startBypass(), 1500);
                return;
            }
        }

        // 2. Tìm trong text
        const text = document.body.innerText;
        const urlMatch = text.match(/(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/);
        if (urlMatch) {
            let foundUrl = urlMatch[0];
            if (!/^https?:\/\//.test(foundUrl)) foundUrl = 'https://' + foundUrl;
            urlInput.value = foundUrl;
            log('🔍 Phát hiện URL từ text: ' + foundUrl, 'info');
            setTimeout(() => startBypass(), 1500);
            return;
        }

        // 3. Dùng URL hiện tại
        const currentUrl = window.location.href;
        if (currentUrl && currentUrl.match(/^https?:\/\//)) {
            urlInput.value = currentUrl;
            log('🔍 Dùng URL hiện tại: ' + currentUrl, 'info');
            setTimeout(() => startBypass(), 1500);
            return;
        }

        log('📌 Không phát hiện URL, vui lòng nhập tay', 'info');
    }

    // =====================================================
    //  EVENT LISTENERS
    // =====================================================
    submitBtn.addEventListener('click', startBypass);
    urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startBypass();
    });

    copyBtn.addEventListener('click', () => {
        if (currentCode) {
            GM_setClipboard(currentCode, 'text');
            log('📋 Copied to clipboard!', 'success');
            copyBtn.classList.add('copied');
            copyBtn.textContent = '✓ Copied';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.textContent = '📋 Copy';
            }, 2000);
        } else {
            log('⚠️ Nothing to copy', 'warning');
        }
    });

    collapseBtn.addEventListener('click', () => {
        bodyEl.classList.toggle('hidden');
        collapseBtn.textContent = bodyEl.classList.contains('hidden') ? '+' : '−';
    });

    // ===== DRAG =====
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    const header = document.getElementById('lm-header');

    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        isDragging = true;
        const rect = root.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onDragEnd);
        e.preventDefault();
    });

    function onDrag(e) {
        if (!isDragging) return;
        root.style.left = (e.clientX - dragOffsetX) + 'px';
        root.style.top = (e.clientY - dragOffsetY) + 'px';
        root.style.right = 'auto';
        root.style.bottom = 'auto';
    }

    function onDragEnd() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onDragEnd);
    }

    // =====================================================
    //  INIT
    // =====================================================
    log('🔥 LAYMA + HADES BYPASS loaded. Total timeout: 60s.', 'info');
    setStatus('READY', '#38bdf8');
    showBox('lm-url-box');

    // Hiển thị Hades notification ngay khi script load
    showHadesNotification('Chuẩn bị bypass...');

    if (document.readyState === 'complete') {
        setTimeout(autoStart, 600);
    } else {
        window.addEventListener('load', () => {
            setTimeout(autoStart, 600);
        });
    }

})();
