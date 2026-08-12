// ==UserScript==
// @name         Mèo Ăn Cơm - htymxyz
// @namespace    auto_earn
// @version      1.0
// @match        https://cryptolinkforearn.com/*
// @match        https://linkhuongdan.online/*
// @match        https://*.linkhuongdan.online/*
// @match        https://octolink.vip/*
// @match        https://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
// @grant        GM_addStyle
// @connect      generativelanguage.googleapis.com
// @connect      octolink.vip
// @connect      cryptolinkforearn.com
// @connect      *
// @run-at       document-end
// ==/UserScript==

(function() {
'use strict';

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const CFG_KEY       = 'auto_earn_config';
const CACHE_KEY     = 'domain_cache';
const TASK_URL      = 'https://cryptolinkforearn.com/link/go/721';
const OCTO_HOST     = 'https://octolink.vip';
const GEMINI_MODELS = ['gemini-3.5-flash-lite','gemini-3.5-flash'];

function getConfig() {
    return GM_getValue(CFG_KEY, {
        gemini_keys: [],
        error_codes: [],
        enabled: true
    });
}

function getCache() {
    return GM_getValue(CACHE_KEY, {});
}

function setCache(code, domain) {
    const c = getCache();
    c[code] = domain;
    GM_setValue(CACHE_KEY, c);
    log(`[CACHE] ${code} → ${domain}`);
}

// ─── UI ────────────────────────────────────────────────────────────────────────
GM_addStyle(`
#ae-fab {
    position: fixed; bottom: 30px; right: 20px; z-index: 999999;
    width: 54px; height: 54px; border-radius: 50%;
    background: linear-gradient(135deg,#a855f7,#7c3aed);
    box-shadow: 0 4px 18px rgba(168,85,247,0.65);
    cursor: grab; display: flex; align-items: center; justify-content: center;
    font-size: 24px; user-select: none; touch-action: none;
}
#ae-fab .ae-dot {
    position: absolute; top: 5px; right: 5px; width: 11px; height: 11px;
    border-radius: 50%; background: #4ade80; border: 2px solid #0a0a14;
}
#ae-panel {
    position: fixed; bottom: 94px; right: 20px; z-index: 999998;
    background: rgba(10,10,20,0.97); border: 1px solid rgba(168,85,247,0.5);
    border-radius: 12px; padding: 12px 14px; min-width: 230px;
    font-family: monospace; font-size: 12px; color: #e2e8f0;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6); display: none;
}
#ae-panel.ae-open { display: block; }
#ae-panel .ae-title { color: #a855f7; font-weight: bold; margin-bottom: 6px; font-size: 13px; }
#ae-panel .ae-log { color: #94a3b8; font-size: 11px; margin-top: 4px; max-height: 100px; overflow-y: auto; }
#ae-panel .ae-btn {
    margin-top: 8px; padding: 5px 10px; border-radius: 5px; border: none; cursor: pointer;
    background: linear-gradient(135deg,#a855f7,#7c3aed); color: #fff; font-size: 11px; margin-right: 4px;
}
#ae-settings-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999999;
    display: flex; align-items: center; justify-content: center;
}
#ae-settings-box {
    background: rgba(15,15,25,0.98); border: 1px solid rgba(168,85,247,0.4);
    border-radius: 12px; padding: 20px; width: 320px; color: #e2e8f0; font-family: monospace;
}
#ae-settings-box label { display: block; color: #94a3b8; font-size: 11px; margin: 10px 0 4px; }
#ae-settings-box textarea, #ae-settings-box input {
    width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.5);
    border: 1px solid rgba(168,85,247,0.3); border-radius: 5px;
    color: #e2e8f0; font-family: monospace; font-size: 11px; padding: 6px; outline: none;
}
#ae-settings-box textarea { resize: vertical; }
.ae-save { background: #a855f7; color: #fff; border: none; border-radius: 5px; padding: 7px 16px; cursor: pointer; margin-top: 12px; margin-right: 8px; }
.ae-cancel { background: rgba(255,255,255,0.1); color: #94a3b8; border: none; border-radius: 5px; padding: 7px 12px; cursor: pointer; margin-top: 12px; }
`);

let panel, logEl;

function createPanel() {
    if (document.getElementById('ae-fab')) return;

    // FAB button
    const fab = document.createElement('div');
    fab.id = 'ae-fab';
    fab.innerHTML = '🐱<span class="ae-dot"></span>';
    document.body.appendChild(fab);

    // Panel
    panel = document.createElement('div');
    panel.id = 'ae-panel';
    panel.innerHTML = `
        <div class="ae-title">🐱 Mèo Ăn Cơm</div>
        <div class="ae-log" id="ae-log">Khởi động...</div>
        <div>
            <button class="ae-btn" id="ae-toggle-btn">Dừng</button>
            <button class="ae-btn" id="ae-settings-btn">⚙</button>
        </div>
    `;
    document.body.appendChild(panel);
    logEl = document.getElementById('ae-log');

    // Toggle panel khi click FAB
    let isDragging = false;
    fab.addEventListener('click', () => {
        if (!isDragging) panel.classList.toggle('ae-open');
    });

    // Drag FAB
    let startX, startY, startLeft, startBottom;
    function onMove(e) {
        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
        const newRight = Math.max(0, window.innerWidth - (startLeft + dx + 54));
        const newBottom = Math.max(0, startBottom - dy);
        fab.style.right = newRight + 'px';
        fab.style.bottom = newBottom + 'px';
        panel.style.right = newRight + 'px';
        panel.style.bottom = (newBottom + 64) + 'px';
    }
    function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        setTimeout(() => { isDragging = false; }, 100);
    }
    fab.addEventListener('mousedown', e => {
        isDragging = false;
        startX = e.clientX; startY = e.clientY;
        const r = fab.getBoundingClientRect();
        startLeft = r.left; startBottom = window.innerHeight - r.bottom;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
    });
    fab.addEventListener('touchstart', e => {
        isDragging = false;
        const t = e.touches[0];
        startX = t.clientX; startY = t.clientY;
        const r = fab.getBoundingClientRect();
        startLeft = r.left; startBottom = window.innerHeight - r.bottom;
        document.addEventListener('touchmove', onMove, {passive:true});
        document.addEventListener('touchend', onEnd);
    });

    document.getElementById('ae-settings-btn').onclick = openSettings;
    document.getElementById('ae-toggle-btn').onclick = function() {
        const cfg = getConfig();
        cfg.enabled = !cfg.enabled;
        GM_setValue(CFG_KEY, cfg);
        this.textContent = cfg.enabled ? 'Dừng' : 'Bật';
        log(cfg.enabled ? 'Đã bật' : 'Đã dừng');
    };
}

function log(msg) {
    const ts = new Date().toLocaleTimeString('vi-VN');
    console.log(`[AutoEarn][${ts}] ${msg}`);
    if (logEl) {
        logEl.innerHTML = `<div>[${ts}] ${msg}</div>` + logEl.innerHTML;
        logEl.scrollTop = 0;
    }
}

function openSettings() {
    if (document.getElementById('ae-settings-overlay')) return;
    const cfg = getConfig();
    const ov = document.createElement('div');
    ov.id = 'ae-settings-overlay';
    ov.innerHTML = `
        <div id="ae-settings-box">
            <div style="color:#a855f7;font-weight:bold;margin-bottom:8px">⚙ Cài đặt Auto Earn</div>
            <label>Gemini API Keys (mỗi dòng 1 key)</label>
            <textarea id="ae-keys" rows="4">${(cfg.gemini_keys||[]).join('\n')}</textarea>
            <label>Mã lỗi (mỗi dòng 1 mã, VD: 220-2)</label>
            <textarea id="ae-errcodes" rows="3">${(cfg.error_codes||[]).join('\n')}</textarea>
            <label>Task URL</label>
            <input id="ae-taskurl" value="${cfg.task_url||TASK_URL}">
            <div>
                <button class="ae-save" id="ae-save-btn">💾 Lưu</button>
                <button class="ae-cancel" id="ae-cancel-btn">Huỷ</button>
            </div>
        </div>
    `;
    document.body.appendChild(ov);
    ov.onclick = e => { if (e.target === ov) ov.remove(); };
    document.getElementById('ae-cancel-btn').onclick = () => ov.remove();
    document.getElementById('ae-save-btn').onclick = () => {
        const keys = document.getElementById('ae-keys').value.trim().split('\n').map(s=>s.trim()).filter(Boolean);
        const errs = document.getElementById('ae-errcodes').value.trim().split('\n').map(s=>s.trim()).filter(Boolean);
        const turl = document.getElementById('ae-taskurl').value.trim();
        GM_setValue(CFG_KEY, { gemini_keys: keys, error_codes: errs, task_url: turl, enabled: cfg.enabled !== false });
        ov.remove();
        log('Đã lưu cài đặt');
    };
}

// ─── GEMINI ────────────────────────────────────────────────────────────────────
function geminiRequest(apiKey, model, prompt, imageBase64, mimeType, imageBase64b, mimeTypeb) {
    return new Promise((resolve, reject) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const parts = [{ text: prompt }];
        if (imageBase64) parts.push({ inline_data: { mime_type: mimeType || 'image/png', data: imageBase64 } });
        if (imageBase64b) parts.push({ inline_data: { mime_type: mimeTypeb || 'image/png', data: imageBase64b } });
        const body = {
            contents: [{ parts }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 60 }
        };
        GM_xmlhttpRequest({
            method: 'POST', url,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(body),
            onload: r => {
                if (r.status === 200) {
                    try {
                        const j = JSON.parse(r.responseText);
                        const text = j.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        resolve(text.trim());
                    } catch(e) { reject(e); }
                } else if (r.status === 429) {
                    reject(new Error('rate_limit'));
                } else {
                    reject(new Error(`HTTP ${r.status}`));
                }
            },
            onerror: e => reject(e)
        });
    });
}

