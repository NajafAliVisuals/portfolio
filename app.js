/* Najaf Ali — portfolio interactions.
   You don't need to edit this file. All video links live in videos.js */

(function () {
  "use strict";

  // Animations always run. (Before, they all switched off when Windows/Mac had
  // "animation effects" turned off — which made the site look frozen.)
  var reduce = false;
  var lite = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
             (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
             window.innerWidth < 760;
  if (lite) document.body.classList.add("lite");
  var fine = window.matchMedia("(pointer: fine)").matches;
  var targetY = window.pageYOffset || 0, smoothY = targetY;
  var docH = 1, p = 0, sp = 0;               // p = raw progress, sp = smoothed

  var treeDocTop = 0, treeDocH = 0, lastTreeTf = "";
  function measureTree() {
    var t = document.getElementById("tree");
    if (!t) return;
    var y = 0, el = t;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    treeDocTop = y; treeDocH = t.offsetHeight;
  }
  function measure() {
    docH = Math.max(1, document.body.scrollHeight - window.innerHeight);
    measureTree();
  }
  measure();

  /* =========================================================
     NATURE — falling leaves + sunlit motes by day, fireflies by night
     ========================================================= */
  var canvas = document.getElementById("natureCanvas");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var w = 0, h = 0, dpr = 1, leaves = [], flies = [], glowDay = null, glowNight = null;
  var mouse = { x: -999, y: -999, vx: 0, vy: 0 }, lastScrollY = window.pageYOffset || 0;
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var DAY_LEAF = ["#7ea86a", "#a3b865", "#c7a35a", "#5e8e5c", "#b9c88c", "#d49a63"];
  var NIGHT_LEAF = ["#2f4a37", "#3b5a43", "#4a5f3e", "#33463a"];

  function glowSprite(rgb) {
    var c = document.createElement("canvas"); c.width = c.height = 48;
    var g = c.getContext("2d"), r = g.createRadialGradient(24, 24, 0, 24, 24, 24);
    r.addColorStop(0, "rgba(" + rgb + ",1)"); r.addColorStop(.25, "rgba(" + rgb + ",.6)");
    r.addColorStop(.6, "rgba(" + rgb + ",.12)"); r.addColorStop(1, "rgba(" + rgb + ",0)");
    g.fillStyle = r; g.fillRect(0, 0, 48, 48); return c;
  }
  function newLeaf(top) {
    var z = rand(.55, 1);
    return {
      x: rand(-40, w + 40), y: top ? rand(-h * .3, -20) : rand(-20, h),
      z: z, s: rand(9, 17) * z, vy: rand(.35, .75) * z, sway: rand(18, 46), ph: rand(0, 6.28),
      fr: rand(.0006, .0013), rot: rand(0, 6.28), vr: rand(-.012, .012), flip: rand(0, 6.28), vf: rand(.012, .03),
      ci: Math.floor(Math.random() * 6), dx: 0
    };
  }
  function newFly() {
    return { x: rand(0, w), y: rand(h * .15, h), a: rand(0, 6.28), sp: rand(.15, .45), ph: rand(0, 6.28),
             blink: rand(.0008, .0022), r: rand(10, 20), turn: rand(-.02, .02) };
  }
  function seedNature() {
    w = window.innerWidth; h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var nl = lite ? 7 : (w < 760 ? 8 : 15), nf = lite ? 14 : (w < 760 ? 16 : 30);
    leaves = []; flies = [];
    for (var i = 0; i < nl; i++) leaves.push(newLeaf(false));
    for (var j = 0; j < nf; j++) flies.push(newFly());
    if (!glowDay) { glowDay = glowSprite("255,226,160"); glowNight = glowSprite("200,255,150"); }
  }
  function drawLeaf(l, col, alpha) {
    ctx.save();
    ctx.translate(l.x + l.dx, l.y);
    ctx.rotate(l.rot);
    ctx.scale(Math.cos(l.flip) * l.s, l.s);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-1, 0);
    ctx.bezierCurveTo(-.55, -.62, .5, -.58, 1.05, 0);
    ctx.bezierCurveTo(.5, .58, -.55, .62, -1, 0);
    ctx.fill();
    ctx.globalAlpha = alpha * .45;
    ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = .06;
    ctx.beginPath(); ctx.moveTo(-1.2, 0); ctx.lineTo(.95, 0); ctx.stroke();
    ctx.restore();
  }
  function stepNature(time) {
    if (!ctx) return;
    var night = document.documentElement.getAttribute("data-theme") === "dark";
    var sy = window.pageYOffset || 0, ds = sy - lastScrollY; lastScrollY = sy;
    var wind = Math.sin(time / 5200) * .5 + Math.sin(time / 1900) * .25;
    ctx.clearRect(0, 0, w, h);

    // motes in the sunlight, or fireflies at night
    ctx.save();
    ctx.globalCompositeOperation = night ? "lighter" : "source-over";
    for (var j = 0; j < flies.length; j++) {
      var f = flies[j];
      f.a += f.turn + Math.sin(time / 1700 + f.ph) * .01;
      f.x += Math.cos(f.a) * f.sp + wind * .2;
      f.y += Math.sin(f.a) * f.sp * .7 - (night ? .04 : .1) - ds * .05;
      if (f.x < -30) f.x = w + 30; if (f.x > w + 30) f.x = -30;
      if (f.y < -30) f.y = h + 30; if (f.y > h + 30) f.y = -30;
      var b = .5 + .5 * Math.sin(time * f.blink + f.ph);
      var a = night ? Math.pow(b, 2.2) : .18 + b * .35;
      var r = night ? f.r : f.r * .45;
      ctx.globalAlpha = a;
      ctx.drawImage(night ? glowNight : glowDay, f.x - r / 2, f.y - r / 2, r, r);
    }
    ctx.restore();

    // falling leaves
    for (var i = 0; i < leaves.length; i++) {
      var l = leaves[i];
      l.y += l.vy - ds * .12 * l.z;
      l.x += (wind * .6 + .15) * l.z;
      l.dx = Math.sin(time * l.fr + l.ph) * l.sway;
      l.rot += l.vr + wind * .004;
      l.flip += l.vf;
      // the cursor pushes leaves aside like a breath of wind
      var mx = l.x + l.dx - mouse.x, my = l.y - mouse.y, d2 = mx * mx + my * my;
      if (d2 < 16000) {
        var push = (1 - d2 / 16000) * 2.2;
        var dd = Math.sqrt(d2) || 1;
        l.x += mx / dd * push + mouse.vx * .05; l.y += my / dd * push * .6 + mouse.vy * .05;
        l.vr += (Math.random() - .5) * .01;
      }
      l.vr *= .995;
      if (l.y > h + 40 || l.x > w + 80 || l.x < -80 || l.y < -h * .4) leaves[i] = newLeaf(true);
      var col = night ? NIGHT_LEAF[l.ci % NIGHT_LEAF.length] : DAY_LEAF[l.ci];
      drawLeaf(l, col, night ? .55 * l.z : .7 * l.z);
    }
    mouse.vx *= .9; mouse.vy *= .9;
  }
  if (ctx) {
    seedNature();
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { seedNature(); measure(); drawTree(); }, 200);
    });
    window.addEventListener("pointermove", function (e) {
      mouse.vx = e.clientX - (mouse.x < -900 ? e.clientX : mouse.x);
      mouse.vy = e.clientY - (mouse.y < -900 ? e.clientY : mouse.y);
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
    document.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });
  }

  /* =========================================================
     LIGHT / DARK switch
     ========================================================= */
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var root = document.documentElement;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.classList.add("theme-anim");
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    setTimeout(function () { root.classList.remove("theme-anim"); }, 800);
  });

  /* =========================================================
     MOTION — one smooth loop drives everything
     ========================================================= */
  var nav = document.getElementById("nav");
  var bar = document.getElementById("progress");
  var heroZoom = document.getElementById("heroZoom");
  var tree = document.getElementById("tree");

  window.addEventListener("scroll", function () { targetY = window.pageYOffset; }, { passive: true });


  var lastT = performance.now();
  function updateMotion(now) {
    now = now || performance.now();
    var dt = Math.min(4, Math.max(.2, (now - lastT) / 16.67));    // in frames, capped
    lastT = now;
    var k = function (r) { return reduce ? 1 : Math.min(1, r * dt); };

    smoothY += (targetY - smoothY) * k(.14);
    if (Math.abs(targetY - smoothY) < .4) smoothY = targetY;      // settle, don't creep forever
    p = Math.min(1, Math.max(0, targetY / docH));
    sp += (p - sp) * k(.08);
    if (Math.abs(p - sp) < .0006) sp = p;

    if (targetY > 24) nav.classList.add("is-stuck"); else nav.classList.remove("is-stuck");
    if (bar) bar.style.transform = "scaleX(" + p + ")";

    if (heroZoom && !reduce) {
      var hp = Math.min(1, smoothY / (window.innerHeight * 1.1));
      heroZoom.style.transform = "scale(" + (1 - hp * .07) + ") translateY(" + (hp * -20) + "px)";
      heroZoom.style.opacity = String(1 - hp * .6);
    }

    // 3D tilt of the whole line assembly (measured from layout, never from the
    // transformed box — otherwise the tilt feeds back into itself and jitters)
    if (tree && !reduce && treeDocH) {
      var mid = (treeDocTop - smoothY + treeDocH / 2 - window.innerHeight / 2) / (window.innerHeight + treeDocH);
      mid = Math.max(-1, Math.min(1, mid));
      var rx = (-mid * 8).toFixed(2), ry = (Math.sin(mid * 3.1) * 3).toFixed(2);
      var tf = "rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      if (tf !== lastTreeTf) { tree.style.transform = tf; lastTreeTf = tf; }   // no needless repaints
    }

    updateSpine();
  }

  var paused = false;
  document.addEventListener("visibilitychange", function () {
    paused = document.hidden;
    if (!paused && !reduce) requestAnimationFrame(loop);
  });

  function loop(time) {
    if (paused) return;
    updateMotion(time);
    stepNature(time);
    stepParticles(time);
    requestAnimationFrame(loop);
  }

  /* =========================================================
     POINTER light + portrait tilt
     ========================================================= */
  var torch = document.getElementById("torch");
  var eclipse = document.getElementById("eclipse");
  if (fine && !reduce) {
    var pending = false, mx = 0, my = 0;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        if (torch) { torch.classList.add("on"); torch.style.setProperty("--mx", mx + "px"); torch.style.setProperty("--my", my + "px"); }
        if (eclipse) {
          var r = eclipse.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) {
            var dx = Math.max(-1, Math.min(1, (mx - (r.left + r.width / 2)) / r.width));
            var dy = Math.max(-1, Math.min(1, (my - (r.top + r.height / 2)) / r.height));
            eclipse.style.transform = "perspective(1200px) translate3d(" + dx * -8 + "px," + dy * -6 + "px,0) rotateY(" + dx * 4 + "deg) rotateX(" + dy * -4 + "deg)";
          }
        }
      });
    }, { passive: true });
  }

  /* =========================================================
     REVEALS + counters
     ========================================================= */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .16, rootMargin: "0px 0px -8% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }

  var statEls = document.querySelectorAll(".stats dt");
  if (statEls.length && "IntersectionObserver" in window && !reduce) {
    var so = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; so.unobserve(el);
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var suffix = el.getAttribute("data-suffix") || "";
        var t0 = performance.now();
        (function step(now) {
          var k = Math.min(1, (now - t0) / 1400);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suffix;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .5 });
    statEls.forEach(function (el) { so.observe(el); });
  }

  /* =========================================================
     THE LINE — spine, branch fans, light particles
     ========================================================= */
  var SVGNS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("treeSvg");
  var spineBase, spineGlow, spine, gCon, gPart, particles = [], conMap = {};
  var spineLen = 0, drawnLen = 0;

  function el(name, attrs) {
    var e = document.createElementNS(SVGNS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function offsetIn(node, root) {
    var x = 0, y = 0, cur = node;
    while (cur && cur !== root) { x += cur.offsetLeft; y += cur.offsetTop; cur = cur.offsetParent; }
    return { x: x, y: y };
  }

  function buildSvg() {
    svg.innerHTML = "";
    var defs = el("defs");
    var grad = el("linearGradient", { id: "lineGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(el("stop", { offset: "0%", "class": "st1" }));
    grad.appendChild(el("stop", { offset: "45%", "class": "st2" }));
    grad.appendChild(el("stop", { offset: "100%", "class": "st3" }));
    defs.appendChild(grad);

    svg.appendChild(defs);

    spineBase = el("path", { "class": "ln-base", fill: "none", stroke: "rgba(86,214,155,.14)", "stroke-width": "1.4" });
    spineGlow = el("path", { "class": "ln-glow", fill: "none", stroke: "rgba(110,224,170,.16)", "stroke-width": "11", "stroke-linecap": "round" });
    spine = el("path", { fill: "none", stroke: "url(#lineGrad)", "stroke-width": "2.6", "stroke-linecap": "round" });
    gCon = el("g", {});
    gPart = el("g", {});
    svg.appendChild(spineBase); svg.appendChild(spineGlow); svg.appendChild(spine);
    svg.appendChild(gCon); svg.appendChild(gPart);

    particles = [];
    if (!reduce) {
      for (var i = 0; i < 14; i++) {
        var halo = el("circle", { "class": "ln-pth", r: (i % 4 === 0 ? 8 : 5.5), fill: "#6ee0aa", opacity: "0" });
        var c = el("circle", { "class": "ln-pt", r: (i % 4 === 0 ? 2.6 : 1.6), fill: i % 3 === 0 ? "#c9ffe6" : "#9bffcf", opacity: "0" });
        gPart.appendChild(halo); gPart.appendChild(c);
        particles.push({ el: c, halo: halo, p: Math.random(), sp: 0.00007 + Math.random() * 0.00012 });
      }
    }
  }

  function spineX(y, cx, amp) { return cx + Math.sin(y / 210) * amp + Math.sin(y / 91) * amp * .2; }

  function drawTree() {
    if (!tree || !svg) return;
    if (!spine) buildSvg();
    var W = tree.offsetWidth, H = tree.offsetHeight;
    if (!W || !H) return;
    measureTree();
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);

    var mobile = window.innerWidth <= 860;
    var cx = mobile ? 26 : W / 2;
    var amp = mobile ? 12 : 46;

    var d = "M " + spineX(0, cx, amp).toFixed(1) + " 0";
    for (var y = 14; y <= H; y += 14) d += " L " + spineX(y, cx, amp).toFixed(1) + " " + y;
    spineBase.setAttribute("d", d);
    spineGlow.setAttribute("d", d);
    spine.setAttribute("d", d);
    spineLen = spine.getTotalLength();
    spine.style.strokeDasharray = spineLen;
    spineGlow.style.strokeDasharray = spineLen;

    var seen = {};
    [].forEach.call(tree.querySelectorAll(".node"), function (node) {
      var dotEl = node.querySelector(".node-dot");
      var o = offsetIn(dotEl, tree);
      var nx = o.x + dotEl.offsetWidth / 2, ny = o.y + dotEl.offsetHeight / 2;
      var id = node.getAttribute("data-node");

      var ay = ny - (mobile ? 26 : 46);
      var sx = spineX(ay, cx, amp);
      var key = "n-" + id; seen[key] = 1;
      var mid = (sx + nx) / 2;
      setPath(key, "M " + sx.toFixed(1) + " " + ay.toFixed(1) +
                   " C " + mid.toFixed(1) + " " + ay.toFixed(1) + ", " +
                   mid.toFixed(1) + " " + ny.toFixed(1) + ", " +
                   nx.toFixed(1) + " " + ny.toFixed(1), 1);

      if (node.classList.contains("open")) {
        [].forEach.call(node.querySelectorAll(".leaf-dot"), function (ld, i) {
          if (!ld.offsetWidth) return;
          var lo = offsetIn(ld, tree);
          var lx = lo.x + ld.offsetWidth / 2, ly = lo.y + ld.offsetHeight / 2;
          var k2 = key + "-l" + i; seen[k2] = 1;
          var midY = ny + (ly - ny) * .58;
          setPath(k2, "M " + nx.toFixed(1) + " " + ny.toFixed(1) +
                      " C " + nx.toFixed(1) + " " + midY.toFixed(1) + ", " +
                      lx.toFixed(1) + " " + (ny + (ly - ny) * .42).toFixed(1) + ", " +
                      lx.toFixed(1) + " " + ly.toFixed(1), .8);
        });
      }
    });
    Object.keys(conMap).forEach(function (k) {
      if (!seen[k]) { conMap[k].halo.remove(); conMap[k].path.remove(); delete conMap[k]; }
    });
    updateSpine();
  }

  function setPath(key, d, op) {
    var pair = conMap[key];
    if (!pair) {
      var halo = el("path", { "class": "ln-halo", fill: "none", stroke: "rgba(110,224,170,.13)", "stroke-width": "7", "stroke-linecap": "round", opacity: op });
      var path = el("path", { "class": "ln-con", fill: "none", stroke: "rgba(155,255,207,.75)", "stroke-width": "1.5", "stroke-linecap": "round", opacity: op });
      gCon.appendChild(halo); gCon.appendChild(path);
      halo.setAttribute("d", d); path.setAttribute("d", d);
      pair = { halo: halo, path: path };
      conMap[key] = pair;
      if (!reduce) {
        var L = path.getTotalLength();
        [halo, path].forEach(function (el2) {
          el2.style.strokeDasharray = L;
          el2.style.strokeDashoffset = L;
          el2.style.transition = "stroke-dashoffset .8s cubic-bezier(.22,.8,.24,1)";
        });
        requestAnimationFrame(function () { halo.style.strokeDashoffset = "0"; path.style.strokeDashoffset = "0"; });
      }
      return;
    }
    pair.halo.setAttribute("d", d);
    pair.path.setAttribute("d", d);
  }

  function updateSpine() {
    if (!spine || !spineLen || !tree || !treeDocH) return;
    var vh = window.innerHeight;
    var top = treeDocTop - smoothY;
    var k = (vh * .85 - top) / (treeDocH + vh * .3);
    k = Math.min(1, Math.max(0, k));
    drawnLen = spineLen * k;
    var off = (spineLen - drawnLen).toFixed(1);
    spine.style.strokeDashoffset = off;
    if (spineGlow) spineGlow.style.strokeDashoffset = off;
  }

  function stepParticles(time) {
    if (!particles.length || !spineLen || !spine) return;
    for (var i = 0; i < particles.length; i++) {
      var pa = particles[i];
      pa.p += pa.sp * 16;
      if (pa.p > 1) pa.p -= 1;
      var at = pa.p * spineLen;
      if (at > drawnLen || drawnLen < 4) { pa.el.setAttribute("opacity", "0"); continue; }
      var pt = spine.getPointAtLength(at);
      pa.el.setAttribute("cx", pt.x); pa.el.setAttribute("cy", pt.y);
      pa.halo.setAttribute("cx", pt.x); pa.halo.setAttribute("cy", pt.y);
      var edge = Math.min(1, (drawnLen - at) / 140);
      var op = (.35 + .5 * Math.sin(time / 800 + i)) * edge;
      pa.el.setAttribute("opacity", op.toFixed(3));
      pa.halo.setAttribute("opacity", (op * .22).toFixed(3));
    }
  }

  function setNodeOpen(node, open) {
    var branch = node.querySelector("[data-branch]");
    var btn = node.querySelector(".node-btn");
    if (!branch) return;
    branch.style.height = branch.getBoundingClientRect().height + "px";

    if (open) {
      node.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      requestAnimationFrame(function () { branch.style.height = branch.scrollHeight + "px"; });
    } else {
      node.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      requestAnimationFrame(function () { branch.style.height = "0px"; });
    }

    var until = performance.now() + 800;
    (function follow(now) {
      measure(); drawTree();
      if (now < until) requestAnimationFrame(follow);
      else if (open) { branch.style.height = "auto"; drawTree(); }
    })(performance.now());
  }

  [].forEach.call(document.querySelectorAll(".node-btn"), function (btn) {
    btn.addEventListener("click", function () {
      var node = btn.closest(".node");
      setNodeOpen(node, !node.classList.contains("open"));
    });
  });

  /* =========================================================
     WORK — categories on the branch, videos below
     ========================================================= */
  function isVertical(v) {
    if (typeof v.vertical === "boolean") return v.vertical;
    return /\/shorts\//.test(String(v.url || ""));
  }

  function youtubeId(url) {
    if (!url) return null;
    var m = String(url).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    if (/^[A-Za-z0-9_-]{11}$/.test(String(url).trim())) return String(url).trim();
    return null;
  }

  var workLeaves = document.getElementById("workLeaves");
  var catView = document.getElementById("catView");
  var videoGrid = document.getElementById("videoGrid");
  var reelTitle = document.getElementById("reelTitle");
  var reelBlurb = document.getElementById("reelBlurb");
  var backBtn = document.getElementById("backBtn");
  var data = (typeof WORK !== "undefined" && WORK.length) ? WORK : [];
  var openId = null;

  function items(cat) {
    var seen = {}, out = [];
    (cat.videos || []).forEach(function (v) {
      var id = youtubeId(v.url);
      if (!id || seen[id]) return;               // never show the same link twice
      seen[id] = 1;
      out.push({ id: id, title: v.title || cat.name, vertical: isVertical(v), cover: v.cover });
    });
    return out;
  }
  function liveCount(cat) { return items(cat).length; }

  if (workLeaves) {
    data.forEach(function (cat) {
      var n = liveCount(cat);
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "leaf" + (n ? "" : " soon");
      b.setAttribute("data-cat", cat.id);
      b.innerHTML = '<span class="leaf-dot"></span><strong>' + cat.name + "</strong>" +
        "<span>" + cat.blurb + "</span>" +
        '<span class="count">' + (n ? n + (n === 1 ? " video" : " videos") : "Links coming soon") + "</span>";
      if (n) b.addEventListener("click", function () { toggleCat(cat.id, b); });
      li.appendChild(b);
      workLeaves.appendChild(li);
    });
    var hint = document.querySelector('[data-node="work"] .node-hint');
    if (hint) hint.textContent = data.filter(liveCount).length + " categories ready to watch";
  }

  var stripTall = document.getElementById("stripTall");
  var stripWide = document.getElementById("stripWide");
  var pool = [];
  data.forEach(function (cat) { items(cat).forEach(function (v) { pool.push(v); }); });
  var featured = pool.slice();

  // Loads a YouTube cover and keeps trying other files until a real one shows.
  // Many Shorts have no "hqdefault" cover — YouTube answers with a grey
  // placeholder — but always have a real frame at "hq2". A cover you set
  // yourself in videos.js (cover: "assets/my-cover.jpg") always wins.
  // If nothing works, the card shows a styled cover with the title instead.
  function setThumb(img, v, small) {
    var base = "https://i.ytimg.com/vi/" + v.id + "/";
    var list = v.vertical
      ? [base + "oardefault.jpg", base + "hq2.jpg", base + "hqdefault.jpg", base + "0.jpg"]
      : (small ? [base + "mqdefault.jpg", base + "hq2.jpg", base + "hqdefault.jpg", base + "0.jpg"]
               : [base + "hqdefault.jpg", base + "hq2.jpg", base + "mqdefault.jpg", base + "0.jpg"]);
    if (v.cover) list.unshift(v.cover);
    var i = 0;
    function next() {
      i++;
      if (i < list.length) { img.src = list[i]; return; }
      img.style.display = "none";
      var host = img.parentNode;
      if (host) { host.classList.add("no-thumb"); host.setAttribute("data-label", v.title || ""); }
    }
    img.addEventListener("error", next);
    img.addEventListener("load", function () {
      if (img.naturalWidth && img.naturalWidth <= 120) { next(); return; }
      if (v.cover && i === 0) return;
      isPlaceholder(img.src, function (grey) { if (grey) next(); });
    });
    img.src = list[0];
  }

  // YouTube's placeholder is flat grey. Look at a few pixels: if every one is
  // grey (no colour at all), skip to the next file. If the browser won't let
  // us look, keep the image as it is.
  var greyCache = {};
  function isPlaceholder(src, done) {
    if (src in greyCache) { done(greyCache[src]); return; }
    var probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.onload = function () {
      try {
        var c = document.createElement("canvas"); c.width = 24; c.height = 18;
        var g = c.getContext("2d"); g.drawImage(probe, 0, 0, 24, 18);
        var d = g.getImageData(0, 0, 24, 18).data, colour = 0;
        for (var k = 0; k < d.length; k += 4) {
          if (Math.max(d[k], d[k + 1], d[k + 2]) - Math.min(d[k], d[k + 1], d[k + 2]) > 14) colour++;
        }
        greyCache[src] = colour < 6;
      } catch (e) { greyCache[src] = false; }
      done(greyCache[src]);
    };
    probe.onerror = function () { greyCache[src] = false; done(false); };
    probe.src = src;
  }

  function stripCard(v, cls) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "strip-item " + cls;
    b.setAttribute("aria-label", "Play " + v.title);
    b.title = v.title;
    var img = document.createElement("img");
    img.decoding = "async"; img.alt = "";          // no lazy-load: the row moves, lazy covers never loaded
    b.appendChild(img);
    setThumb(img, v, true);
    b.addEventListener("click", function () { playlist = featured; openModal(v.id, v.title); });
    return b;
  }

  function buildStrip(track, list, cls, itemW) {
    if (!track) return;
    if (!list.length) { track.parentNode.hidden = true; return; }
    // repeat until the row is comfortably wider than the screen, then double it
    // so the loop from 0 to -50% is seamless
    var one = [];
    while (one.length * (itemW + 14) < Math.max(window.innerWidth * 1.3, 1200)) one = one.concat(list);
    one.concat(one).forEach(function (v) { track.appendChild(stripCard(v, cls)); });
    var speed = 34;                                     // px per second — slow and calm
    track.style.animationDuration = Math.round(one.length * (itemW + 14) / speed) + "s";
  }

  if (stripTall || stripWide) {
    var tallList = pool.filter(function (v) { return v.vertical; });
    var wideList = pool.filter(function (v) { return !v.vertical; });
    var note = document.getElementById("stripNote");
    if (!pool.length) {
      var stripBox = document.getElementById("strip");
      if (stripBox) stripBox.hidden = true;
      if (note) note.hidden = true;
    } else {
      if (note) note.textContent = pool.length + " recent edits — tap any one to watch";
      buildStrip(stripTall, tallList, "tall", 118);
      buildStrip(stripWide, wideList, "wide", 224);
    }
  }

  function toggleCat(id, btn) {
    if (openId === id) { closeCat(); return; }
    var cat = data.filter(function (c) { return c.id === id; })[0];
    if (!cat) return;
    openId = id;

    [].forEach.call(document.querySelectorAll("button.leaf"), function (b) { b.classList.remove("active"); });
    if (btn) btn.classList.add("active");

    reelTitle.textContent = cat.name;
    reelBlurb.textContent = cat.blurb;

    var list = items(cat);
    playlist = list;
    videoGrid.className = "vsets";
    videoGrid.innerHTML = "";

    var wide = list.filter(function (v) { return !v.vertical; });
    var tall = list.filter(function (v) { return v.vertical; });
    var both = wide.length && tall.length;

    if (wide.length) addSet(wide, false, both ? "Landscape · " + wide.length : "");
    if (tall.length) addSet(tall, true, both ? "Vertical · " + tall.length : "");

    function addSet(set, vertical, label) {
      var box = document.createElement("div");
      box.className = "vset";
      if (label) {
        var h = document.createElement("p");
        h.className = "vset-label";
        h.textContent = label;
        box.appendChild(h);
      }
      var grid = document.createElement("div");
      grid.className = "videos" + (vertical ? " videos-vertical" : "");
      var cap = vertical ? 8 : 6;
      set.forEach(function (v, i) {
        var card = document.createElement("button");
        card.type = "button";
        card.className = "vcard" + (i >= cap ? " is-more" : "");
        if (!reduce && i < cap) card.style.animation = "rise .6s cubic-bezier(.22,.8,.24,1) both " + (.05 * i) + "s";
        card.innerHTML = '<span class="thumb"><img decoding="async" alt=""><span class="play" aria-hidden="true"></span></span>' +
          '<span class="vtitle">' + v.title + "</span>";
        setThumb(card.querySelector("img"), v, false);
        card.addEventListener("click", function () { openModal(v.id, v.title); });
        grid.appendChild(card);
      });
      box.appendChild(grid);
      if (set.length > cap) {
        var more = document.createElement("button");
        more.type = "button";
        more.className = "more-btn glass";
        more.textContent = "Show all " + set.length + " videos";
        more.addEventListener("click", function () {
          [].forEach.call(grid.querySelectorAll(".is-more"), function (c) { c.classList.remove("is-more"); });
          more.remove();
          measure(); drawTree();
        });
        box.appendChild(more);
      }
      videoGrid.appendChild(box);
    }

    catView.hidden = false;
    if (!reduce) { catView.classList.remove("enter"); void catView.offsetWidth; catView.classList.add("enter"); }
    setTimeout(function () {
      measure(); drawTree();
      catView.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 60);
  }

  function closeCat() {
    openId = null;
    catView.hidden = true;
    videoGrid.innerHTML = "";
    [].forEach.call(document.querySelectorAll("button.leaf"), function (b) { b.classList.remove("active"); });
    measure(); drawTree();
  }
  if (backBtn) backBtn.addEventListener("click", closeCat);

  function gotoNode(id) {
    var node = document.querySelector('.node[data-node="' + id + '"]');
    if (!node) return;
    // close the others so branches never overlap on the way there
    [].forEach.call(document.querySelectorAll(".node.open"), function (n) {
      if (n !== node) setNodeOpen(n, false);
    });
    if (!node.classList.contains("open")) setNodeOpen(node, true);
    requestAnimationFrame(function () {
      node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  }

  [].forEach.call(document.querySelectorAll("[data-open]"), function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      closeSheet();
      gotoNode(a.getAttribute("data-open"));
    });
  });

  /* =========================================================
     Lightbox + contact card
     ========================================================= */
  var modal = document.getElementById("modal");
  var frameBox = document.getElementById("frame");
  var modalTitle = document.getElementById("modalTitle");
  var modalYt = document.getElementById("modalYt");
  var ctaModal = document.getElementById("ctaModal");
  var lastFocus = null;

  var playlist = [], playIndex = -1;
  var prevBtn = document.getElementById("prevVid");
  var nextBtn = document.getElementById("nextVid");
  var isFile = location.protocol === "file:";

  function renderVideo(id, title) {
    if (isFile) {
      // YouTube blocks embedded playback on pages opened straight from disk (error 153)
      frameBox.innerHTML =
        '<div class="frame-note"><p><strong>Preview mode</strong>' +
        "YouTube won't play inside a page opened from your computer's file system. " +
        'Upload the site (or run a local server) and it plays right here.</p>' +
        '<a class="btn btn-solid" href="https://www.youtube.com/watch?v=' + id +
        '" target="_blank" rel="noopener">Watch on YouTube</a></div>';
      return;
    }
    var src = "https://www.youtube-nocookie.com/embed/" + id +
      "?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&origin=" +
      encodeURIComponent(location.origin);
    frameBox.innerHTML = '<iframe src="' + src + '" title="' + (title || "Video") +
      '" referrerpolicy="strict-origin-when-cross-origin"' +
      ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
  }

  function showVideo(i) {
    if (!playlist.length) return;
    playIndex = (i + playlist.length) % playlist.length;
    var v = playlist[playIndex];
    renderVideo(v.id, v.title);
    modalTitle.textContent = v.title || "";
    if (modalYt) modalYt.href = "https://www.youtube.com/watch?v=" + v.id;
    var many = playlist.length > 1;
    if (prevBtn) prevBtn.hidden = !many;
    if (nextBtn) nextBtn.hidden = !many;
  }

  function openModal(id, title) {
    lastFocus = document.activeElement;
    var idx = 0;
    for (var i = 0; i < playlist.length; i++) if (playlist[i].id === id) idx = i;
    modal.hidden = false;
    document.body.classList.add("locked");
    showVideo(idx);
    modal.querySelector(".modal-close").focus();
  }
  function closeModal() {
    modal.hidden = true; frameBox.innerHTML = "";
    document.body.classList.remove("locked");
    if (lastFocus) lastFocus.focus();
  }
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) closeModal(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { showVideo(playIndex - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { showVideo(playIndex + 1); });
    document.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "ArrowLeft") showVideo(playIndex - 1);
      if (e.key === "ArrowRight") showVideo(playIndex + 1);
    });
  }

  function openCta() {
    lastFocus = document.activeElement;
    ctaModal.hidden = false;
    document.body.classList.add("locked");
    ctaModal.querySelector(".modal-close").focus();
  }
  function closeCta() {
    ctaModal.hidden = true;
    document.body.classList.remove("locked");
    if (lastFocus) lastFocus.focus();
  }
  [].forEach.call(document.querySelectorAll("[data-cta]"), function (b) { b.addEventListener("click", openCta); });
  if (ctaModal) ctaModal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-cta-close")) closeCta(); });

  [].forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "Copied";
        btn.classList.add("done");
        setTimeout(function () { btn.textContent = old; btn.classList.remove("done"); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else fallbackCopy(text, done);
    });
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.top = "-1000px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (err) {}
    document.body.removeChild(ta);
  }

  /* mobile menu */
  var sheet = document.getElementById("sheet");
  var menuBtn = document.getElementById("menuBtn");
  function openSheet() { if (!sheet) return; sheet.hidden = false; document.body.classList.add("locked"); menuBtn.setAttribute("aria-expanded", "true"); }
  function closeSheet() { if (!sheet || sheet.hidden) return; sheet.hidden = true; document.body.classList.remove("locked"); menuBtn.setAttribute("aria-expanded", "false"); }
  if (menuBtn) menuBtn.addEventListener("click", openSheet);
  if (sheet) sheet.addEventListener("click", function (e) { if (e.target.hasAttribute("data-sheet-close")) closeSheet(); });
  [].forEach.call(document.querySelectorAll('.sheet-panel a[href="#about"]'), function (a) {
    a.addEventListener("click", closeSheet);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (modal && !modal.hidden) closeModal();
    else if (ctaModal && !ctaModal.hidden) closeCta();
    else if (sheet && !sheet.hidden) closeSheet();
    else if (openId) closeCat();
  });

  /* =========================================================
     INTRO VIDEO — plays right inside the page
     ========================================================= */
  (function () {
    var box = document.getElementById("intro");
    if (!box || typeof INTRO === "undefined" || !INTRO) return;
    var id = youtubeId(INTRO.url);
    if (!id) return;
    var title = INTRO.title || "Intro";
    document.getElementById("introTitle").textContent = title;
    if (INTRO.label) document.getElementById("introLabel").textContent = INTRO.label;
    var thumb = document.getElementById("introThumb");
    thumb.src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
    thumb.addEventListener("error", function () {
      if (thumb.src.indexOf("maxres") > -1) thumb.src = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
    });
    box.hidden = false;
    document.getElementById("introPlayer").addEventListener("click", function () {
      if (location.protocol === "file:") { window.open("https://www.youtube.com/watch?v=" + id, "_blank"); return; }
      var src = "https://www.youtube-nocookie.com/embed/" + id +
        "?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&origin=" + encodeURIComponent(location.origin);
      var f = document.createElement("iframe");
      f.src = src; f.title = title;
      f.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      f.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      f.setAttribute("allowfullscreen", "");
      this.replaceWith(f);
    });
  })();

  /* =========================================================
     boot
     ========================================================= */
  if (tree) {
    buildSvg();
    drawTree();
    if ("ResizeObserver" in window) new ResizeObserver(function () { measure(); drawTree(); }).observe(tree);
    window.addEventListener("resize", function () { measure(); drawTree(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); drawTree(); });
  }
  window.addEventListener("load", function () { measure(); drawTree(); });
  updateMotion();
  if (reduce) window.addEventListener("scroll", function () { targetY = window.pageYOffset; updateMotion(); }, { passive: true });
  else requestAnimationFrame(loop);
})();
