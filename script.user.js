// ==UserScript==
// @name         chodenocto
// @namespace    http://tampermonkey.net/
// @version      4.8
// @author       未知用户
// @match        *://*/*
// @exclude      *://*.kiemcom.site/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      octolink.vip
// @connect      api.github.com
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';
  if (window.location.hostname.includes('kiemcom.site')) return;
  const _0x4f12 = 'https://kiemcom.site/dashboard/tasks', _0x3b8a = document.body ? document.body.innerText.toLowerCase() : '';
  if (document.title.includes('404') || (_0x3b8a.includes('404') && (_0x3b8a.includes('không tìm thấy') || _0x3b8a.includes('not found')))) {
      window.location.href = _0x4f12; return;
  }
  // GITHUB CONFIG
  const _0xlinkToken = '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';
  const _0xlinkRepo = 'Soc152/Varocto';
  const _0xlinkFile = 'link.json';
  const _0x921a = window.location.href, _0x83c1 = new URLSearchParams(window.location.search), _0x74d2 = window.location.hostname, _0x65b0 = window.location.pathname.split('/').filter(Boolean);
  let _0x54fa = null;
  if (_0x65b0.length > 0) {
    let _0x1111 = _0x65b0[_0x65b0.length - 1].replace(/\.html$/i, '');
    _0x54fa = _0x74d2.includes('totreview.com') ? `totreview-${_0x1111}` : _0x1111;
  }
  let _0xcookie = '';
  const _0xua = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36';

  if (_0x83c1.has('redirect_to_octo')) {
    const _0xbf21 = decodeURIComponent(_0x83c1.get('redirect_to_octo'));
    document.body.innerHTML = '\n            <div style="background:#0a0a0a; color:#e0e0e0; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; font-family:\'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; font-size: 20px;">\n                <div style="font-size: 60px; margin-bottom: 20px;">🚀</div>\n                <h2 style="color: #ffffff; text-shadow: 0 0 15px rgba(192, 132, 252, 0.6); font-weight: 300; letter-spacing: 2px;">ĐANG ĐIỀU HƯỚNG TỐC ĐỘ CAO</h2>\n                <p style="color:#888; font-size: 14px; margin-top: 10px;">Xin vui lòng chờ trong giây lát...</p>\n            </div>';
    setTimeout(() => {
      let _0xm = document.createElement('meta'); _0xm.name = 'referrer'; _0xm.content = 'unsafe-url'; document.head.appendChild(_0xm);
      let _0xl = document.createElement('a'); _0xl.href = _0xbf21; _0xl.referrerPolicy = 'unsafe-url'; document.body.appendChild(_0xl); _0xl.click();
    }, 1000); return;
  }

  const _0xisH = _0x74d2.includes('linkhuongdan.online') || _0x74d2.includes('totreview.com'), _0xhasC = document.querySelector('input[name="_csrfToken"]') !== null, _0xregL = /<a[^>]+href=["']([^"']+)["'][^>]*>Link\s*Gốc<\/a>/i, _0xmatchL = document.body.innerHTML.match(_0xregL);
  if (!_0xisH && !_0xhasC && !_0xmatchL) return;

  let _0xst = document.createElement('style');
  _0xst.innerHTML = `@keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } } @keyframes bounceSticker { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(5deg); } } @keyframes pulseGlow { 0% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 25px rgba(168, 85, 247, 0.7); } 100% { box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); } } .lux-panel { position: fixed; bottom: 30px; right: 30px; width: 390px; height: 350px; background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 16px; z-index: 2147483647; animation: pulseGlow 3s infinite; display: flex; flex-direction: column; overflow: visible; font-family: 'Segoe UI', system-ui, sans-serif; transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .lux-header { background: rgba(0, 0, 0, 0.5); color: #f0f0f0; padding: 14px 18px; font-size: 14px; font-weight: bold; border-bottom: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px 16px 0 0; display: flex; justify-content: space-between; align-items: center; user-select: none; } .lux-body { flex-grow: 1; padding: 16px; overflow-y: auto; line-height: 1.6; font-size: 13.5px; transition: opacity 0.2s ease; } .lux-body::-webkit-scrollbar { width: 6px; } .lux-body::-webkit-scrollbar-thumb { background: rgba(192, 132, 252, 0.5); border-radius: 10px; } .log-entry { animation: slideIn 0.3s ease forwards; margin-bottom: 8px; padding: 8px 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid transparent; display: flex; align-items: flex-start; } .log-icon { margin-right: 8px; font-size: 16px; } .log-text { color: #e2e8f0; font-family: 'Consolas', monospace; letter-spacing: 0.2px; font-weight: 500;} .lux-btn { background: none; border: none; color: #c084fc; cursor: pointer; font-size: 20px; font-weight:bold; margin-left: 10px; transition: color 0.2s; padding: 0 5px;} .lux-btn:hover { color: #fff; } .arh-sticker { position: absolute; top: -35px; left: 20px; animation: bounceSticker 2s infinite ease-in-out; box-shadow: 0 5px 15px rgba(0,0,0,0.5); z-index: 2147483648; pointer-events: none;}`;
  document.head.appendChild(_0xst);
  let _0xP = document.createElement('div'); _0xP.className = 'lux-panel';
  let _0xS = document.createElement('img'); _0xS.className = 'arh-sticker'; _0xS.src = 'https://dylansystem.vercel.app/icon-bot/fa7935ac-2569-487a-8868-0bc602b5bcd6.jpg'; _0xS.style.width = '55px'; _0xS.style.height = '55px'; _0xS.style.borderRadius = '50%'; _0xS.style.objectFit = 'cover'; _0xS.style.border = '2px solid rgba(192, 132, 252, 0.8)'; _0xP.appendChild(_0xS);
  let _0xH = document.createElement('div'); _0xH.className = 'lux-header'; _0xH.innerHTML = `<div style="display:flex; align-items:center; gap: 8px;"><span style="display:inline-block; width:10px; height:10px; background:#4ade80; border-radius:50%; box-shadow: 0 0 8px #4ade80;"></span><span style="letter-spacing: 0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">CHỢ ĐEN OCTO</span></div><button id="lux-toggle-btn" class="lux-btn" title="Thu nhỏ / Phóng to">−</button>`; _0xP.appendChild(_0xH);
  let _0xB = document.createElement('div'); _0xB.className = 'lux-body'; _0xP.appendChild(_0xB);
  if (_0x74d2.includes('octolink.vip')) _0xP.style.display = 'none';
  document.body.appendChild(_0xP);

  document.getElementById('lux-toggle-btn').addEventListener('click', function () {
    if (_0xB.style.display === 'none') { _0xB.style.display = 'block'; _0xP.style.height = '350px'; _0xS.style.display = 'block'; this.innerHTML = '−'; }
    else { _0xB.style.display = 'none'; _0xP.style.height = '52px'; _0xS.style.display = 'none'; this.innerHTML = '□'; }
  });

  function logG(_0xmsg, _0xlvl = 'info') {
    let _0xc = '#e2e8f0', _0xi = '✨', _0xbc = 'transparent';
    if (_0xlvl === 'success') { _0xc = '#4ade80'; _0xi = '🎉'; _0xbc = '#4ade80'; }
    if (_0xlvl === 'error') { _0xc = '#f87171'; _0xi = '💥'; _0xbc = '#f87171'; }
    if (_0xlvl === 'warn') { _0xc = '#facc15'; _0xi = '👀'; _0xbc = '#facc15'; }
    if (_0xlvl === 'system') { _0xc = '#60a5fa'; _0xi = '⚡'; _0xbc = '#60a5fa'; }
    let _0xrow = document.createElement('div'); _0xrow.className = 'log-entry'; _0xrow.style.borderLeftColor = _0xbc;
    _0xrow.innerHTML = `<span class="log-icon" style="color:${_0xc}">${_0xi}</span> <span class="log-text" style="color:${_0xc}">${_0xmsg}</span>`;
    _0xB.appendChild(_0xrow); _0xB.scrollTop = _0xB.scrollHeight;
  }

  logG('Khởi động siêu hệ thống...', 'system');

  function disableC() {
    document.querySelectorAll('#invisibleCaptchaShortlink, button[type="submit"], .btn-captcha').forEach((_0xbtn) => {
      _0xbtn.style.opacity = '0.1'; _0xbtn.style.pointerEvents = 'none'; _0xbtn.innerText = 'Hệ thống đang xử lý, xin đừng nhấn...';
    });
  }

  if (_0xhasC || _0xmatchL) {
    logG('Đã tiếp cận trang đích an toàn.', 'system'); disableC();
    if (_0xmatchL) { logG('Hoàn tất quá trình! Đã tìm thấy liên kết.', 'success'); setTimeout(() => { window.location.href = _0xmatchL[1]; }, 1000); return; }
    let _0xfrm = document.getElementById('link-view') || document.querySelector('form');
    if (!_0xfrm) return logG('Không tìm thấy dữ liệu bảo mật của hệ thống.', 'error');
    let _0xhtml = document.body.innerHTML, _0xisM = _0xhtml.includes('math_captcha') || document.querySelector('[value="math_captcha"]'), _0xisR = _0xhtml.includes('g-recaptcha') || document.querySelector('.g-recaptcha') || document.querySelector('[name="g-recaptcha-response"]'), _0xisHcap = _0xhtml.includes('h-captcha') || document.querySelector('.h-captcha') || document.querySelector('[name="h-captcha-response"]');

    function submitF(form) {
      logG('Đang thiết lập kết nối an toàn để trích xuất liên kết...', 'system');
      let _0xp = new URLSearchParams(), _0xdata = new FormData(form);
      for (let [_0xk, _0xv] of _0xdata.entries()) {
        if (_0xk.includes('_Token')) { try { _0xp.append(_0xk, decodeURIComponent(_0xv)); } catch (e) { _0xp.append(_0xk, _0xv); } }
        else { _0xp.append(_0xk, _0xv); }
      }
      let _0xgr = document.querySelector('[name="g-recaptcha-response"]')?.['value'], _0xhr = document.querySelector('[name="h-captcha-response"]')?.['value'];
      if (_0xgr) _0xp.set('g-recaptcha-response', _0xgr); if (_0xhr) _0xp.set('h-captcha-response', _0xhr);
      fetch(window.location.href, { method: 'POST', credentials: 'same-origin', headers: { ['Content-Type']: 'application/x-www-form-urlencoded', Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' }, body: _0xp.toString() })
        .then((_0xr) => _0xr.text()).then((_0xh) => {
          let _0xlnk = _0xh.match(_0xregL);
          if (_0xlnk) { logG('Trích xuất thành công! Đang tiến hành chuyển hướng...', 'success'); setTimeout(() => { window.location.href = _0xlnk[1]; }, 1000); }
          else { logG('Hệ thống máy chủ từ chối yêu cầu. Vui lòng thử lại.', 'error'); let _0xd = new DOMParser().parseFromString(_0xh, 'text/html'), _0xe = _0xd.querySelector('.message.error'); if (_0xe) logG(`Phản hồi: ${_0xe.innerText.trim()}`, 'warn'); }
        }).catch(() => { logG('Kết nối mạng không ổn định, vui lòng kiểm tra lại.', 'error'); });
    }

    if (_0xisM) {
      logG('Nhận diện lớp bảo mật toán học. Đang tự động xử lý...', 'warn');
      let _0xtxt = new DOMParser().parseFromString(_0xhtml, 'text/html').documentElement.textContent, _0xmat = _0xtxt.match(/(\d+)\s*([\+\-\*])\s*(\d+)\s*=\s*\?/);
      if (_0xmat) {
        let _0xsa = parseInt(_0xmat[1]), _0xop = _0xmat[2], _0xsb = parseInt(_0xmat[3]), _0xres = _0xop === '+' ? _0xsa + _0xsb : _0xop === '-' ? _0xsa - _0xsb : _0xsa * _0xsb;
        let _0xinp = document.getElementById('math-captcha-response') || document.querySelector('input[name="math_captcha_response"]');
        if (_0xinp) { _0xinp.value = _0xres; logG('Đã giải quyết bảo mật thành công.', 'success'); setTimeout(() => submitF(_0xfrm), 1000); }
      } else { logG('Không thể xác định được yêu cầu bảo mật.', 'error'); }
    } else if (_0xisR || _0xisHcap) {
        logG('Nhận diện lớp bảo mật hình ảnh.', 'warn'); logG('Vui lòng hoàn thành xác thực. Hệ thống đang chờ tín hiệu...', 'warn');
        let _0xtim = setInterval(() => {
          let _0xgr = document.querySelector('[name="g-recaptcha-response"]')?.['value'], _0xhr = document.querySelector('[name="h-captcha-response"]')?.['value'];
          if (_0xgr || _0xhr) { clearInterval(_0xtim); disableC(); logG('Xác thực thành công! Đang thiết lập kết nối...', 'success'); submitF(_0xfrm); }
        }, 1000);
    } return;
  }

  if (_0xisH) { if (_0x54fa) { logG(`Đã nhận diện mã nhiệm vụ: [${_0x54fa}]`, 'system'); getCacheR(_0x54fa); } else { logG('Đường dẫn không hợp lệ, thiếu mã nhiệm vụ.', 'error'); } }

  function getO(_0xu) { try { return new URL(_0xu).origin; } catch (e) { return _0xu; } }

  function showM() {
    if (document.getElementById('manual-domain-input')) return;
    logG('Vui lòng cung cấp thông tin thủ công.', 'warn');
    let _0xcont = document.createElement('div'); _0xcont.id = 'manual-input-container'; _0xcont.style.cssText = 'margin-top: 10px; display: flex; gap: 8px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px dashed #c084fc;';
    _0xcont.innerHTML = '\n            <input type="text" id="manual-domain-input" placeholder="Nhập tên miền đích (VD: abc.com)..." style="flex-grow: 1; padding: 8px 12px; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(192,132,252,0.3); border-radius: 4px; font-family: inherit; outline: none; font-size: 13px;">\n            <button id="manual-domain-btn" style="padding: 8px 16px; background: linear-gradient(135deg, #c084fc, #a855f7); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px; box-shadow: 0 4px 10px rgba(168, 85, 247, 0.3);">Xác nhận</button>\n        ';
    _0xB.appendChild(_0xcont); _0xB.scrollTop = _0xB.scrollHeight;
    document.getElementById('manual-domain-btn').addEventListener('click', () => {
      let _0xraw = document.getElementById('manual-domain-input').value.trim(); if (!_0xraw) return logG('Dữ liệu không được để trống.', 'error');
      let _0xcln = _0xraw.replace(/https?:\/\//i, '').replace(/\/$/, ''); logG(`Đang kiểm tra tính hợp lệ của dữ liệu: ${_0xcln}`, 'system'); loadJsC(`https://${_0xcln}`, 'manual', null);
    });
  }

  function b64D(_0xs) { try { return decodeURIComponent(atob(_0xs).split('').map(function(c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); }).join('')); } catch(e) { return atob(_0xs); } }

  function getCacheR(_0xk) {
    if (!_0xlinkToken) { logG('Thiếu cấu hình Token GitHub. Chuyển sang nhập tay.', 'error'); return showM(); }
    logG('Đang kết nối API thời gian thực để lấy dữ liệu đám mây...', 'system');
    GM_xmlhttpRequest({
      method: 'GET', url: `https://api.github.com/repos/${_0xlinkRepo}/contents/${_0xlinkFile}?t=${new Date().getTime()}`, headers: { Authorization: `token ${_0xlinkToken}`, Accept: 'application/vnd.github.v3+json' },
      onload: function (_0xres) {
        if (_0xres.status !== 200) { logG('Lấy dữ liệu thất bại từ GitHub. Kích hoạt nhập thủ công.', 'error'); return showM(); }
        try {
          let _0xj = JSON.parse(_0xres.responseText);
          if (_0xj.content) {
            let _0xdc = b64D(_0xj.content), _0xcc = JSON.parse(_0xdc);
            if (_0xcc.enabled && _0xcc.redirects[_0xk]) {
              let _0xct = _0xcc.redirects[_0xk]; logG(`Phát hiện bản lưu đám mây: ${_0xct}`, 'success');
              loadJsC(_0xct.startsWith('http') ? _0xct : `https://${_0xct}`, 'cache', null);
            } else { logG('Nhiệm vụ mới hoàn toàn. Kích hoạt chế độ nhập thủ công.', 'warn'); showM(); }
          } else { logG('Cấu trúc file GitHub không hợp lệ.', 'error'); showM(); }
        } catch (e) { logG('Lỗi phân tích cú pháp dữ liệu JSON.', 'error'); showM(); }
      }, onerror: function() { logG('Mất kết nối với máy chủ API GitHub.', 'error'); showM(); }, ontimeout: function() { logG('Quá thời gian kết nối API GitHub.', 'error'); showM(); }
    });
  }

  function syncGit(_0xk, _0xdv) {
    if (!_0xlinkToken) return; logG('Đang đồng bộ hóa dữ liệu lên hệ thống lưu trữ...', 'system');
    const _0xapi = `https://api.github.com/repos/${_0xlinkRepo}/contents/${_0xlinkFile}`;
    GM_xmlhttpRequest({
      method: 'GET', url: _0xapi, headers: { Authorization: `token ${_0xlinkToken}`, Accept: 'application/vnd.github.v3+json' },
      onload: function (_0xrG) {
        if (_0xrG.status !== 200) { logG('Không thể đọc dữ liệu từ GitHub.', 'error'); return; }
        try {
          let _0xjg = JSON.parse(_0xrG.responseText), _0xghD = b64D(_0xjg.content), _0xghN = JSON.parse(_0xghD);
          if (!_0xghN.redirects) _0xghN.redirects = {}; _0xghN.redirects[_0xk] = _0xdv;
          let _0xghE = btoa(unescape(encodeURIComponent(JSON.stringify(_0xghN, null, 2))));
          GM_xmlhttpRequest({
            method: 'PUT', url: _0xapi, headers: { Authorization: `token ${_0xlinkToken}`, Accept: 'application/vnd.github.v3+json' }, data: JSON.stringify({ message: `Auto Sync: ID ${_0xk} -> ${_0xdv}`, content: _0xghE, sha: _0xjg.sha }),
            onload: function (_0xrP) { if (_0xrP.status === 200 || _0xrP.status === 201) { logG('Đã cập nhật an toàn vào cơ sở dữ liệu hệ thống.', 'success'); } else { logG('Cập nhật GitHub thất bại.', 'error'); } }
          });
        } catch(e) { logG('Lỗi xử lý dữ liệu GitHub: ' + e.message, 'error'); }
      }
    });
  }

  function loadJsC(_0xud, _0xsrc, _0xctx) {
    logG('Đang kiểm tra giao thức định tuyến tại jsconfig...', 'system');
    GM_xmlhttpRequest({
      method: 'GET', url: 'https://octolink.vip/statics/jsconfig.js', timeout: 60000, headers: { accept: '*/*', referer: _0xud, ['user-agent']: _0xua },
      onload: function (_0xrJ) {
        _0xrJ.responseHeaders.split('\n').forEach((_0xhd) => { if (_0xhd.toLowerCase().startsWith('set-cookie:')) _0xcookie += _0xhd.substring(11).split(';')[0].trim() + '; '; });
        const _0xmRD = _0xrJ.responseText.match(/var\s+rd\s*=\s*"([^"]+)"/);
        if (!_0xmRD) { if (_0xsrc === 'cache') { logG('Dữ liệu lưu trữ đã cũ. Kích hoạt chế độ nhập thủ công.', 'warn'); showM(); } else if (_0xsrc === 'manual') { logG('Thông tin cung cấp không thể thiết lập kết nối. Vui lòng kiểm tra lại.', 'error'); } return; }
        logG('Mã hóa hợp lệ. Cho phép tiến hành bước tiếp theo.', 'success');
        let _0xclnu = _0xud.replace(/https?:\/\//i, '').replace(/\/$/, '');
        if (_0xsrc === 'manual') { syncGit(_0x54fa, _0xclnu); let _0xiel = document.getElementById('manual-input-container'); if (_0xiel) _0xiel.style.display = 'none'; }
        startJ(_0xmRD[1], _0xud, 0, _0xsrc);
      }, onerror: function () { if (_0xsrc === 'cache') showM(); }, ontimeout: function () { if (_0xsrc === 'cache') showM(); }
    });
  }

  function startJ(_0xrdV, _0xuJ, _0xtr = 0, _0xsrcJ) {
    if (_0xtr > 3) {
      logG('Tên miền lưu trữ đã hết hạn hoặc bị từ chối. Vui lòng cập nhật tên miền mới.', 'error');
      return showM();
    }
    const _0xhJ = getO(_0xuJ), _0xpay = 'screen=1366%20x%20768&browser%5Bname%5D=Chrome&browser%5Bversion%5D=145.0.0.0&browser%5BmajorVersion%5D=145&os%5Bname%5D=Windows&os%5Bversion%5D=10.0&mobile=false&cookies=true';
    let _0xref = _0xuJ.endsWith('/') ? _0xuJ : _0xuJ + '/';
    let _0xhds = { accept: 'application/json, text/javascript, */*; q=0.01', ['content-type']: 'application/x-www-form-urlencoded; charset=UTF-8', ['content-value-random']: _0xrdV, origin: _0xhJ, referer: _0xref, ['user-agent']: _0xua, ['X-Requested-With']: 'XMLHttpRequest' };
    if (_0xcookie !== '') _0xhds.cookie = _0xcookie;

    GM_xmlhttpRequest({
      method: 'POST', url: 'https://octolink.vip/check/job', data: _0xpay, headers: _0xhds, timeout: 60000,
      onload: function (_0xrJob) {
        let _0xjj;
        try {
            _0xjj = JSON.parse(_0xrJob.responseText);
        } catch (e) {
            logG(`Kết nối ngầm bị gián đoạn (Thử lại ${_0xtr + 1}/4)...`, 'warn');
            return setTimeout(() => startJ(_0xrdV, _0xuJ, _0xtr + 1, _0xsrcJ), 3000);
        }
        if (_0xjj.status !== 'success') {
            let _msg = _0xjj.message || 'Domain nhiệm vụ đã đổi';
            logG(`Server Octolink từ chối: ${_msg} (Thử lại ${_0xtr + 1}/4)...`, 'warn');
            return setTimeout(() => startJ(_0xrdV, _0xuJ, _0xtr + 1, _0xsrcJ), 3000);
        }
        let _0xsec = _0xjj.wait || 0, _0xst = _0xjj.step || '?';
        logG(`Xác thực thành công! Bắt đầu chặng ${_0xst}.`, 'success');
        GM_xmlhttpRequest({ method: 'POST', url: 'https://octolink.vip/check/countdown', data: _0xpay, headers: _0xhds, timeout: 60000 });
        let _0xlft = _0xsec, _0xtim = setInterval(() => {
          _0xB.lastChild.innerHTML = `<span class="log-icon" style="color:#e0e0e0; animation: spin 2s linear infinite; display: inline-block;">◷</span> <span class="log-text" style="color:#e0e0e0">Quá trình ${_0xst} đang xử lý: <span style="color:#c084fc; font-weight: bold;">${_0xlft}s</span></span>`;
          _0xlft--; if (_0xlft < 0) { clearInterval(_0xtim); setTimeout(() => { contJ(_0xrdV, _0xuJ, _0xpay, _0xhds, _0xst, 0); }, 1000); }
        }, 1000);
      }, onerror: function () { logG(`Mất kết nối mạng (Thử lại ${_0xtr + 1}/4)...`, 'error'); setTimeout(() => startJ(_0xrdV, _0xuJ, _0xtr + 1, _0xsrcJ), 3000); }, ontimeout: function () { logG(`Hết hạn kết nối (Thử lại ${_0xtr + 1}/4)...`, 'error'); setTimeout(() => startJ(_0xrdV, _0xuJ, _0xtr + 1, _0xsrcJ), 3000); }
    });
  }

  function contJ(_0xrdV, _0xuJ, _0xpay, _0xhds, _0xst, _0xtr = 0) {
    if (_0xtr > 3) return logG('Phát sinh lỗi vượt chặng. Tạm dừng tiến trình.', 'error');
    GM_xmlhttpRequest({
      method: 'POST', url: 'https://octolink.vip/check/continue', data: _0xpay, headers: _0xhds, timeout: 60000,
      onload: function (_0xrC) {
        let _0xjc; try { _0xjc = JSON.parse(_0xrC.responseText); } catch (e) { logG(`Xử lý tiếp tục lỗi (Thử lại ${_0xtr + 1}/4)...`, 'warn'); return setTimeout(() => contJ(_0xrdV, _0xuJ, _0xpay, _0xhds, _0xst, _0xtr + 1), 3000); }
        if (_0xjc.status === 'finish') {
          logG('Mở khóa thành công! Hệ thống đang dẫn đường...', 'success');
          setTimeout(() => { window.location.href = getO(_0xuJ) + '/?redirect_to_octo=' + encodeURIComponent(_0xjc.url); }, 1000);
        } else {
            if (_0xjc.status === 'success') {
                logG(`Hoàn tất chặng ${_0xst}, tiếp tục di chuyển...`, 'success');
                setTimeout(() => { startJ(_0xrdV, _0xuJ, 0, 'cache'); }, 8000);
            } else {
                logG(`Server báo chờ chặng (Thử lại ${_0xtr + 1}/4)...`, 'warn');
                setTimeout(() => contJ(_0xrdV, _0xuJ, _0xpay, _0xhds, _0xst, _0xtr + 1), 3000);
            }
        }
      }, onerror: function () { setTimeout(() => contJ(_0xrdV, _0xuJ, _0xpay, _0xhds, _0xst, _0xtr + 1), 3000); }, ontimeout: function () { setTimeout(() => contJ(_0xrdV, _0xuJ, _0xpay, _0xhds, _0xst, _0xtr + 1), 3000); }
    });
  }
})();