async function geminiWithRotation(prompt, imageBase64, mimeType, imageBase64b, mimeTypeb) {
    const cfg = getConfig();
    const keys = cfg.gemini_keys || [];
    if (!keys.length) { log('[ERROR] Chưa có Gemini API key trong cài đặt'); return null; }
    for (const key of keys) {
        for (const model of GEMINI_MODELS) {
            try {
                const result = await geminiRequest(key, model, prompt, imageBase64, mimeType, imageBase64b, mimeTypeb);
                if (result) return result;
            } catch(e) {
                if (e.message === 'rate_limit') continue;
                log(`[GEMINI] Lỗi ${model}: ${e.message}`);
            }
        }
    }
    return null;
}

function imgToBase64(imgEl) {
    return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        canvas.width = imgEl.naturalWidth || imgEl.width;
        canvas.height = imgEl.naturalHeight || imgEl.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgEl, 0, 0);
        const data = canvas.toDataURL('image/png').split(',')[1];
        resolve(data);
    });
}

function urlToBase64(url) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: 'GET', url,
            responseType: 'arraybuffer',
            onload: r => {
                const bytes = new Uint8Array(r.response);
                let binary = '';
                bytes.forEach(b => binary += String.fromCharCode(b));
                resolve(btoa(binary));
            },
            onerror: reject
        });
    });
}

