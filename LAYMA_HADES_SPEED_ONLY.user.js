const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

puppeteer.use(StealthPlugin());

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

let browser, page;
let pendingResolve = null;

// ============================================================
//  API: BẮT ĐẦU BYPASS
// ============================================================
app.post('/start', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    try {
        if (!browser) {
            browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Vào trang target
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log('✅ Đã vào trang:', url);

        // Bước 1: Tìm nút "Lấy mã" và click
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button, a, div[role="button"], span[onclick]'));
            const target = btns.find(el => /lấy mã|lay ma|layma|get code/i.test(el.innerText || el.textContent));
            if (target) target.click();
        });
        await page.waitForTimeout(2000);

        // Bước 2: Kiểm tra captcha
        const captchaFrame = await page.evaluate(() => {
            const iframe = document.querySelector('iframe[src*="hcaptcha.com"], iframe[src*="recaptcha"]');
            if (iframe) return iframe.src;
            // Nếu không có iframe, kiểm tra xem có input captcha không
            const inputs = document.querySelectorAll('input[type="text"]');
            for (let inp of inputs) {
                if (inp.placeholder && /captcha|hcaptcha/i.test(inp.placeholder)) {
                    return 'manual';
                }
            }
            return null;
        });

        // Bước 3: Nếu có captcha, đưa lên cho client giải
        if (captchaFrame && captchaFrame !== 'manual') {
            // Tạo promise để chờ client giải captcha
            const captchaPromise = new Promise((resolve) => {
                pendingResolve = resolve;
            });

            res.json({
                status: 'waiting_captcha',
                captchaIframe: captchaFrame,
                message: 'Vui lòng giải captcha và gửi token'
            });

            // Chờ token từ client
            const token = await captchaPromise;
            console.log('✅ Nhận được token captcha:', token);

            // Inject token vào hCaptcha
            await page.evaluate((token) => {
                // Tìm textarea h-captcha-response
                const textarea = document.querySelector('textarea[name="h-captcha-response"]');
                if (textarea) {
                    textarea.value = token;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.dispatchEvent(new Event('change', { bubbles: true }));
                }
                // Tìm iframe và postMessage (cách khác)
                const iframe = document.querySelector('iframe[src*="hcaptcha.com"]');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({ type: 'hcaptcha', token }, '*');
                }
            }, token);

            // Click nút xác thực sau khi có token
            await page.evaluate(() => {
                const btns = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
                const target = btns.find(el => /xác thực|verify|submit|tiếp tục|continue/i.test(el.innerText || el.textContent));
                if (target) target.click();
            });
            await page.waitForTimeout(3000);
        }

        // Bước 4: Lấy code
        const code = await page.evaluate(() => {
            // Tìm element chứa code
            const selectors = [
                '#lm-code-text',
                '.code-display',
                '[class*="code"]',
                '[id*="code"]',
                '.result-code',
                '.gift-code',
                'div:has(> strong)'
            ];
            for (let sel of selectors) {
                const el = document.querySelector(sel);
                if (el && el.innerText && el.innerText.trim().length > 0) {
                    return el.innerText.trim();
                }
            }
            // Nếu không tìm thấy, lấy toàn bộ text có số/chữ đặc biệt
            const body = document.body.innerText;
            const match = body.match(/[A-Za-z0-9]{6,}/);
            return match ? match[0] : null;
        });

        if (code) {
            res.json({ status: 'done', code });
        } else {
            res.json({ status: 'error', message: 'Không tìm thấy code' });
        }

    } catch (err) {
        console.error('❌ Lỗi:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================================
//  API: NHẬN CAPTCHA TOKEN
// ============================================================
app.post('/captcha-solved', (req, res) => {
    const { token } = req.body;
    if (pendingResolve) {
        pendingResolve(token);
        pendingResolve = null;
        res.json({ status: 'ok' });
    } else {
        res.status(400).json({ error: 'No pending captcha' });
    }
});

// ============================================================
//  START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
