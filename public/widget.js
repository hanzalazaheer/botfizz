(function () {
  "use strict";

  var cfg = window.aiChatConfig || {};
  var siteId = cfg.siteId;
  var channelId = cfg.channelId;
  var baseUrl = (cfg.url || "https://botfizz.com").replace(/\/$/, "");

  if (!siteId) return;

  var isOpen = false;
  var screen = "home";
  var messages = [];
  var conversationId = null;
  var expandedFaqId = null;
  var searchQuery = "";
  var qaPairs = [];
  var conf = {};

  var visitorId = (function () {
    try {
      var v = localStorage.getItem("_bf_vid");
      if (!v) { v = "v" + Math.random().toString(36).slice(2); localStorage.setItem("_bf_vid", v); }
      return v;
    } catch (e) { return "v" + Math.random().toString(36).slice(2); }
  })();

  var fontFamilyMap = {
    system: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    inter: "'Inter',sans-serif",
    roboto: "'Roboto',sans-serif",
    "open-sans": "'Open Sans',sans-serif",
    poppins: "'Poppins',sans-serif",
    lato: "'Lato',sans-serif",
    montserrat: "'Montserrat',sans-serif",
    nunito: "'Nunito',sans-serif",
    raleway: "'Raleway',sans-serif",
    playfair: "'Playfair Display',serif",
    "source-sans": "'Source Sans 3',sans-serif",
    "pt-sans": "'PT Sans',sans-serif"
  };

  var googleFontLinks = {
    inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
    "open-sans": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap",
    poppins: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
    lato: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap",
    montserrat: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
    nunito: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap",
    raleway: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap",
    playfair: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap",
    "source-sans": "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap",
    "pt-sans": "https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
  };

  function g(k, d) { return conf[k] !== undefined ? conf[k] : d; }
  function pc() { return g("primaryColor", "#10b981"); }
  function ac() { return g("accentColor", "#3b82f6"); }
  function spd() { var m = { none:"0s", slow:"0.5s", normal:"0.3s", fast:"0.15s" }; return m[g("animationSpeed","normal")] || "0.3s"; }
  function shd() { var m = { none:"none", light:"0 4px 16px rgba(0,0,0,.1)", medium:"0 10px 40px rgba(0,0,0,.2)", strong:"0 16px 64px rgba(0,0,0,.3)" }; return m[g("shadowIntensity","medium")] || m.medium; }
  function fam() { return fontFamilyMap[g("fontFamily","system")] || fontFamilyMap.system; }
  function rad() { var r = g("roundedCorners","xl"); return r==="sm"?"8px":r==="lg"?"16px":"24px"; }
  function hdrBg() { return g("widgetStyle","solid")==="modern" ? "linear-gradient(135deg,"+pc()+","+ac()+")" : pc(); }
  function btnBg() { var s=g("buttonStyle","solid"); if(s==="gradient") return "linear-gradient(135deg,"+pc()+","+ac()+")"; if(s==="outline") return "transparent"; return pc(); }
  function btnClr() { return g("buttonStyle","solid")==="outline" ? pc() : "#fff"; }
  function btnBdr() { return g("buttonStyle","solid")==="outline" ? "2px solid "+pc() : "none"; }
  function lchBg() { var s=g("buttonStyle","solid"); if(s==="gradient") return "linear-gradient(135deg,"+pc()+","+ac()+")"; if(s==="outline") return "#fff"; return pc(); }
  function lchBdr() { return g("buttonStyle","solid")==="outline" ? "3px solid "+pc() : "none"; }
  function lchIco() { return g("buttonStyle","solid")==="outline" ? pc() : "#fff"; }
  function getPos() { var p=g("position","bottom-right"); return { right:p.indexOf("right")!==-1, top:p.indexOf("top")!==-1 }; }

  function qsa(el, sel, fn) { var nl=el.querySelectorAll(sel); for(var i=0;i<nl.length;i++) fn(nl[i]); }

  var SVG = {
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    back: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    chevR: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    chevD: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
  };

  function nowTime() { var d=new Date(),h=d.getHours(),m=d.getMinutes(); return (h%12||12)+":"+(m<10?"0"+m:m)+" "+(h<12?"AM":"PM"); }

  function loadFont(key) {
    if (!googleFontLinks[key]) return;
    if (document.querySelector('[data-bffont="'+key+'"]')) return;
    var l = document.createElement("link"); l.rel="stylesheet"; l.href=googleFontLinks[key]; l.setAttribute("data-bffont",key);
    document.head.appendChild(l);
  }

  function injectCSS(speed, color) {
    var old = document.getElementById("_bf-styles"); if (old) old.remove();
    var s = document.createElement("style"); s.id="_bf-styles";
    s.textContent = [
      "._bf-btn{position:fixed;z-index:2147483647;width:58px;height:58px;border-radius:50%;cursor:pointer;display:flex!important;align-items:center;justify-content:center;padding:0}",
      "._bf-btn:hover{transform:scale(1.08)}",
      "._bf-panel{position:fixed;z-index:2147483646;width:380px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 120px);display:flex;flex-direction:column;background:#fff;overflow:hidden}",
      "._bf-panel._bf-closed{opacity:0!important;pointer-events:none!important;transform:translateY(14px)!important}",
      "._bf-head{padding:16px;color:#fff;flex-shrink:0}",
      "._bf-hrow{display:flex;align-items:center;justify-content:space-between;gap:8px}",
      "._bf-hleft{display:flex;align-items:center;gap:12px;flex:1;min-width:0}",
      "._bf-logo{width:40px;height:40px;object-fit:contain;border-radius:4px}",
      "._bf-htitle{font-size:17px;font-weight:600;margin:0;line-height:1.2;color:#fff}",
      "._bf-hsub{font-size:13px;opacity:.9;margin:3px 0 0;color:#fff}",
      "._bf-hlabel{font-weight:500;font-size:14px;color:#fff;flex:1;text-align:center}",
      "._bf-ibtn{background:none;border:none;cursor:pointer;color:#fff;padding:4px;border-radius:4px;display:flex;align-items:center;justify-content:center}",
      "._bf-ibtn:hover{background:rgba(255,255,255,.2)}",
      "._bf-content{flex:1;overflow-y:auto;background:#f8fafb}",
      "._bf-home{padding:16px;display:flex;flex-direction:column;gap:16px}",
      "._bf-card{background:#f8fafc;border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:12px}",
      "._bf-avrow{display:flex;align-items:center;gap:12px}",
      "._bf-avs{display:flex}",
      "._bf-av{width:40px;height:40px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#fff;overflow:hidden;flex-shrink:0;box-sizing:border-box}",
      "._bf-av img{width:100%;height:100%;object-fit:cover}",
      "._bf-rtime{flex:1}",
      "._bf-rlbl{font-size:12px;color:#6b7280;margin:0 0 2px}",
      "._bf-rval{font-size:13px;font-weight:500;color:#111827;display:flex;align-items:center;gap:4px;margin:0}",
      "._bf-sbtn{width:100%;padding:11px 16px;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:opacity "+speed+" ease;font-family:inherit}",
      "._bf-sbtn:hover{opacity:.88}",
      "._bf-ftitle{font-size:14px;font-weight:500;margin:0;color:#111827}",
      "._bf-swrap{position:relative}",
      "._bf-sinp{width:100%;padding:9px 36px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:13px;background:#fff;cursor:pointer;box-sizing:border-box;outline:none;color:#374151;font-family:inherit}",
      "._bf-sico{position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;display:flex;align-items:center}",
      "._bf-sarr{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;display:flex;align-items:center}",
      "._bf-sectitle{font-size:12px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.05em;margin:0}",
      "._bf-flist{display:flex;flex-direction:column;gap:8px}",
      "._bf-fi{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff}",
      "._bf-fq{width:100%;text-align:left;padding:12px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;transition:background "+speed+" ease}",
      "._bf-fq:hover{background:#f8fafc}",
      "._bf-fqtxt{flex:1;min-width:0}",
      "._bf-fqtitle{font-size:13px;font-weight:500;color:#1e293b;margin:0;line-height:1.4}",
      "._bf-fqcat{font-size:11px;color:#94a3b8;margin:2px 0 0}",
      "._bf-fchev{flex-shrink:0;color:#94a3b8;transition:transform "+speed+" ease;display:flex;align-items:center}",
      "._bf-fchev._bf-open{transform:rotate(180deg)}",
      "._bf-fans{overflow:hidden;max-height:0;opacity:0;transition:max-height "+speed+" ease,opacity "+speed+" ease}",
      "._bf-fans._bf-open{max-height:300px;opacity:1}",
      "._bf-fansinn{padding:0 12px 12px}",
      "._bf-fanstxt{font-size:13px;color:#475569;line-height:1.6;background:#f8fafc;border-radius:8px;padding:12px;border-left:3px solid "+color+"}",
      "._bf-chat{display:flex;flex-direction:column;height:100%}",
      "._bf-marea{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}",
      "._bf-mrow{display:flex;gap:8px;align-items:flex-end}",
      "._bf-mrow._bf-u{justify-content:flex-end}",
      "._bf-mrow._bf-b{justify-content:flex-start}",
      "._bf-aiav{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#fff;flex-shrink:0}",
      "._bf-bub{border-radius:12px;padding:10px 13px;max-width:80%;font-size:13px;line-height:1.5;word-break:break-word}",
      "._bf-bub._bf-b{background:#f1f5f9;color:#1e293b}",
      "._bf-btime{font-size:11px;opacity:.7;margin:3px 0 0;display:block}",
      "._bf-typing{display:flex;gap:4px;align-items:center;padding:4px 2px}",
      "._bf-dot{width:6px;height:6px;border-radius:50%;background:#b0b7c3;animation:_bfb 1.2s infinite}",
      "._bf-dot:nth-child(2){animation-delay:.2s}._bf-dot:nth-child(3){animation-delay:.4s}",
      "@keyframes _bfb{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}",
      "._bf-irow{padding:12px 16px;border-top:1px solid #e8eaed;background:#fff;display:flex;gap:8px;flex-shrink:0}",
      "._bf-cinp{flex:1;border:1.5px solid #e4e7eb;border-radius:9px;padding:9px 12px;font-size:13px;outline:none;background:#fff;font-family:inherit}",
      "._bf-cinp:focus{border-color:"+color+"}",
      "._bf-sndbtn{width:38px;min-width:38px;height:38px;border:none;border-radius:9px;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}",
      "._bf-sndbtn:hover{opacity:.88}",
      "._bf-ss{padding:16px;display:flex;flex-direction:column;gap:12px}",
      "._bf-ssinp{width:100%;padding:9px 12px 9px 36px;border:1.5px solid #e5e7eb;border-radius:9px;font-size:13px;background:#fff;box-sizing:border-box;outline:none;color:#374151;font-family:inherit}",
      "._bf-ssinp:focus{border-color:"+color+"}",
      "._bf-ssitem{border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:#fff}",
      "._bf-ssq{width:100%;text-align:left;padding:12px;background:none;border:none;cursor:pointer;display:flex;align-items:flex-start;gap:8px;transition:background "+speed+" ease}",
      "._bf-ssq:hover{background:#f8fafc}",
      "._bf-ssqinn{flex:1;min-width:0}",
      "._bf-ssqtitle{font-size:13px;font-weight:500;color:#1e293b;margin:0;line-height:1.4}",
      "._bf-ssqcat{font-size:11px;color:#94a3b8;margin:2px 0 0}",
      "._bf-pw{padding:10px;border-top:1px solid #f1f5f9;text-align:center;font-size:11px;color:#b0b7c3;background:#fff;flex-shrink:0}",
      "._bf-pw a{color:#b0b7c3;text-decoration:none}"
    ].join("");
    document.head.appendChild(s);
  }

  var _btn, _panel, _content, _pw;

  function buildWidget() {
    if (_panel) _panel.remove();
    if (_btn) _btn.remove();

    var p = getPos();
    var speed = spd();
    var color = pc();
    loadFont(g("fontFamily","system"));
    injectCSS(speed, color);

    var hside = (p.right ? "right" : "left") + ":24px;";
    var bvpos = (p.top ? "top" : "bottom") + ":24px;";
    var pvpos = (p.top ? "top" : "bottom") + ":96px;";
    var iconClr = lchIco();

    _btn = document.createElement("button");
    _btn.className = "_bf-btn";
    _btn.type = "button";
    _btn.setAttribute("aria-label","Open chat");
    _btn.style.cssText = hside + bvpos + "background:" + lchBg() + ";border:" + lchBdr() + ";box-shadow:" + shd() + ";transition:transform " + speed + ",box-shadow " + speed;
    _btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="'+iconClr+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

    _panel = document.createElement("div");
    _panel.className = "_bf-panel _bf-closed";
    _panel.style.cssText = hside + pvpos + "border-radius:" + rad() + ";box-shadow:" + shd() + ";font-family:" + fam() + ";transition:opacity " + speed + " ease,transform " + speed + " ease";

    _panel.appendChild(buildHeader());

    _content = document.createElement("div");
    _content.className = "_bf-content";
    _panel.appendChild(_content);

    if (g("showPoweredBy", true)) {
      _pw = document.createElement("div");
      _pw.className = "_bf-pw";
      _pw.innerHTML = 'Powered by <a href="https://botfizz.com" target="_blank" rel="noopener">' + g("appName","Botfizz") + '</a>';
      _panel.appendChild(_pw);
    }

    renderScreen();

    document.body.appendChild(_btn);
    document.body.appendChild(_panel);

    _btn.addEventListener("click", function () {
      isOpen = !isOpen;
      if (isOpen) {
        _panel.classList.remove("_bf-closed");
      } else {
        _panel.classList.add("_bf-closed");
      }
    });
  }

  function buildHeader() {
    var head = document.createElement("div");
    head.className = "_bf-head";
    head.id = "_bf-head";
    head.style.background = hdrBg();
    refreshHeader(head);
    return head;
  }

  function refreshHeader(head) {
    if (!head) head = document.getElementById("_bf-head");
    if (!head) return;
    head.innerHTML = "";
    var row = document.createElement("div"); row.className = "_bf-hrow";

    if (screen === "home") {
      var left = document.createElement("div"); left.className = "_bf-hleft";
      var logoUrl = g("logoUrl","");
      if (logoUrl) {
        var logo = document.createElement("img"); logo.className = "_bf-logo"; logo.src = logoUrl; logo.alt = "";
        logo.onerror = function () { this.style.display = "none"; };
        left.appendChild(logo);
      }
      var txt = document.createElement("div");
      var t1 = document.createElement("p"); t1.className = "_bf-htitle"; t1.textContent = g("title","Chat with us");
      var t2 = document.createElement("p"); t2.className = "_bf-hsub"; t2.textContent = g("subtitle","We typically reply in a few minutes");
      txt.appendChild(t1); txt.appendChild(t2);
      left.appendChild(txt);
      row.appendChild(left);
    } else {
      var back = document.createElement("button"); back.className = "_bf-ibtn"; back.innerHTML = SVG.back;
      back.onclick = function () { goTo("home"); };
      row.appendChild(back);
      var lbl = document.createElement("span"); lbl.className = "_bf-hlabel";
      lbl.textContent = screen === "chat" ? "Conversation" : "Search FAQs";
      row.appendChild(lbl);
    }

    var close = document.createElement("button"); close.className = "_bf-ibtn"; close.innerHTML = SVG.x;
    close.onclick = function () { isOpen = false; _panel.classList.add("_bf-closed"); };
    row.appendChild(close);
    head.appendChild(row);
  }

  function goTo(newScreen) {
    screen = newScreen;
    refreshHeader();
    renderScreen();
  }

  function renderScreen() {
    if (!_content) return;
    _content.innerHTML = "";
    if (_pw) _pw.style.display = screen === "home" ? "" : "none";
    if (screen === "home") renderHome();
    else if (screen === "chat") renderChat();
    else if (screen === "search") renderSearch();
  }

  // ── HOME ─────────────────────────────────────────────────────────────────────
  function renderHome() {
    var color = pc();
    var wrap = document.createElement("div"); wrap.className = "_bf-home";

    // Card: avatars + reply time + start button
    var card = document.createElement("div"); card.className = "_bf-card";
    var avrow = document.createElement("div"); avrow.className = "_bf-avrow";

    if (g("showTeamAvatars", true)) {
      var members = g("teamMembers", []);
      if (members.length > 0) {
        var avs = document.createElement("div"); avs.className = "_bf-avs";
        for (var i = 0; i < Math.min(members.length, 3); i++) {
          (function (m, idx) {
            var av = document.createElement("div"); av.className = "_bf-av";
            av.style.cssText = "background:" + color + ";margin-left:" + (idx === 0 ? "0" : "-8px");
            if (m.avatar) {
              var img = document.createElement("img"); img.src = m.avatar; img.alt = m.name || "";
              img.onerror = function () { img.style.display = "none"; av.textContent = (m.name||"?")[0]; };
              av.appendChild(img);
            } else {
              av.textContent = (m.name||"?")[0];
            }
            avs.appendChild(av);
          })(members[i], i);
        }
        avrow.appendChild(avs);
      }
    }

    var rt = document.createElement("div"); rt.className = "_bf-rtime";
    var rl = document.createElement("p"); rl.className = "_bf-rlbl"; rl.textContent = "Our usual reply time";
    var rv = document.createElement("p"); rv.className = "_bf-rval";
    rv.innerHTML = SVG.clock + "<span>" + g("responseTime","A few minutes") + "</span>";
    rt.appendChild(rl); rt.appendChild(rv);
    avrow.appendChild(rt);
    card.appendChild(avrow);

    var sbtn = document.createElement("button"); sbtn.className = "_bf-sbtn";
    sbtn.style.cssText = "background:" + btnBg() + ";color:" + btnClr() + ";border:" + btnBdr();
    var chatIco = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="'+btnClr()+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    sbtn.innerHTML = chatIco + "<span>" + g("messengerButtonText","Send us a message") + "</span>";
    sbtn.onmouseenter = function () { this.style.opacity = ".88"; };
    sbtn.onmouseleave = function () { this.style.opacity = "1"; };
    sbtn.onclick = function () { goTo("chat"); };
    card.appendChild(sbtn);
    wrap.appendChild(card);

    if (g("showRecentArticles", true)) {
      var findLbl = document.createElement("p"); findLbl.className = "_bf-ftitle"; findLbl.textContent = "Find an answer quickly";
      wrap.appendChild(findLbl);

      var swrap = document.createElement("div"); swrap.className = "_bf-swrap";
      var sico = document.createElement("span"); sico.className = "_bf-sico"; sico.innerHTML = SVG.search;
      var sinp = document.createElement("input"); sinp.className = "_bf-sinp"; sinp.type = "text"; sinp.readOnly = true;
      sinp.placeholder = g("messengerSearchPlaceholder","Search for help...");
      sinp.onclick = function () { goTo("search"); };
      var sarr = document.createElement("span"); sarr.className = "_bf-sarr"; sarr.innerHTML = SVG.chevR;
      swrap.appendChild(sico); swrap.appendChild(sinp); swrap.appendChild(sarr);
      wrap.appendChild(swrap);

      var active = qaPairs.filter(function (q) { return q.isActive !== false; });
      var display = active.slice(0, g("articlesCount", 5));
      if (display.length > 0) {
        var fsec = document.createElement("div"); fsec.style.cssText = "display:flex;flex-direction:column;gap:8px";
        var ftitle = document.createElement("p"); ftitle.className = "_bf-sectitle"; ftitle.textContent = "Popular FAQs";
        fsec.appendChild(ftitle);
        var flist = document.createElement("div"); flist.className = "_bf-flist";
        for (var j = 0; j < display.length; j++) flist.appendChild(mkFaq(display[j], color, flist));
        fsec.appendChild(flist);
        wrap.appendChild(fsec);
      }
    }

    _content.appendChild(wrap);
  }

  function mkFaq(qa, color, list) {
    var item = document.createElement("div"); item.className = "_bf-fi";
    var qBtn = document.createElement("button"); qBtn.className = "_bf-fq";
    var qtxt = document.createElement("div"); qtxt.className = "_bf-fqtxt";
    var qtitle = document.createElement("p"); qtitle.className = "_bf-fqtitle"; qtitle.textContent = qa.question;
    var qcat = document.createElement("p"); qcat.className = "_bf-fqcat"; qcat.textContent = qa.category || "";
    qtxt.appendChild(qtitle); qtxt.appendChild(qcat);
    var chev = document.createElement("span"); chev.className = "_bf-fchev"; chev.innerHTML = SVG.chevD;
    qBtn.appendChild(qtxt); qBtn.appendChild(chev);
    item.appendChild(qBtn);

    var ans = document.createElement("div"); ans.className = "_bf-fans";
    var ansInn = document.createElement("div"); ansInn.className = "_bf-fansinn";
    var ansTxt = document.createElement("div"); ansTxt.className = "_bf-fanstxt"; ansTxt.style.borderLeftColor = color;
    ansTxt.textContent = qa.answer || "No answer provided yet.";
    ansInn.appendChild(ansTxt); ans.appendChild(ansInn); item.appendChild(ans);

    if (expandedFaqId === qa.id) { ans.classList.add("_bf-open"); chev.classList.add("_bf-open"); }

    qBtn.onclick = function () {
      var willOpen = expandedFaqId !== qa.id;
      qsa(list, "._bf-fans", function(a){a.classList.remove("_bf-open");});
      qsa(list, "._bf-fchev", function(c){c.classList.remove("_bf-open");});
      expandedFaqId = willOpen ? qa.id : null;
      if (willOpen) { ans.classList.add("_bf-open"); chev.classList.add("_bf-open"); }
    };
    return item;
  }

  // ── CHAT ─────────────────────────────────────────────────────────────────────
  function renderChat() {
    var color = pc();
    var wrap = document.createElement("div"); wrap.className = "_bf-chat";
    var marea = document.createElement("div"); marea.className = "_bf-marea"; marea.id = "_bf-marea";

    if (messages.length === 0) {
      messages.push({ role:"bot", content:g("greeting","Hi! How can we help you?"), time:nowTime() });
    }
    for (var i = 0; i < messages.length; i++) marea.appendChild(mkBubble(messages[i], color));
    wrap.appendChild(marea);

    var irow = document.createElement("div"); irow.className = "_bf-irow";
    var inp = document.createElement("input"); inp.className = "_bf-cinp"; inp.type = "text";
    inp.placeholder = "Type your message..."; inp.autocomplete = "off";
    var sndbtn = document.createElement("button"); sndbtn.className = "_bf-sndbtn"; sndbtn.type = "button";
    sndbtn.style.background = color; sndbtn.innerHTML = SVG.send;

    var doSend = function () {
      var v = inp.value.trim(); if (!v) return;
      inp.value = ""; sendMsg(v, marea, color);
    };
    sndbtn.onclick = doSend;
    inp.addEventListener("keydown", function (e) { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();doSend();} });
    irow.appendChild(inp); irow.appendChild(sndbtn);
    wrap.appendChild(irow);
    _content.appendChild(wrap);
    scrollMsgs();
    setTimeout(function () { inp.focus(); }, 50);
  }

  function mkBubble(msg, color) {
    var row = document.createElement("div"); row.className = "_bf-mrow " + (msg.role==="user"?"_bf-u":"_bf-b");
    if (msg.role === "bot") {
      var av = document.createElement("div"); av.className = "_bf-aiav"; av.style.background = color; av.textContent = "AI";
      row.appendChild(av);
    }
    var bub = document.createElement("div"); bub.className = "_bf-bub " + (msg.role==="user"?"_bf-u":"_bf-b");
    if (msg.role === "user") bub.style.background = color;
    var txt = document.createElement("p"); txt.style.margin = "0"; txt.textContent = msg.content;
    bub.appendChild(txt);
    if (msg.time) { var t = document.createElement("span"); t.className = "_bf-btime"; t.textContent = msg.time; bub.appendChild(t); }
    row.appendChild(bub);
    return row;
  }

  function mkTypingRow(color) {
    var row = document.createElement("div"); row.className = "_bf-mrow _bf-b _bf-typr";
    var av = document.createElement("div"); av.className = "_bf-aiav"; av.style.background = color; av.textContent = "AI"; row.appendChild(av);
    var bub = document.createElement("div"); bub.className = "_bf-bub _bf-b";
    bub.innerHTML = '<div class="_bf-typing"><span class="_bf-dot"></span><span class="_bf-dot"></span><span class="_bf-dot"></span></div>';
    row.appendChild(bub); return row;
  }

  function scrollMsgs() { var a = document.getElementById("_bf-marea"); if (a) a.scrollTop = a.scrollHeight; }

  function sendMsg(text, marea, color) {
    var t = nowTime();
    messages.push({ role:"user", content:text, time:t });
    marea.appendChild(mkBubble({role:"user",content:text,time:t}, color));
    var trow = mkTypingRow(color); marea.appendChild(trow); scrollMsgs();

    var body = { siteId:siteId, channelId:channelId, message:text, visitorId:visitorId, history:messages.slice(-10) };
    if (conversationId) body.conversationId = conversationId;

    fetch(baseUrl+"/api/widget/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
      .then(function(r){return r.json();})
      .then(function(data){
        trow.remove();
        if (data.conversationId) conversationId = data.conversationId;
        var reply = data.reply||data.message||data.response||"Sorry, I couldn't process that. Please try again.";
        var bt = nowTime();
        messages.push({ role:"bot", content:reply, time:bt });
        marea.appendChild(mkBubble({role:"bot",content:reply,time:bt}, color));
        scrollMsgs();
      })
      .catch(function(){
        trow.remove();
        var bt = nowTime(), err = "Connection error. Please try again.";
        messages.push({ role:"bot", content:err, time:bt });
        marea.appendChild(mkBubble({role:"bot",content:err,time:bt}, color));
        scrollMsgs();
      });
  }

  // ── SEARCH ───────────────────────────────────────────────────────────────────
  function renderSearch() {
    var color = pc();
    var wrap = document.createElement("div"); wrap.className = "_bf-ss";

    var swrap = document.createElement("div"); swrap.className = "_bf-swrap";
    var sico = document.createElement("span"); sico.className = "_bf-sico"; sico.innerHTML = SVG.search;
    var sinp = document.createElement("input"); sinp.className = "_bf-ssinp"; sinp.type = "text";
    sinp.placeholder = "Search FAQs..."; sinp.value = searchQuery;
    swrap.appendChild(sico); swrap.appendChild(sinp);
    wrap.appendChild(swrap);

    var results = document.createElement("div"); results.style.cssText = "display:flex;flex-direction:column;gap:8px";
    wrap.appendChild(results);

    function rerender(q) {
      results.innerHTML = "";
      var active = qaPairs.filter(function(p){return p.isActive!==false;});
      var filtered;
      if (q) {
        var lq = q.toLowerCase();
        filtered = active.filter(function(qa){
          return (qa.question&&qa.question.toLowerCase().indexOf(lq)!==-1)||
                 (qa.answer&&qa.answer.toLowerCase().indexOf(lq)!==-1)||
                 (qa.category&&qa.category.toLowerCase().indexOf(lq)!==-1);
        });
      } else { filtered = active.slice(0, g("articlesCount",5)); }

      var lbl = document.createElement("p"); lbl.style.cssText="font-size:13px;font-weight:500;color:#6b7280;margin:0";
      lbl.textContent = q ? "Search results" : "Popular FAQs";
      results.appendChild(lbl);

      if (!filtered.length) {
        var em = document.createElement("p"); em.style.cssText="font-size:13px;color:#9ca3af;text-align:center;padding:16px 0;margin:0";
        em.textContent = q ? "No FAQs match your search" : "No FAQs available";
        results.appendChild(em); return;
      }

      var list = document.createElement("div"); list.style.cssText="display:flex;flex-direction:column;gap:8px";
      for (var i = 0; i < filtered.length; i++) {
        (function(qa){
          var item = document.createElement("div"); item.className = "_bf-ssitem";
          var qBtn = document.createElement("button"); qBtn.className = "_bf-ssq";
          var helpIco = document.createElement("span"); helpIco.style.cssText="flex-shrink:0;margin-top:2px;display:flex;color:"+color;
          helpIco.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="'+color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
          var qInn = document.createElement("div"); qInn.className = "_bf-ssqinn";
          var qt = document.createElement("p"); qt.className = "_bf-ssqtitle"; qt.textContent = qa.question;
          var qc = document.createElement("p"); qc.className = "_bf-ssqcat"; qc.textContent = qa.category||"";
          qInn.appendChild(qt); qInn.appendChild(qc);
          var chev = document.createElement("span"); chev.className = "_bf-fchev"; chev.style.cssText="flex-shrink:0;margin-top:2px"; chev.innerHTML = SVG.chevD;
          qBtn.appendChild(helpIco); qBtn.appendChild(qInn); qBtn.appendChild(chev);
          item.appendChild(qBtn);

          var ans = document.createElement("div"); ans.className = "_bf-fans";
          var ansInn = document.createElement("div"); ansInn.style.cssText="padding:0 12px 12px 40px";
          var ansTxt = document.createElement("div"); ansTxt.className = "_bf-fanstxt"; ansTxt.style.borderLeftColor = color;
          ansTxt.textContent = qa.answer||"No answer provided yet.";
          ansInn.appendChild(ansTxt); ans.appendChild(ansInn); item.appendChild(ans);

          if (expandedFaqId===qa.id){ ans.classList.add("_bf-open"); chev.classList.add("_bf-open"); }

          qBtn.onclick = function(){
            var willOpen = expandedFaqId!==qa.id;
            qsa(list,"._bf-fans",function(a){a.classList.remove("_bf-open");});
            qsa(list,"._bf-fchev",function(c){c.classList.remove("_bf-open");});
            expandedFaqId = willOpen?qa.id:null;
            if(willOpen){ans.classList.add("_bf-open");chev.classList.add("_bf-open");}
          };
          list.appendChild(item);
        })(filtered[i]);
      }
      results.appendChild(list);
    }

    sinp.addEventListener("input", function(){ searchQuery=this.value; rerender(searchQuery); });
    rerender(searchQuery);
    _content.appendChild(wrap);
    setTimeout(function(){ sinp.focus(); }, 50);
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────
  function init() {
    Promise.all([
      fetch(baseUrl+"/api/widget/config/"+encodeURIComponent(siteId)).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
      fetch(baseUrl+"/api/widget/qa/"+encodeURIComponent(siteId)).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;})
    ]).then(function(res){
      conf = (res[0]&&res[0].config) ? res[0].config : {};
      qaPairs = (res[1]&&res[1].qaPairs) ? res[1].qaPairs : [];
      buildWidget();
    });
  }

  if (document.readyState==="loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