// ─── CAPTCHA ICON ──────────────────────────────────────────────────────────────
async function solveIconCaptcha() {
    log('Đang giải icon captcha...');

    // Tìm container captcha chứa cả icon bị nhiễu lẫn 5 lựa chọn
    let captchaContainer = document.querySelector('.icon-captcha, [class*="captcha-box"], [class*="captcha-container"]');
    if (!captchaContainer) {
        // Tìm ảnh bị nhiễu rồi leo lên tìm container
        const noisyImg = Array.from(document.querySelectorAll('img')).find(img =>
            img.src.includes('captcha') || img.src.includes('auth/img') || (img.width > 20 && img.width < 200)
        );
        if (noisyImg) {
            let el = noisyImg;
            for (let i = 0; i < 6; i++) {
                if (!el.parentElement) break;
                el = el.parentElement;
                const btns = el.querySelectorAll('button, [class*="option"]');
                if (btns.length >= 4) { captchaContainer = el; break; }
            }
        }
    }
    if (!captchaContainer) { log('[WARN] Không tìm thấy captcha container'); return false; }

    // Chụp toàn bộ captcha bằng html2canvas
    log('Chụp captcha bằng html2canvas...');
    let base64Full = null;
    try {
        const canvas = await html2canvas(captchaContainer, {
            useCORS: true, allowTaint: true, scale: 2, logging: false
        });
        base64Full = canvas.toDataURL('image/png').split(',')[1];
        log('Screenshot length: ' + base64Full.length);
    } catch(e) {
        log('html2canvas lỗi: ' + e);
    }

    // Fallback: lấy ảnh icon bị nhiễu qua GM_xmlhttpRequest
    if (!base64Full) {
        const captchaImg = Array.from(document.querySelectorAll('img')).find(img =>
            img.src.includes('captcha') || img.src.includes('auth/img')
        );
        if (!captchaImg) { log('[ERROR] Không tìm thấy ảnh captcha'); return false; }
        try { base64Full = await urlToBase64(captchaImg.src); }
        catch(e) { log('[ERROR] ' + e); return false; }
    }

    if (!base64Full || base64Full.length < 100) { log('[ERROR] Ảnh rỗng'); return false; }

    const prompt = `Đây là ảnh chụp màn hình Icon Captcha.
Phần trên cùng: 1 icon BỊ CHE bởi các nét gạch nhiễu đen.
Phần giữa: chữ "Select the icon that matches the one above"
Phần dưới: 5 icon LỰA CHỌN — hàng trên 4 icon (vị trí 1,2,3,4), hàng dưới 1 icon ở giữa (vị trí 5).

NHIỆM VỤ:
1. Nhìn icon bị nhiễu ở trên cùng — bỏ qua nét gạch, nhận diện hình dạng thật.
2. Tìm icon nào trong 5 lựa chọn khớp với hình dạng đó.
3. Trả về DUY NHẤT 1 chữ số (1, 2, 3, 4, hoặc 5). Không giải thích.`;

    const result = await geminiWithRotation(prompt, base64Full, 'image/png');
    if (!result) { log('[ERROR] Gemini không trả về kết quả'); return false; }

    const match = result.match(/[1-5]/);
    if (!match) { log('[ERROR] Kết quả không hợp lệ: ' + result); return false; }

    const idx = parseInt(match[0]) - 1;
    log('Gemini chọn icon số ' + (idx + 1));

    // Click đúng option
    const options = captchaContainer.querySelectorAll('button, [class*="option"], [class*="choice"]');
    const clickable = Array.from(options).filter(el => el.tagName !== 'DIV' || el.onclick || el.getAttribute('onclick'));
    if (clickable.length > idx) {
        clickable[idx].click();
    } else if (options.length > idx) {
        options[idx].click();
    } else {
        log('[ERROR] Không tìm thấy option để click'); return false;
    }
    await sleep(1500);
    log('Đã click option ' + (idx + 1));
    return true;
}


