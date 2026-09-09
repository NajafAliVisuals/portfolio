/* Najaf Ali — portfolio interactions.
   You don't need to edit this file. All video links live in videos.js */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
     SKY — 3D spiral galaxy, nebula, layered stars
     ========================================================= */
  var sky = document.getElementById("sky");
  var ctx = null, w = 0, h = 0, dpr = 1;
  var stars = [], bright = [], gal = [], neb = [], shots = [], nextShot = 5000, R = 400;
  var sprite = {};

  function makeSprite(rgb) {
    var s = document.createElement("canvas"); s.width = s.height = 64;
    var c = s.getContext("2d");
    var g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(" + rgb + ",1)");
    g.addColorStop(.22, "rgba(" + rgb + ",.55)");
    g.addColorStop(.55, "rgba(" + rgb + ",.12)");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    return s;
  }

  var rand = function (a, b) { return a + Math.random() * (b - a); };

  function seedSky() {
    w = window.innerWidth; h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.5 : 2);
    sky.width = w * dpr; sky.height = h * dpr;
    sky.style.width = w + "px"; sky.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    galScale = lite ? .6 : .8;
    galCan = document.createElement("canvas");
    galCan.width = Math.round(w * galScale); galCan.height = Math.round(h * galScale);
    galCtx = galCan.getContext("2d");
    galCtx.setTransform(galScale, 0, 0, galScale, 0, 0);
    galSp = -1;

    sprite.cool = makeSprite("214,230,255");
    sprite.warm = makeSprite("255,231,192");
    sprite.mint = makeSprite("150,240,200");
    sprite.white = makeSprite("255,255,255");

    // ---- stars, three depths
    var L = [
      { n: .54, size: [1.1, 2.2], alpha: [.16, .40], par: .05, drift: .005 },
      { n: .32, size: [1.8, 3.4], alpha: [.24, .58], par: .13, drift: .012 },
      { n: .14, size: [3.0, 5.4], alpha: [.38, .85], par: .28, drift: .022 }
    ];
    var total = Math.max(90, Math.min(280, Math.round((w * h) / (lite ? 11000 : 7600))));
    stars = [];
    L.forEach(function (l) {
      for (var i = 0, c = Math.round(total * l.n); i < c; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * (h * 1.7),
          s: rand(l.size[0], l.size[1]), a: rand(l.alpha[0], l.alpha[1]),
          par: l.par, drift: l.drift, ph: Math.random() * 6.28, sp: rand(.3, 1),
          tex: Math.random() < .22 ? sprite.warm : sprite.cool
        });
      }
    });
    bright = [];
    for (var j = 0; j < 7; j++) {
      bright.push({ x: Math.random() * w, y: rand(h * .05, h * 1.5), s: rand(9, 16), par: rand(.16, .32), ph: Math.random() * 6.28, tex: Math.random() < .5 ? sprite.warm : sprite.white });
    }

    // ---- galaxy
    R = Math.min(w, h) * .78;
    var count = Math.max(420, Math.min(1100, Math.round((w * h) / 1900)));
    if (lite) count = Math.round(count * .45);
    gal = [];
    var arms = 3;
    for (var k = 0; k < count; k++) {
      var t = Math.pow(Math.random(), .58);
      var arm = Math.floor(Math.random() * arms);
      var spread = (1 - t) * 1.15 + .1;
      gal.push({
        t: t,
        a: arm * (6.283 / arms) + t * 3.4 + (Math.random() - .5) * spread,
        r: t * R * (1 + (Math.random() - .5) * .05),
        z: (Math.random() - .5) * R * .045 * (1.2 - t),
        s: rand(1.4, 4.2) * (t < .18 ? 1.6 : 1),
        o: rand(.20, .70) * (t < .2 ? 1.25 : 1 - t * .3),
        ph: Math.random() * 6.28
      });
    }
    // ---- nebula clouds inside the disc
    neb = [];
    for (var n = 0; n < 9; n++) {
      var nt = rand(.18, .92);
      neb.push({
        t: nt, a: Math.random() * 6.28, r: nt * R,
        rad: rand(R * .10, R * .26),
        col: n % 3 === 0 ? "120,220,175" : (n % 3 === 1 ? "232,221,201" : "150,185,235"),
        o: rand(.05, .12)
      });
    }
  }

  function galaxyColor(t) {
    if (t < .17) return sprite.warm;
    if (t < .5) return sprite.white;
    if (t < .75) return sprite.cool;
    return sprite.mint;
  }

  var galCan = null, galCtx = null, galScale = 1, galFrame = 0, galSp = -1;

  function paintGalaxy(time) {
    var rot = time * .000022 + sp * .95;
    var tilt = 1.02, st = Math.sin(tilt), ct = Math.cos(tilt);
    var zoom = 1 + sp * 1.15;
    var f = 1100;
    var cx = w * (.70 - sp * .32), cy = h * (.30 + sp * .30);

    var ctx = galCtx;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // core bloom
    var coreR = R * .32 * zoom;
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
    g.addColorStop(0, "rgba(255,240,208,.30)");
    g.addColorStop(.28, "rgba(206,222,244,.12)");
    g.addColorStop(1, "rgba(120,190,160,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, cy, coreR, coreR * .40, -.30, 0, 6.283); ctx.fill();

    // nebula
    for (var i = 0; i < neb.length; i++) {
      var nb = neb[i];
      var na = nb.a + rot * (1.2 - nb.t * .5);
      var nx = Math.cos(na) * nb.r, ny0 = Math.sin(na) * nb.r;
      var ny = ny0 * ct;
      var nz = ny0 * st;
      var nsc = (f / (f + nz)) * zoom;
      var px = cx + nx * nsc * .92, py = cy + ny * nsc;
      var rad = nb.rad * nsc;
      var ng = ctx.createRadialGradient(px, py, 0, px, py, rad);
      ng.addColorStop(0, "rgba(" + nb.col + "," + nb.o + ")");
      ng.addColorStop(1, "rgba(" + nb.col + ",0)");
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.arc(px, py, rad, 0, 6.283); ctx.fill();
    }

    // stars of the disc
    for (var k = 0; k < gal.length; k++) {
      var q = gal[k];
      var a = q.a + rot * (1.3 - q.t * .6);
      var x0 = Math.cos(a) * q.r, y0 = Math.sin(a) * q.r;
      var y1 = y0 * ct - q.z * st, z1 = y0 * st + q.z * ct;
      var sc = (f / (f + z1)) * zoom;
      var x = cx + x0 * sc * .92, y = cy + y1 * sc;
      if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue;
      var tw = reduce ? 1 : .78 + .22 * Math.sin(time / 2100 + q.ph);
      var size = Math.max(1.2, q.s * sc);
      ctx.globalAlpha = Math.min(1, q.o * tw * Math.min(1.5, sc));
      ctx.drawImage(galaxyColor(q.t), x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawGalaxy(time) {
    if (!galCan) return;
    // repaint the galaxy only when it has actually moved — it is the expensive part
    galFrame++;
    if (galFrame % 3 === 0 || Math.abs(sp - galSp) > .004) { paintGalaxy(time); galSp = sp; }
    ctx.drawImage(galCan, 0, 0, w, h);
  }

  function wrapY(y, off) { var span = h * 1.7, v = (y - off) % span; return v < 0 ? v + span : v; }

  function drawSky(time) {
    ctx.clearRect(0, 0, w, h);
    drawGalaxy(time);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var i, s, y;
    for (i = 0; i < stars.length; i++) {
      s = stars[i];
      if (!reduce) s.y -= s.drift;
      y = wrapY(s.y, smoothY * s.par);
      if (y > h + 6) continue;
      var tw = reduce ? 1 : .6 + .4 * Math.sin(time / 1800 * s.sp + s.ph);
      ctx.globalAlpha = s.a * tw;
      ctx.drawImage(s.tex, s.x - s.s / 2, y - s.s / 2, s.s, s.s);
    }
    for (i = 0; i < bright.length; i++) {
      s = bright[i];
      y = wrapY(s.y, smoothY * s.par);
      if (y > h + 30) continue;
      var bt = reduce ? .8 : .62 + .38 * Math.sin(time / 2600 + s.ph);
      ctx.globalAlpha = .85 * bt;
      ctx.drawImage(s.tex, s.x - s.s / 2, y - s.s / 2, s.s, s.s);
      // diffraction spikes
      ctx.globalAlpha = .30 * bt;
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = .8;
      ctx.beginPath();
      ctx.moveTo(s.x - s.s, y); ctx.lineTo(s.x + s.s, y);
      ctx.moveTo(s.x, y - s.s); ctx.lineTo(s.x, y + s.s);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (!reduce) {
      nextShot -= 16;
      if (nextShot <= 0) {
        nextShot = rand(11000, 22000);
        shots.push({ x: rand(w * .15, w), y: rand(-20, h * .5), vx: -rand(4.5, 8), vy: rand(2.2, 4), life: 1 });
      }
      for (i = shots.length - 1; i >= 0; i--) {
        var sh = shots[i];
        sh.x += sh.vx; sh.y += sh.vy; sh.life -= .012;
        if (sh.life <= 0 || sh.y > h + 40) { shots.splice(i, 1); continue; }
        var tx = sh.x - sh.vx * 14, ty = sh.y - sh.vy * 14;
        var lg = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
        lg.addColorStop(0, "rgba(255,255,255," + .8 * sh.life + ")");
        lg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = lg; ctx.lineWidth = 1.7; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(tx, ty); ctx.stroke();
      }
    }
    ctx.restore();
  }

  if (sky && sky.getContext) {
    ctx = sky.getContext("2d");
    seedSky();
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { seedSky(); measure(); drawTree(); }, 200);
    });
  }

  /* =========================================================
     MOTION — one smooth loop drives everything
     ========================================================= */
  var nav = document.getElementById("nav");
  var bar = document.getElementById("progress");
  var whale = document.getElementById("whaleLayer");
  var heroZoom = document.getElementById("heroZoom");
  var tree = document.getElementById("tree");

  window.addEventListener("scroll", function () { targetY = window.pageYOffset; }, { passive: true });

  function whalePos(t) {
    return { x: 118 - t * 196, y: 24 + Math.sin(t * Math.PI * 1.55) * 27 };
  }
  var vel = 0, prevY = targetY, facing = 1, wantFacing = 1;   // 1 = looking left, -1 = looking right

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

    // scroll direction, smoothed — the whale banks round a curve to turn
    vel += ((targetY - prevY) - vel) * k(.2);
    prevY = targetY;
    if (vel > 1.6) wantFacing = 1; else if (vel < -1.6) wantFacing = -1;
    facing += (wantFacing - facing) * k(.018);          // slow, so the turn reads as a wide arc

    if (whale && !reduce) {
      var t = Math.min(1, Math.max(0, (sp - .04) / .88));
      if (t <= 0 || t >= 1) { whale.style.opacity = 0; }
      else {
        var a = whalePos(t), b = whalePos(Math.min(1, t + .008));
        var dx = (b.x - a.x) * window.innerWidth / 100;
        var dy = (b.y - a.y) * window.innerHeight / 100;
        var theta = Math.atan2(dy, dx) * 57.2958;   // travel angle along the path
        var f = facing;
        var turn = 1 - Math.abs(f);                 // 0 = settled, 1 = edge-on, mid turn
        var e = turn * turn * (3 - 2 * turn);       // smoothstep, so the arc eases in and out
        var bank = wantFacing >= 0 ? -1 : 1;        // constant for the whole turn
        var rot = theta - 180 + e * 42 * bank;      // leans hard into the curve
        var depth = Math.sin(t * Math.PI);
        var sc = (.58 + depth * .78) * (1 - e * .2);
        var ax = a.x - e * 13 * bank;               // carries on, swings wide, comes back
        var ay = a.y - e * 12 + e * e * 4;          // rises through the arc, dips out of it
        whale.style.transform = "translate3d(" + ax.toFixed(2) + "vw," + ay.toFixed(2) + "vh,0) rotate(" + rot.toFixed(2) +
          "deg) scale(" + (sc * (f >= 0 ? 1 : -1)).toFixed(3) + "," + sc.toFixed(3) + ")";
        if (!lite) whale.style.filter = "blur(" + ((1 - depth) * 3.2).toFixed(2) + "px)";
        whale.style.opacity = (.24 + depth * .38).toFixed(3);
      }
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
    if (ctx) drawSky(time);
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
            var dx = (mx - (r.left + r.width / 2)) / r.width;
            var dy = (my - (r.top + r.height / 2)) / r.height;
            eclipse.style.transform = "translate3d(" + dx * -14 + "px," + dy * -12 + "px,0) rotateY(" + dx * 6 + "deg) rotateX(" + dy * -6 + "deg)";
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
    grad.appendChild(el("stop", { offset: "0%", "stop-color": "#c9ffe6" }));
    grad.appendChild(el("stop", { offset: "45%", "stop-color": "#6ee0aa" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "#2b9a6b" }));
    defs.appendChild(grad);

    svg.appendChild(defs);

    spineBase = el("path", { fill: "none", stroke: "rgba(86,214,155,.14)", "stroke-width": "1.4" });
    spineGlow = el("path", { fill: "none", stroke: "rgba(110,224,170,.16)", "stroke-width": "11", "stroke-linecap": "round" });
    spine = el("path", { fill: "none", stroke: "url(#lineGrad)", "stroke-width": "2.6", "stroke-linecap": "round" });
    gCon = el("g", {});
    gPart = el("g", {});
    svg.appendChild(spineBase); svg.appendChild(spineGlow); svg.appendChild(spine);
    svg.appendChild(gCon); svg.appendChild(gPart);

    particles = [];
    if (!reduce) {
      for (var i = 0; i < 14; i++) {
        var halo = el("circle", { r: (i % 4 === 0 ? 8 : 5.5), fill: "#6ee0aa", opacity: "0" });
        var c = el("circle", { r: (i % 4 === 0 ? 2.6 : 1.6), fill: i % 3 === 0 ? "#c9ffe6" : "#9bffcf", opacity: "0" });
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
      var halo = el("path", { fill: "none", stroke: "rgba(110,224,170,.13)", "stroke-width": "7", "stroke-linecap": "round", opacity: op });
      var path = el("path", { fill: "none", stroke: "rgba(155,255,207,.75)", "stroke-width": "1.5", "stroke-linecap": "round", opacity: op });
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
      out.push({ id: id, title: v.title || cat.name, vertical: isVertical(v) });
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

  function thumbFor(v, small) {
    // Shorts have a vertical thumbnail under oardefault; fall back if it is missing.
    // The showcase rows use the smaller file — 30 of them load at once.
    if (v.vertical) return "https://i.ytimg.com/vi/" + v.id + "/oardefault.jpg";
    return "https://i.ytimg.com/vi/" + v.id + (small ? "/mqdefault.jpg" : "/hqdefault.jpg");
  }

  function stripCard(v, cls) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "strip-item " + cls;
    b.setAttribute("aria-label", "Play " + v.title);
    b.title = v.title;
    var img = document.createElement("img");
    img.loading = "lazy"; img.decoding = "async"; img.alt = "";
    img.src = thumbFor(v, true);
    img.addEventListener("error", function () {
      if (img.src.indexOf("oardefault") > -1) img.src = "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg";
    });
    b.appendChild(img);
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
        card.innerHTML = '<span class="thumb"><img loading="lazy" decoding="async" alt="" src="' + thumbFor(v) +
          '"><span class="play" aria-hidden="true"></span></span>' +
          '<span class="vtitle">' + v.title + "</span>";
        var im = card.querySelector("img");
        im.addEventListener("error", function () {
          if (im.src.indexOf("oardefault") > -1) im.src = "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg";
        });
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
  if (ctx) drawSky(0);
  if (reduce) window.addEventListener("scroll", function () { targetY = window.pageYOffset; updateMotion(); }, { passive: true });
  else requestAnimationFrame(loop);
})();
