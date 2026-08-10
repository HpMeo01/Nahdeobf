// ==UserScript==
// @name         Octolink Bypass
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Bypass
// @author       Zeraa
// @match        https://linkhuongdan.online/*/?qq=complete
// @match        https://*/?utl_url=*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @connect      *
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  // config captured from eval hook, null until set
  let evalCfg = null;

  function toUrl(raw) {
    if (!raw) return raw;
    raw = raw.trim();
    if (!raw) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    return "https://" + raw;
  }

 // this function used for anti detect (uptolink check referrer)
  function redirect(dest) {
    console.log("result url:", dest);
    setMsg("redirecting...", "#16a34a");

    // (domain user entered in input field)
    var site = (typeof domain !== "undefined" && domain)
      ? domain
      : null;

    if (!site) {
      // no assigned site, go directly
      setTimeout(function() { window.location.href = dest; }, 300);
      return;
    }

    // ex: https://ok365.org/?utl_url=octolink.vip/finish/xxxxxxxxxxxx.....
    try {
      var u = new URL(site);
      var hop = u.origin + u.pathname.replace(/\/?$/, '/') + "?utl_url=" + encodeURIComponent(dest);
      console.log("[UTL] step 2 →", hop);
      setTimeout(function() { window.location.href = hop; }, 300);
    } catch(e) {
      setTimeout(function() { window.location.href = dest; }, 300);
    }
  }

  function getOS(ua) {
    if (/Windows NT/i.test(ua)) {
      const match = ua.match(/Windows NT (\d+\.\d+)/);
      return { name: "Windows", version: match ? match[1] : "10.0" };
    }
    if (/Mac OS X/i.test(ua)) {
      const match = ua.match(/Mac OS X (\d+[._]\d+)/);
      return { name: "Mac OS X", version: match ? match[1].replace(/_/g, ".") : "10.15" };
    }
    if (/Android/i.test(ua)) {
      const match = ua.match(/Android (\d+\.\d+)/);
      return { name: "Android", version: match ? match[1] : "10.0" };
    }
    if (/OS (\d+)[_.](\d+)/i.test(ua)) {
      const match = ua.match(/OS (\d+)[_.](\d+)/);
      return { name: "iOS", version: match ? match[1] + "." + match[2] : "15.0" };
    }
    return { name: "Linux", version: "Unknown" };
  }

  function getBrowser(ua) {
    if (/Edg\//i.test(ua)) {
      const match = ua.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
      const ver = match ? match[1] : "120.0.0.0";
      return { name: "Chrome", version: ver, majorVersion: parseInt(ver, 10) };
    }
    if (/Chrome/i.test(ua)) {
      const match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
      const ver = match ? match[1] : "124.0.0.0";
      return { name: "Chrome", version: ver, majorVersion: parseInt(ver, 10) };
    }
    if (/Firefox/i.test(ua)) {
      const match = ua.match(/Firefox\/(\d+\.\d+)/);
      const ver = match ? match[1] : "120.0";
      return { name: "Firefox", version: ver, majorVersion: parseInt(ver, 10) };
    }
    if (/Safari/i.test(ua)) {
      const match = ua.match(/Version\/(\d+\.\d+)/);
      const ver = match ? match[1] : "17.0";
      return { name: "Safari", version: ver, majorVersion: parseInt(ver, 10) };
    }
    return { name: "Chrome", version: "124.0.0.0", majorVersion: 124 };
  }

  function fingerprint() {
    const ua = navigator.userAgent;
    return {
      screen: screen.width + "bAB" + screen.height,
      browser: getBrowser(ua),
      os: getOS(ua),
      mobile: /Mobile|mini|Fennec|Android|iP(ad|od|hone)/i.test(ua || navigator.appVersion),
      cookies: navigator.cookieEnabled,
      plugins: navigator.plugins ? navigator.plugins.length : 0,
      languages: navigator.languages ? navigator.languages.length : 0,
      hardware_concurrency: navigator.hardwareConcurrency || 8,
      device_memory: navigator.deviceMemory || 8,
      touch_points: navigator.maxTouchPoints || 0,
      outer_size: window.outerWidth + "bAB" + window.outerHeight,

      // keep bot/userscript flags clean
      userscript: 0,
      userscript_score: 0,
      userscript_flags: "",
      gm_apis: { detected: false, score: 0, flags: [] },
      layered_userscript: { score: 0, hard: false },
      automation: 0,
      automation_score: 0,
      automation_flags: "",
      tamper: { detected: false, score: 0, extensionUrls: [], userscriptNodes: [], foundNames: [], globalKeys: [] },
      webdriver: 0
    };
  }
  function isMobile() {
    const ua = navigator.userAgent;
    // only true for small-screen phones, not tablets/laptops
    const isPhoneUA = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isSmallScreen = window.innerWidth <= 768;
    return isPhoneUA && isSmallScreen;
  }

  function pageKey() {
    return location.pathname + location.search;
  }

  function saveDomain(val) {
    if (!val) return;
    try {
      let clean = val.trim();
      const key = pageKey();
      let map = {};
      if (typeof GM_getValue !== "undefined") {
        map = JSON.parse(GM_getValue("vxrn-saved_domain", "{}"));
      } else {
        map = JSON.parse(localStorage.getItem("vxrn-saved_domain") || "{}");
      }
      map[key] = clean;

      if (typeof GM_setValue !== "undefined") {
        GM_setValue("vxrn-saved_domain", JSON.stringify(map));
      } else {
        localStorage.setItem("vxrn-saved_domain", JSON.stringify(map));
      }
    } catch (e) {}
  }

  function loadDomain() {
    try {
      const key = pageKey();
      let map = {};
      if (typeof GM_getValue !== "undefined") {
        map = JSON.parse(GM_getValue("vxrn-saved_domain", "{}"));
      } else {
        map = JSON.parse(localStorage.getItem("vxrn-saved_domain") || "{}");
      }
      return map[key] || "";
    } catch (e) {}
    return "";
  }

  try {
    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window; // prefer unsafeWindow for tampermonkey
    const _eval = win.eval;
    win.eval = function (code) {
      if (typeof code === "string" && code.includes("rd") && code.includes("dm")) {
        const cfg = parseConfig(code);
        if (cfg) {
          evalCfg = cfg;
          console.log("eval hook caught config:", cfg);
        }
      }
      return _eval.apply(this, arguments);
    };
  } catch (e) {}

  const KEY = "QQ.Encryption|NEW|9999999999999999999";
  const MAGIC = "QQ-Encryption";
  const SALT = 16;

  function rc4Init(key) {
    const table = [];
    for (let i = 0; i < 256; i++) table[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + table[i] + key.charCodeAt(i % key.length)) % 256;
      [table[i], table[j]] = [table[j], table[i]];
    }
    return table;
  }

  function rc4(table, data) {
    const out = new Uint8Array(data.length);
    let i = 0, j = 0;
    for (let n = 0; n < data.length; n++) {
      i = (i + 1) % 256;
      j = (j + table[i]) % 256;
      [table[i], table[j]] = [table[j], table[i]];
      out[n] = data[n] ^ table[(table[i] + table[j]) % 256];
    }
    return out;
  }

  function encrypt(obj) {
    const json = JSON.stringify(obj || {}); // serialize before encrypt
    const plain = new TextEncoder().encode(json);
    const table = rc4Init(KEY);
    const cipher = new Uint8Array(plain.length);
    let i = 0, j = 0;
    for (let n = 0; n < plain.length; n++) {
      i = (i + 1) % 256;
      j = (j + table[i]) % 256;
      [table[i], table[j]] = [table[j], table[i]];
      let value = plain[n] ^ table[(table[i] + table[j]) % 256];
      value = value ^ KEY.charCodeAt(n % KEY.length);
      cipher[n] = (value + 13) % 256;
    }

    const magic = new TextEncoder().encode(MAGIC);
    const packet = new Uint8Array(magic.length + SALT + cipher.length + SALT);
    crypto.getRandomValues(packet.subarray(magic.length, magic.length + SALT));
    crypto.getRandomValues(packet.subarray(magic.length + SALT + cipher.length));
    packet.set(magic, 0);
    packet.set(cipher, magic.length + SALT);
    return packet.buffer;
  }

  function decrypt(rawArrayBuffer) {
    const bytes = new Uint8Array(rawArrayBuffer);
    const header = String.fromCharCode.apply(null, Array.from(bytes.slice(0, MAGIC.length)));
    if (header !== MAGIC) {
      return JSON.parse(new TextDecoder("utf-8").decode(bytes));
    }

    const cStart = MAGIC.length + SALT;
    const cEnd = bytes.length - SALT;
    const cipher = bytes.slice(cStart, cEnd);
    const pre = new Uint8Array(cipher.length);
    for (let n = 0; n < cipher.length; n++) {
      let value = cipher[n];
      value = (value - 13 + 256) % 256;
      value = value ^ KEY.charCodeAt(n % KEY.length);
      pre[n] = value;
    }

    const table = rc4Init(KEY);
    const plain = rc4(table, pre);
    return JSON.parse(new TextDecoder("utf-8").decode(plain));
  }

  const delay = ms => new Promise(r => setTimeout(r, ms));

  async function wait(seconds, label = "") {
    for (let i = seconds; i > 0; i--) {
      setMsg((label ? label + ": " : "") + i + "s left");
      await delay(1000);
    }
  }

  function parseConfig(text) {
    if (!text) return null;
    const rdMatch = text.match(/(?:var|let|const|,|\s|^)rd\s*=\s*["']([a-f0-9]{32})["']/i) || text.match(/["']rd["']\s*:\s*["']([a-f0-9]{32})["']/i);
    const dmMatch = text.match(/(?:var|let|const|,|\s|^)dm\s*=\s*["']([^"']+)["']/i) || text.match(/["']dm["']\s*:\s*["']([^"']+)["']/i);
    const adMatch = text.match(/(?:var|let|const|,|\s|^)ad\s*=\s*(\d+)/i) || text.match(/["']ad["']\s*:\s*["'](\d+)["']/i);
    const w1Match = text.match(/(?:var|let|const|,|\s|^)w1\s*=\s*(\d+)/i) || text.match(/["']w1["']\s*:\s*["'](\d+)["']/i);
    const w2Match = text.match(/(?:var|let|const|,|\s|^)w2\s*=\s*(\d+)/i) || text.match(/["']w2["']\s*:\s*["'](\d+)["']/i);
    const w3Match = text.match(/(?:var|let|const|,|\s|^)w3\s*=\s*(\d+)/i) || text.match(/["']w3["']\s*:\s*["'](\d+)["']/i);

    if (rdMatch && dmMatch) {
      return {
        rd: rdMatch[1],
        dm: dmMatch[1],
        ad: adMatch ? parseInt(adMatch[1], 10) : 5,
        w1: w1Match ? parseInt(w1Match[1], 10) : 52,
        w2: w2Match ? parseInt(w2Match[1], 10) : 22,
        w3: w3Match ? parseInt(w3Match[1], 10) : 7
      };
    }
    return null;
  }

  // fetch page → find qq.min.js → parse jsconfig url from loadJS1 → fetch jsconfig -> parse rd/dm
  function fetchConfig(target) {
    return new Promise(function(resolve) {

      GM_xmlhttpRequest({
        method: "GET",
        url: target,
        headers: {
          "accept": "text/html",
          "user-agent": navigator.userAgent,
          "referer": location.href
        },
        timeout: 8000,
        onload: function(res) {
          var html = res.responseText || "";

          // find qq.min.js script tag
          var qm = html.match(/src=["']([^"']*trafficvip\.vip[^"']*qq\.min\.js[^"']*)["']/i)
                     || html.match(/src=["']([^"']*qq\.min\.js[^"']*)["']/i);
          if (!qm) {
            log("Not found, retrying...", "warn");
            fetchQQ("https://trafficvip.vip/js/qq.min.js?v=1.0.2", target, resolve);
            return;
          }

          var qq = qm[1];
          if (!/^https?:\/\//i.test(qq)) {
            try { qq = new URL(qq, target).href; } catch(e) {}
          }

          fetchQQ(qq, target, resolve);
        },
        onerror: function() {
          log("Errored while loading config.", "err");
          resolve(null);
        }
      });
    });
  }

  function fetchQQ(qq, referer, resolve) {
    GM_xmlhttpRequest({
      method: "GET",
      url: qq,
      headers: { "user-agent": navigator.userAgent, "referer": referer || location.href },
      timeout: 8000,
      onload: function(res2) {
        var js = res2.responseText || "";
        var jm = js.match(/function\s+loadJS1[\s\S]*?loadScript\s*\(\s*["']([^"']+)["']/i);
        if (!jm) {
          log("Parse failed (config).", "err");
          resolve(null);
          return;
        }
        var jsc = jm[1].trim();
        if (!/^https?:\/\//i.test(jsc)) {
          try { jsc = new URL(jsc, qq).href; } catch(e) {}
        }
        log("jsconfig: " + jsc.split("/").slice(0,3).join("/") + "/...", "info");
        GM_xmlhttpRequest({
          method: "GET",
          url: jsc,
          headers: { "user-agent": navigator.userAgent, "referer": referer || location.href },
          timeout: 8000,
          onload: function(res3) {
            var cfg = parseConfig(res3.responseText || "");
            if (cfg) {
              log("Config OK — rd: " + cfg.rd.slice(0,8) + "...", "ok");
              resolve(cfg);
            } else {
              log("Parse failed (HTTP " + res3.status + ").", "err");
              resolve(null);
            }
          },
          onerror: function() {
            log("FAILED TO LOAD.", "err");
            resolve(null);
          }
        });
      },
      onerror: function() {
        log("Load qq failed.", "err");
        resolve(null);
      }
    });
  }

  async function getConfig(url) {
    if (evalCfg) {
      return evalCfg;
    }

    var target = url || location.href;
    // prefer link extracted from dom if available
    var linkEl = document.body && document.body.innerHTML.match(
      /<a[^>]+href=["']([^"']+)["'][^>]*>(?:Link\s*Gốc|Xem\s*Link|Link\s*Hướng\s*Dẫn)<\/a>/i
    );
    if (linkEl) target = linkEl[1];

    return await fetchConfig(target);
  }

  function post(url, rd) {
    return new Promise((resolve, reject) => {
      // encrypt real fingerprint as request body
      const body = encrypt(fingerprint());
      GM_xmlhttpRequest({
        method: "POST",
        url: url,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Value-Random": rd
        },
        responseType: "arraybuffer",
        data: body,
        onload: function (res) {
          try {
            resolve(decrypt(res.response));
          } catch (e) {
            reject("failed to decode: " + e.message);
          }
        },
        onerror: function(err) { reject(new Error("Network error: " + JSON.stringify(err))); }
      });
    });
  }

  // site domain entered by user, used for redirect hop
  var domain = null;

  async function run(config) {
    let step = 1;

    let endpoint = `${config.dm}/check/continue`;
    if (config.ad === 1) endpoint = `${config.dm}/check/finishsocica`;
    else if (config.ad === 2) endpoint = `${config.dm}/check/finishgoogle`;

    while (true) {
      setMsg("Step " + step + ": sending request...");
      log("→ /check/job (step " + step + ")", "info");

      let job;
      try {
        job = await post(config.dm + "/check/job", config.rd);
      } catch (e) {
        log("job failed: " + e.message, "err");
        setMsg("failed /check/job!", "#e11d48");
        break;
      }

      if (!job) {
        log("err: Server returned a null value", "err");
        setMsg("err: failed to connect!", "#f87171");
        break;
      }

      // bail early if server signals error
      if (job.status === "error" || typeof job.type === "undefined" || job.type === null) {
        const errMsg = job.message || job.msg || "error (status=error / type=undefined)";
        log("err: " + errMsg, "err");
        setMsg("err: " + errMsg, "#e11d48");
        break;
      }

      log("job response: status=" + job.status + " type=" + job.type, "info");

      if (job.status === "finish") {
        log("Finish! URL: " + job.url, "ok");
        redirect(job.url);
        break;
      }

      let secs = job.wait;
      if (!secs) {
        if (step === 1) secs = config.w1 || 52;
        else if (step === 2) secs = config.w2 || 22;
        else if (step === 3) secs = config.w3 || 7;
        else secs = 15;
      }

      const stepNum = job.step || step;
      log("STEP " + stepNum + ": " + secs + "s", "warn");

      try {
        await post(config.dm + "/check/wait", config.rd);
      } catch (e) {
        log("wait failed (skip) " + e.message, "warn");
      }

      await wait(secs, "STEP " + stepNum);

      let cont;
      try {
        cont = await post(endpoint, config.rd);
        log("continue: status=" + (cont && cont.status), "info");
      } catch (e) {
        log("continue failed: " + e.message, "err");
        setMsg("continue failed", "#e11d48");
        break;
      }

      // check err when continuing
      if (cont && cont.status === "error") {
        const errMsg = cont.message || cont.msg || "continue failed";
        log("err: " + errMsg, "err");
        setMsg("err: " + errMsg, "#e11d48");
        break;
      }

      if (cont && cont.status === "finish") {
        log("success", "ok");
        redirect(cont.url);
        break;
      }

      step++;
      await delay(1500);
    }
  }

  function hideInput() {
    var btn   = document.getElementById("utl-btn");
    var input = document.getElementById("utl-input");
    if (btn)   btn.style.display   = "none";
    if (input) input.style.display = "none";
  }

function initUI() {
    if (document.getElementById("utl-root")) return;

    var isMobile = isMobile();

    var style = document.createElement("style");
    style.textContent = isMobile ? `
      /* mobile ui */
      #utl-root, #utl-root * {
        box-sizing: border-box; margin: 0; padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      @keyframes utl-in { from { opacity: 0; transform: translateY(-10px) scale(.97); } to { opacity: 1; transform: none; } }
      @keyframes utl-row { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
      @keyframes utl-ping { 0% { transform: scale(1); opacity: .8; } 70% { transform: scale(2.4); opacity: 0; } 100% { transform: scale(1); opacity: 0; } }
      @keyframes utl-shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }

      #utl-root {
        position: fixed; top: 10px; right: 10px; z-index: 2147483647;
        width: min(360px, calc(100vw - 16px));
        background: #0f0f0f; border: 1px solid #2a2a2a; border-radius: 10px;
        box-shadow: 0 0 0 1px #000, 0 12px 36px rgba(0,0,0,0.85);
        overflow: hidden; animation: utl-in .25s cubic-bezier(.22,1,.36,1) both;
      }
      #utl-hdr {
        display: flex; align-items: center; gap: 8px; padding: 7px 10px;
        background: #161616; border-bottom: 1px solid #222; cursor: move; user-select: none;
      }
      #utl-dot-w { position: relative; width: 8px; height: 8px; flex-shrink: 0; }
      #utl-dot { position: absolute; inset: 0; border-radius: 50%; background: #4ade80; }
      #utl-dot-r { position: absolute; inset: 0; border-radius: 50%; background: #4ade80; opacity: .65; animation: utl-ping 2.2s cubic-bezier(0,0,.2,1) infinite; }
      #utl-title { flex: 1; font-weight: 800; font-size: 10.5px; letter-spacing: 1.2px; text-transform: uppercase; color: rgba(255,255,255,0.9); }
      #utl-ver { font-size: 8.5px; font-weight: 700; padding: 1px 6px; border-radius: 4px; background: transparent; color: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.12); }
      #utl-tog { width: 20px; height: 20px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12); background: transparent; color: rgba(255,255,255,0.4); font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: 2px; flex-shrink: 0; line-height: 1; }
      #utl-tog:hover { background: rgba(255,255,255,0.1); color: #fff; }

      #utl-mini { display: none; align-items: center; gap: 6px; padding: 6px 10px; border-top: 1px solid #1a1a1a; background: #0c0c0c; }
      #utl-mini.on { display: flex; }
      #utl-mini-input { flex: 1; padding: 4px 8px; background: #fff; border: 1px solid #000; border-radius: 5px; color: #111; font-size: 11px; outline: none; }
      #utl-mini-step { font-family: monospace; font-size: 10.5px; color: rgba(255,255,255,0.45); white-space: nowrap; flex-shrink: 0; }
      #utl-mini-timer { font-family: monospace; font-weight: 800; font-size: 11.5px; color: #fff; white-space: nowrap; flex-shrink: 0; min-width: 38px; text-align: right; }

      #utl-log { background: #080808; padding: 2px 0; max-height: 120px; overflow-y: auto; }
      #utl-log:empty { display: none; }
      #utl-log::-webkit-scrollbar { width: 2px; }
      #utl-log::-webkit-scrollbar-thumb { background: #333; }

      .utl-row { display: flex; align-items: baseline; gap: 0; padding: 3px 10px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 11px; line-height: 1.45; animation: utl-row .18s cubic-bezier(.22,1,.36,1) both; cursor: default; word-break: break-all; white-space: normal; border-left: 2px solid transparent; }
      .utl-row:hover { background: rgba(255,255,255,0.03); }
      .utl-ic { font-size: 9.5px; font-weight: 900; flex-shrink: 0; width: 16px; text-align: center; }
      .utl-msg { flex: 1; }
      .utl-info .utl-ic { color: rgba(255,255,255,.25); } .utl-info .utl-msg { color: rgba(255,255,255,.45); }
      .utl-ok .utl-ic { color: #4ade80; }                  .utl-ok .utl-msg { color: #4ade80; }
      .utl-warn .utl-ic { color: rgba(255,255,255,.35); } .utl-warn .utl-msg { color: rgba(255,255,255,.55); }
      .utl-err .utl-ic { color: #f87171; }                 .utl-err .utl-msg { color: #f87171; font-weight: 600; }

      #utl-sep { height: 1px; background: #1a1a1a; }
      #utl-bot { padding: 8px 10px 9px; display: flex; flex-direction: column; gap: 6px; background: #0f0f0f; }

      #utl-bar { height: 2px; border-radius: 99px; background: rgba(255,255,255,.06); overflow: hidden; opacity: 0; transition: opacity .3s; }
      #utl-bar.on { opacity: 1; }
      #utl-bar-fill { height: 100%; width: 0%; border-radius: 99px; background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,.4) 50%, #fff 100%); background-size: 200% 100%; animation: utl-shimmer 2s linear infinite; transition: width .5s cubic-bezier(.4,0,.2,1); }

      #utl-meta { display: flex; justify-content: space-between; align-items: center; min-height: 14px; }
      #utl-status { font-size: 10.5px; color: rgba(255,255,255,.35); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #utl-timer { font-family: monospace; font-weight: 700; font-size: 11px; color: rgba(255,255,255,.7); flex-shrink: 0; padding-left: 8px; }

      #utl-input { width: 100%; padding: 6px 9px; background: #fff; border: 1.5px solid #000; border-radius: 6px; color: #111; font-size: 11.5px; outline: none; }
      #utl-input::placeholder { color: rgba(0,0,0,.3); }

      #utl-btn { width: 100%; padding: 6.5px; border-radius: 6px; border: 1.5px solid #000; background: #fff; color: #000; font-weight: 800; font-size: 11.5px; cursor: pointer; letter-spacing: .3px; transition: background .12s, transform .1s; }
      #utl-btn:hover { background: #f0f0f0; }
      #utl-btn:active { background: #e0e0e0; }
      #utl-btn:disabled { opacity: .35; cursor: not-allowed; }
    ` : `
      /* desktop ui */
      #utl-root, #utl-root * {
        box-sizing: border-box; margin: 0; padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
      }
      @keyframes utl-in { from { opacity: 0; transform: translateY(-14px) scale(.96); } to { opacity: 1; transform: none; } }
      @keyframes utl-row { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
      @keyframes utl-ping { 0% { transform: scale(1); opacity: .8; } 70% { transform: scale(2.6); opacity: 0; } 100% { transform: scale(1); opacity: 0; } }
      @keyframes utl-shimmer { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }

      #utl-root {
        position: fixed; top: 20px; right: 20px; z-index: 2147483647;
        width: min(520px, calc(100vw - 28px));
        background: #0f0f0f; border: 1px solid #2a2a2a;
        border-radius: 14px 14px 10px 10px;
        box-shadow: 0 0 0 1px #000, 0 20px 60px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.6);
        overflow: hidden; animation: utl-in .3s cubic-bezier(.22,1,.36,1) both;
      }
      #utl-hdr {
        display: flex; align-items: center; gap: 9px; padding: 11px 14px;
        background: #161616; border-bottom: 1px solid #222;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06); cursor: move; user-select: none;
      }
      #utl-dot-w { position: relative; width: 9px; height: 9px; flex-shrink: 0; }
      #utl-dot { position: absolute; inset: 0; border-radius: 50%; background: #4ade80; }
      #utl-dot-r { position: absolute; inset: 0; border-radius: 50%; background: #4ade80; opacity: .65; animation: utl-ping 2.4s cubic-bezier(0,0,.2,1) infinite; }
      #utl-title { flex: 1; font-weight: 800; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.88); }
      #utl-ver { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: transparent; color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.12); letter-spacing: .4px; }
      #utl-tog { width: 24px; height: 24px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: transparent; color: rgba(255,255,255,0.35); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s, color .15s, border-color .15s; margin-left: 2px; flex-shrink: 0; line-height: 1; }
      #utl-tog:hover { background: rgba(255,255,255,0.07); color: #fff; border-color: rgba(255,255,255,0.25); }

      #utl-mini { display: none; align-items: center; gap: 8px; padding: 8px 14px; border-top: 1px solid #1a1a1a; background: #0c0c0c; }
      #utl-mini.on { display: flex; }
      #utl-mini-input { flex: 1; padding: 5px 10px; background: #fff; border: 1.5px solid #000; border-radius: 6px; color: #111; font-size: 11.5px; outline: none; }
      #utl-mini-input::placeholder { color: rgba(0,0,0,0.3); }
      #utl-mini-step { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 11px; color: rgba(255,255,255,0.4); white-space: nowrap; flex-shrink: 0; }
      #utl-mini-timer { font-family: 'SF Mono', 'Fira Code', monospace; font-weight: 800; font-size: 12.5px; color: #fff; white-space: nowrap; flex-shrink: 0; min-width: 44px; text-align: right; }

      #utl-log { background: #080808; padding: 4px 0; max-height: 260px; overflow-y: auto; }
      #utl-log:empty { display: none; }
      #utl-log::-webkit-scrollbar { width: 2px; }
      #utl-log::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 99px; }

      .utl-row { display: flex; align-items: baseline; gap: 0; padding: 5px 16px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 12px; line-height: 1.55; animation: utl-row .22s cubic-bezier(.22,1,.36,1) both; transition: background .1s; cursor: default; word-break: break-word; white-space: normal; border-left: 2px solid transparent; }
      .utl-row:hover { background: rgba(255,255,255,0.03); }
      .utl-info:hover { border-left-color: rgba(255,255,255,0.1); }
      .utl-ok:hover { border-left-color: #4ade80; }
      .utl-err:hover { border-left-color: #f87171; }
      .utl-ic { font-size: 10.5px; font-weight: 900; flex-shrink: 0; width: 20px; text-align: center; padding-top: 1px; }
      .utl-msg { flex: 1; }
      .utl-info .utl-ic { color: rgba(255,255,255,.25); } .utl-info .utl-msg { color: rgba(255,255,255,.48); }
      .utl-ok   .utl-ic { color: #4ade80; }             .utl-ok   .utl-msg { color: #4ade80; }
      .utl-warn .utl-ic { color: rgba(255,255,255,.35); } .utl-warn .utl-msg { color: rgba(255,255,255,.52); }
      .utl-err  .utl-ic { color: #f87171; }              .utl-err  .utl-msg { color: #f87171; font-weight: 600; }

      #utl-sep { height: 1px; background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%); }
      #utl-bot { padding: 11px 14px 13px; display: flex; flex-direction: column; gap: 9px; background: #0f0f0f; }

      #utl-bar { height: 2px; border-radius: 99px; background: rgba(255,255,255,.06); overflow: hidden; opacity: 0; transition: opacity .3s; }
      #utl-bar.on { opacity: 1; }
      #utl-bar-fill { height: 100%; width: 0%; border-radius: 99px; background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,.4) 50%, #fff 100%); background-size: 200% 100%; animation: utl-shimmer 2s linear infinite; transition: width .6s cubic-bezier(.4,0,.2,1); }

      #utl-meta { display: flex; justify-content: space-between; align-items: center; min-height: 16px; }
      #utl-status { font-size: 11px; color: rgba(255,255,255,.35); transition: color .25s; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #utl-timer { font-family: 'SF Mono', 'Fira Code', monospace; font-weight: 700; font-size: 12px; color: rgba(255,255,255,.7); letter-spacing: 1.5px; flex-shrink: 0; padding-left: 10px; }

      #utl-input { width: 100%; padding: 9px 12px; background: #fff; border: 2px solid #000; border-radius: 8px; color: #111; font-size: 13px; outline: none; transition: box-shadow .18s, border-color .18s; }
      #utl-input::placeholder { color: rgba(0,0,0,.28); }
      #utl-input:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(0,0,0,.1); }

      #utl-btn { width: 100%; padding: 9px; border-radius: 8px; border: 2px solid #000; background: #fff; color: #000; font-weight: 800; font-size: 13px; cursor: pointer; letter-spacing: .5px; transition: background .15s, transform .1s, box-shadow .15s; }
      #utl-btn:hover { background: #f5f5f5; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
      #utl-btn:active { transform: none; background: #e8e8e8; box-shadow: none; }
      #utl-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; }
    `;

    document.head.appendChild(style);

    var root = document.createElement("div");
    root.id = "utl-root";
    root.innerHTML = `
      <div id="utl-hdr">
        <div id="utl-dot-w"><div id="utl-dot"></div><div id="utl-dot-r"></div></div>
        <div id="utl-title">vxrn - octolink (BETA)</div>
        <span id="utl-ver">V3 Beta</span>
        <button id="utl-tog" title="minimize">&#x2212;</button>
      </div>
      <div id="utl-mini">
        <input id="utl-mini-input" type="text" placeholder="URL..." />
        <span id="utl-mini-step"></span>
        <span id="utl-mini-timer"></span>
      </div>
      <div id="utl-log"></div>
      <div id="utl-sep"></div>
      <div id="utl-bot">
        <div id="utl-bar"><div id="utl-bar-fill"></div></div>
        <div id="utl-meta"><span id="utl-status">ready.</span><span id="utl-timer"></span></div>
        <input id="utl-input" type="text" placeholder="url or domain..." />
        <button id="utl-btn">confirm</button>
      </div>
    `;
    document.body.appendChild(root);

    var hdr = document.getElementById("utl-hdr");
    var _dx = 0, _dy = 0, _drag = false;

    hdr.addEventListener("mousedown", function(e) {
      if (e.target.id === "utl-tog") return;
      var rect = root.getBoundingClientRect();
      root.style.right = "auto";
      root.style.left  = rect.left + "px";
      root.style.top   = rect.top  + "px";
      _dx = e.clientX - rect.left;
      _dy = e.clientY - rect.top;
      _drag = true;
      document.body.style.userSelect = "none";
      e.preventDefault();
    });

    hdr.addEventListener("touchstart", function(e) {
      if (e.target.id === "utl-tog") return;
      var touch = e.touches[0];
      var rect = root.getBoundingClientRect();
      root.style.right = "auto";
      root.style.left  = rect.left + "px";
      root.style.top   = rect.top  + "px";
      _dx = touch.clientX - rect.left;
      _dy = touch.clientY - rect.top;
      _drag = true;
    }, { passive: true });

    document.addEventListener("mousemove", function(e) {
      if (!_drag) return;
      var x = Math.max(0, Math.min(window.innerWidth  - root.offsetWidth,  e.clientX - _dx));
      var y = Math.max(0, Math.min(window.innerHeight - root.offsetHeight, e.clientY - _dy));
      root.style.left = x + "px";
      root.style.top  = y + "px";
    });

    document.addEventListener("touchmove", function(e) {
      if (!_drag) return;
      var touch = e.touches[0];
      var x = Math.max(0, Math.min(window.innerWidth  - root.offsetWidth,  touch.clientX - _dx));
      var y = Math.max(0, Math.min(window.innerHeight - root.offsetHeight, touch.clientY - _dy));
      root.style.left = x + "px";
      root.style.top  = y + "px";
    }, { passive: true });

    document.addEventListener("mouseup", function() { _drag = false; document.body.style.userSelect = ""; });
    document.addEventListener("touchend", function() { _drag = false; });

    var _collapsed = false;
    document.getElementById("utl-tog").addEventListener("click", function() {
      _collapsed = !_collapsed;
      var log  = document.getElementById("utl-log");
      var sep  = document.getElementById("utl-sep");
      var bot  = document.getElementById("utl-bot");
      var mini = document.getElementById("utl-mini");
      var tog  = document.getElementById("utl-tog");

      if (_collapsed) {
        log.style.display  = "none";
        sep.style.display  = "none";
        bot.style.display  = "none";
        mini.classList.add("on");
        tog.innerHTML = "&#x002B;";
        var mainInput = document.getElementById("utl-input");
        var miniInput = document.getElementById("utl-mini-input");
        if (mainInput && miniInput) {
          miniInput.value = mainInput.value;
          miniInput.style.display = mainInput.style.display === "none" ? "none" : "";
        }
      } else {
        log.style.display  = "";
        sep.style.display  = "";
        bot.style.display  = "";
        mini.classList.remove("on");
        tog.innerHTML = "&#x2212;";
        var mainInput2 = document.getElementById("utl-input");
        var miniInput2 = document.getElementById("utl-mini-input");
        if (mainInput2 && miniInput2) mainInput2.value = miniInput2.value;
      }
    });

    document.getElementById("utl-mini-input").addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        var mainInput = document.getElementById("utl-input");
        if (mainInput) mainInput.value = this.value;
        start();
      }
    });

      var saved = loadDomain();
    if (saved) {
      document.getElementById("utl-input").value = saved;
      log("utl config loaded successfully", "ok");
      setTimeout(function() { start(); }, 500);
    }

    document.getElementById("utl-btn").addEventListener("click", start);
  }
  
  
  function setMsg(msg, color) {
    var el = document.getElementById("utl-status");
    if (el) {
      el.textContent = msg;
      el.style.color =
        (color === "#e11d48" || color === "#f87171") ? "#f87171" :
        (color === "#16a34a" || color === "#4ade80") ? "#4ade80" :
        "rgba(255,255,255,0.4)";
    }
    var dot  = document.getElementById("utl-dot");
    var ring = document.getElementById("utl-dot-r");
    if (dot && ring) {
      var dc = (color === "#e11d48" || color === "#f87171") ? "#f87171" : "#4ade80";
      dot.style.background  = dc;
      ring.style.background = dc;
    }
  }

  function log(msg, type) {
    var el = document.getElementById("utl-log");
    if (!el) return;
    type = type || "info";
    var icons = { info:"O", ok:"O", warn:"!", err:"!" };
    var cls   = { info:"utl-info", ok:"utl-ok", warn:"utl-warn", err:"utl-err" };
    var row = document.createElement("div");
    row.className = "utl-row " + (cls[type] || "utl-info");
    row.style.animationDelay = Math.min(el.children.length * 30, 180) + "ms";
    row.innerHTML =
      '<span class="utl-ic">' + (icons[type] || "O") + "</span>" +
      '<span class="utl-msg">' + msg + "</span>";
    el.appendChild(row);
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }
  // wraps wait() to also update the progress bar and timers in ui
  var _origWait = wait;
  wait = async function(seconds, label) {
    var fill      = document.getElementById("utl-bar-fill");
    var bar       = document.getElementById("utl-bar");
    var timer     = document.getElementById("utl-timer");
    var miniStep  = document.getElementById("utl-mini-step");
    var miniTimer = document.getElementById("utl-mini-timer");
    if (bar)  bar.classList.add("on");

    var start    = Date.now();
    var end      = start + seconds * 1000;
    var startPct = fill ? parseFloat(fill.style.width) || 0 : 0;
    var endPct   = 90;

    if (miniStep) miniStep.textContent = label || "";

    var tick = setInterval(function() {
      var now    = Date.now();
      var remain = Math.max(0, Math.ceil((end - now) / 1000));
      var prog   = Math.min(1, (now - start) / (seconds * 1000));
      var pct    = startPct + prog * (endPct - startPct);
      var mm     = Math.floor(remain / 60), ss = remain % 60;
      var ts     = (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
      if (fill)      fill.style.width      = pct + "%";
      if (timer)     timer.textContent     = ts;
      if (miniTimer) miniTimer.textContent = ts;
      if (now >= end) clearInterval(tick);
    }, 500);

    await _origWait(seconds, label);
    clearInterval(tick);
    if (timer)     timer.textContent     = "";
    if (miniTimer) miniTimer.textContent = "";
    if (miniStep)  miniStep.textContent  = "";
  };
  async function start() {
    const inputEl = document.getElementById("utl-input");
    const inp = toUrl(inputEl ? inputEl.value.trim() : "");
    let config = null;

    try {
      if (!inp || inp.length < 3) {
        log("URL not found!", "err");
        setMsg("URL not found!", "#e11d48");
        return;
      }

      log("Input: " + inp, "info");
      saveDomain(inp);
      domain = inp;

      // try json config first
      if (inp.includes("{") && inp.includes("rd")) {
        try {
          const cfg = JSON.parse(inp);
          if (cfg.rd && cfg.dm) {
            config = cfg;
            log("try parsing.", "ok");
          }
        } catch (e) {
          log("parse failed: " + e.message, "warn");
        }
      }
      else if (/^[a-f0-9]{32}$/i.test(inp)) {
        config = { rd: inp, dm: "https://octolink.vip", ad: 5, w1: 52, w2: 22, w3: 7 };
        log("Failed, falling back (may be got 404)", "info");
      }

      if (!config) {
        log("Loading uptolink config...", "info");
        setMsg("getting config...");
        config = await getConfig(inp);
        if (config) {
          log("Config OK — rd: " + config.rd.slice(0,8) + "... dm: " + config.dm, "ok");
        hideInput();
        }
      }

      if (!config) {
        log("Failed to get config", "err");
        setMsg("Failed to get config!", "#e11d48");
        return;
      }

      await run(config);

    } catch (err) {
      console.error("error:", err);
      const msg = err && err.message ? err.message : String(err);
      log("err: " + msg, "err");
      setMsg("err: " + msg, "#e11d48");
    }
  }

  // if loaded with ?utl_url= param, skip ui and redirect immediately
  (function checkUtlRedirect() {

    var params = new URLSearchParams(location.search);
    var dest = params.get("utl_url");
    if (dest) {
      dest = toUrl(dest);
      console.log("redirect to:", dest);
      setTimeout(function() { window.location.replace(dest); }, 200);
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initUI);
    } else {
      initUI();
    }
  })();
})();