// ─── CAPTCHA VÒNG TRÒN ────────────────────────────────────────────────────────
async function solveCircleCaptcha() {
    log('Giải captcha vòng tròn...');
    const captchaEl = document.querySelector('[class*="captcha"], .captcha-circle, canvas');
    if (!captchaEl) { log('[WARN] Không thấy captcha vòng tròn'); return; }

    // Simulate mouse movement theo vòng tròn
    const rect = captchaEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.3;

    for (let loop = 0; loop < 3; loop++) {
        for (let i = 0; i <= 120; i++) {
            const angle = (2 * Math.PI * i) / 120;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            captchaEl.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
            await sleep(30);
        }
        // Check nếu đã xong
        if (document.querySelector('text=Link Gốc, a[href*="link"], .verified')) break;
    }
    await sleep(1000);
}

// ─── HELPER ────────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function waitForEl(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) { resolve(el); return; }
        const obs = new MutationObserver(() => {
            const el2 = document.querySelector(selector);
            if (el2) { obs.disconnect(); resolve(el2); }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { obs.disconnect(); reject(new Error('timeout: ' + selector)); }, timeout);
    });
}

// ─── MAIN FLOW ─────────────────────────────────────────────────────────────────
async function runOnCryptoLinkPage() {
    const cfg = getConfig();
    if (!cfg.enabled) return;

    const url = location.href;
    log(`Trang: ${url}`);

    // Trang task /link/go/XXX — giải captcha
    if (url.includes('/link/go/')) {
        await sleep(2000);

        // Kiểm tra có captcha không
        const hasCaptcha = document.querySelector('[class*="captcha"], .icon-captcha');
        if (hasCaptcha) {
            const ok = await solveIconCaptcha();
            if (!ok) { log('Captcha fail — thử lại sau 5s'); await sleep(5000); location.reload(); return; }

            // Chờ Verified
            await sleep(1000);

            // Click Go
            const goBtn = Array.from(document.querySelectorAll('button, a')).find(el =>
                el.textContent.includes('Go') || el.textContent.includes('Tiếp Tục') || el.textContent.includes('Continue')
            );
            if (goBtn) {
                log('Click Go');
                goBtn.click();
            }
        } else {
            log('[WARN] Không thấy captcha — có thể task đã hết hạn');
            await sleep(3000);
            location.href = cfg.task_url || TASK_URL;
        }
        return;
    }

    // Success popup
    const successEl = document.querySelector('.swal2-popup, [class*="success"], [class*="modal"]');
    if (successEl && (successEl.textContent.includes('Success') || successEl.textContent.includes('added'))) {
        log('✅ SUCCESS — nhận điểm!');
        await sleep(2000);
        const okBtn = successEl.querySelector('button');
        if (okBtn) okBtn.click();
        await sleep(1500);
        location.href = cfg.task_url || TASK_URL;
        return;
    }
}

async function runOnLinkHuongDan() {
    const cfg = getConfig();
    if (!cfg.enabled) return;

    await sleep(2000);
    log('Trang linkhuongdan — extract domain...');

    const domain = await extractDomainFromPage();
    if (!domain) {
        log('Mã lỗi hoặc không có domain → về trang task');
        await sleep(2000);
        location.href = cfg.task_url || TASK_URL;
        return;
    }

    log(`Truy cập: https://${domain}`);
    await sleep(1000);
    location.href = `https://${domain}`;
}

async function runOnDomainPage() {
    const cfg = getConfig();
    if (!cfg.enabled) return;

    await sleep(3000);
    log(`Trang domain: ${location.hostname}`);

    // Check 404
    if (document.title.includes('404') || document.body.textContent.includes('404') || document.body.textContent.toLowerCase().includes('not found')) {
        log('[404] → random UA + về trang task');
        await sleep(1000);
        location.href = cfg.task_url || TASK_URL;
        return;
    }

    // Follow steps — tìm nút tiếp tục
    for (let step = 0; step < 10; step++) {
        await sleep(2000);
        if (location.href.includes('octolink.vip')) break;

        const nextBtn = Array.from(document.querySelectorAll('a, button')).find(el => {
            const t = el.textContent.toLowerCase();
            return t.includes('tiếp') || t.includes('next') || t.includes('get code') ||
                   t.includes('lấy mã') || t.includes('continue') || t.includes('get') ||
                   el.href?.includes('step') || el.href?.includes('next');
        });

        if (nextBtn) {
            log(`Step ${step + 1}: click "${nextBtn.textContent.trim().substring(0,20)}"`);
            nextBtn.click();
            await sleep(3000);
        } else {
            // Submit form nếu có
            const form = document.querySelector('form');
            if (form) {
                log(`Step ${step + 1}: submit form`);
                form.submit();
                await sleep(3000);
            } else {
                log('Không tìm thấy bước tiếp — dừng');
                break;
            }
        }
    }
}

async function runOnOctoLink() {
    const cfg = getConfig();
    if (!cfg.enabled) return;

    await sleep(2000);
    log('Trang octolink — bypass...');

    const result = await octoBypass();
    if (!result) {
        log('Bypass thất bại → về trang task');
        await sleep(2000);
        location.href = cfg.task_url || TASK_URL;
        return;
    }

    // Nếu có finish URL thì navigate
    if (typeof result === 'string' && result.startsWith('http')) {
        location.href = result;
        return;
    }

    // Giải captcha vòng tròn
    await sleep(2000);
    await solveCircleCaptcha();
    await sleep(2000);

    // Tìm Link Gốc
    const linkGoc = Array.from(document.querySelectorAll('a, button')).find(el =>
        el.textContent.includes('Link Gốc') || el.textContent.includes('Link gốc')
    );

    if (linkGoc) {
        log('Click Link Gốc');
        linkGoc.click();
    } else {
        log('[WARN] Không thấy Link Gốc — về trang task');
        await sleep(3000);
        location.href = cfg.task_url || TASK_URL;
    }
}

// ─── ROUTER ────────────────────────────────────────────────────────────────────
async function main() {
    createPanel();
    await sleep(1000);

    const host = location.hostname;
    const url  = location.href;

    // Log URL để debug
    log('Host: ' + host);

    if (host.includes('cryptolinkforearn.com')) {
        await runOnCryptoLinkPage();
    } else if (host.includes('linkhuongdan.online') || host.includes('linkhuongdan')) {
        await runOnLinkHuongDan();
    } else if (host.includes('octolink.vip')) {
        await runOnOctoLink();
    } else {
        // Trang domain đích
        await runOnDomainPage();
    }
}

main().catch(e => log(`[ERROR] ${e}`));

})();
