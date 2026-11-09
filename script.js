(() => {
  "use strict";

  /* ================= CONFIG: edit these ================= */
  const PASSCODE = "vrinda"; // case-insensitive

  const LETTER = `I know I hurt you, and I'm truly sorry.

You didn't deserve that, not for a single second. I've been thinking about it every moment since, and I hate that I was the reason for the sadness on the face I love most.

I'm not going to make excuses. I was wrong. I know I'm not perfect, and sometimes I fall short of being who you deserve. But I want you to know I'm working on myself, seriously, every single day. Not just to say sorry, but to actually become better, for you.

All I want is to see you happy. I want to give you everything you deserve: every smile, every bit of care, every little thing that makes your heart light up. Some days I don't get it right, but I will never, ever stop trying.

You are my whole world, Mansi. I love you so much, and I always will, no matter what. That will never change. It's you or nobody. Always.

So I made you this little place, filled with all the things I should say more often. Scroll down, take your time… and maybe, just maybe, give me another chance? 🥺`;

  // Put your photos inside the /photos folder and list them here.
  const PHOTOS = [
    { src: "photos/9.jpg",  caption: "boat rides with you ⛵" },
    { src: "photos/5.jpg",  caption: "celebrating us 🎂" },
    { src: "photos/14.jpg", caption: "the way you look at me 🥹" },
    { src: "photos/2.jpg",  caption: "you, in every colour 💜" },
    { src: "photos/12.jpg", caption: "hold me like this forever" },
    { src: "photos/4.jpg",  caption: "the way I look at you" },
    { src: "photos/15.jpg", caption: "flowers among flowers 🌸" },
    { src: "photos/19.jpg", caption: "every journey with you ✈️" },
    { src: "photos/8.jpg",  caption: "cutest one in the store 🐧" },
    { src: "photos/17.jpg", caption: "always making me smile" },
    { src: "photos/7.jpg",  caption: "my favourite view" },
    { src: "photos/11.jpg", caption: "smiles on every trip" },
    { src: "photos/3.jpg",  caption: "your smile = my sunshine ☀️" },
    { src: "photos/21.jpg", caption: "lazy days with you" },
    { src: "photos/6.jpg",  caption: "sweetest girl 🍓" },
    { src: "photos/10.jpg", caption: "little daisies, like you 🌼" },
  ];

  const SILLY_PHOTOS = [
    { src: "photos/13.jpg", caption: "that laugh, even on video call 😂" },
    { src: "photos/1.jpg",  caption: "my silly, my everything" },
    { src: "photos/22.jpg", caption: "skincare queen 👑" },
    { src: "photos/16.jpg", caption: "caught snacking 😋" },
    { src: "photos/20.jpg", caption: "your weird husband 🤪" },
    { src: "photos/18.jpg", caption: "birthdays, even miles apart 🎂" },
  ];

  const REASON_INTERVAL_MS = 5000;
  const GAME_TARGET = 20;
  /* ====================================================== */

  const $ = (id) => document.getElementById(id);
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } },
  };

  /* ---------- floating hearts background ---------- */
  const HEART_CHARS = ["💗", "💕", "💖", "🌸", "🌼", "❤"];
  function spawnHeart() {
    const h = document.createElement("span");
    h.className = "float-heart";
    h.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
    h.style.left = Math.random() * 100 + "vw";
    h.style.fontSize = 14 + Math.random() * 22 + "px";
    h.style.animationDuration = 8 + Math.random() * 8 + "s";
    $("hearts-bg").appendChild(h);
    setTimeout(() => h.remove(), 16000);
  }
  setInterval(spawnHeart, 900);
  for (let i = 0; i < 6; i++) setTimeout(spawnHeart, i * 250);

  /* ---------- background music ---------- */
  const music = (() => {
    const audio = $("bg-music"), btn = $("music-btn");
    const TARGET_VOL = 0.6;
    let userPaused = false, pausedForVideo = false;

    function setUI() {
      const on = !audio.paused;
      btn.classList.toggle("playing", on);
      btn.classList.toggle("nudge", !on && !userPaused);
      btn.setAttribute("aria-label", on ? "Pause music" : "Play music");
    }
    function fadeIn() {
      audio.volume = 0;
      const step = setInterval(() => {
        audio.volume = Math.min(TARGET_VOL, audio.volume + 0.03);
        if (audio.volume >= TARGET_VOL) clearInterval(step);
      }, 100);
    }
    function play() {
      const p = audio.play();
      if (p && p.then) p.then(() => { fadeIn(); setUI(); }).catch(setUI);
      else setUI();
    }
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (audio.paused) { userPaused = false; play(); }
      else { userPaused = true; audio.pause(); setUI(); }
    });
    audio.addEventListener("pause", setUI);
    audio.addEventListener("play", setUI);

    // pause the song while one of our videos plays, resume after
    document.querySelectorAll("video").forEach((v) => {
      v.addEventListener("play", () => {
        if (!audio.paused) { pausedForVideo = true; audio.pause(); }
      });
      const resume = () => { if (pausedForVideo && !userPaused) { pausedForVideo = false; play(); } };
      v.addEventListener("pause", resume);
      v.addEventListener("ended", resume);
    });

    return {
      // must be called inside a tap/click so phones allow sound
      start() { btn.classList.remove("hidden"); play(); },
      // after a reload there was no tap, so wait for her first one
      startOnFirstTap() {
        btn.classList.remove("hidden");
        play();
        const once = (e) => {
          if (e.target.closest("#music-btn, video")) return;
          if (audio.paused && !userPaused) play();
          document.removeEventListener("pointerdown", once);
        };
        document.addEventListener("pointerdown", once);
      },
    };
  })();

  /* ---------- lock screen ---------- */
  function unlock(animate) {
    const lock = $("lock");
    store.set("unlocked", "1");
    if (animate) {
      music.start();
      lock.classList.add("lock-out");
      setTimeout(() => { lock.remove(); playIntro(showSite); }, 800);
    } else {
      lock.remove();
      showSite();
      music.startOnFirstTap();
    }
  }

  $("lock-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("passcode");
    if (input.value.trim().toLowerCase() === PASSCODE) {
      unlock(true);
    } else {
      const card = document.querySelector(".lock-card");
      card.classList.remove("shake");
      void card.offsetWidth;
      card.classList.add("shake");
      $("lock-error").textContent = "Hmm, that's not it… try again, my love 💭";
      input.value = "";
      input.focus();
    }
  });

  if (store.get("unlocked") === "1") unlock(false);

  function showSite() {
    $("site").classList.remove("hidden");
    initReveal();
    initReasons();
    buildGallery("polaroids", PHOTOS);
    buildGallery("polaroids-silly", SILLY_PHOTOS);
    initGame();
  }

  /* ---------- intro: dark screen → "Hi Mansi…" → daisy burst ---------- */
  function playIntro(done) {
    const intro = $("intro");
    intro.classList.remove("hidden");
    const timers = [];
    let finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      intro.classList.add("intro-out");
      done();
      setTimeout(() => intro.remove(), 1200);
    }

    timers.push(setTimeout(() => intro.classList.add("show-title"), 600));
    timers.push(setTimeout(() => intro.classList.add("show-sub"), 2000));
    timers.push(setTimeout(daisyBurst, 3300));
    timers.push(setTimeout(finish, 5200));
    intro.addEventListener("click", finish);
  }

  function daisyBurst() {
    const box = $("daisy-burst");
    const flowers = ["🌼", "🌼", "🌼", "🌸", "💗"];
    for (let i = 0; i < 46; i++) {
      const d = document.createElement("span");
      d.textContent = flowers[i % flowers.length];
      const angle = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * Math.max(innerWidth, innerHeight) * 0.55;
      d.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      d.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      d.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      d.style.fontSize = 18 + Math.random() * 26 + "px";
      d.style.animationDelay = Math.random() * 0.15 + "s";
      box.appendChild(d);
    }
  }

  /* ---------- sparkle trail ---------- */
  (function sparkleTrail() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glyphs = ["✦", "✧", "♡", "•"];
    const colors = ["#e0709a", "#f4a6c0", "#f7c873", "#c84b7a"];
    let lastT = 0;
    document.addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - lastT < 35) return;
      lastT = now;
      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      s.style.left = e.clientX + (Math.random() * 12 - 6) + "px";
      s.style.top = e.clientY + (Math.random() * 12 - 6) + "px";
      s.style.color = colors[Math.floor(Math.random() * colors.length)];
      s.style.fontSize = 10 + Math.random() * 10 + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }, { passive: true });
  })();

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll(".section > *");
    els.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- envelope + typewriter ---------- */
  let letterOpened = false;
  function openLetter() {
    if (letterOpened) return;
    letterOpened = true;
    $("envelope").classList.add("open");
    setTimeout(() => {
      document.querySelector(".envelope-wrap").classList.add("hidden");
      $("letter-paper").classList.remove("hidden");
      typeWriter($("letter-text"), LETTER, () => $("signature").classList.remove("hidden"));
    }, 700);
  }
  $("envelope").addEventListener("click", openLetter);
  $("envelope").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLetter(); }
  });

  function typeWriter(el, text, done) {
    let i = 0;
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.innerHTML = "&nbsp;";
    const textNode = document.createTextNode("");
    el.append(textNode, caret);
    (function tick() {
      if (i >= text.length) { caret.remove(); done && done(); return; }
      textNode.data += text[i];
      const ch = text[i++];
      const delay = ch === "\n" ? 280 : /[.,!?…]/.test(ch) ? 160 : 28;
      setTimeout(tick, delay);
    })();
  }

  /* ---------- 100 reasons ---------- */
  function initReasons() {
    let idx = 0, paused = false, timer = null;
    const total = REASONS.length;
    const textEl = $("reason-text"), numEl = $("reason-num"), bar = $("reason-progress");

    function render() {
      textEl.classList.add("fade");
      setTimeout(() => {
        numEl.textContent = "#" + (idx + 1);
        textEl.textContent = REASONS[idx];
        bar.style.width = ((idx + 1) / total) * 100 + "%";
        textEl.classList.remove("fade");
      }, 350);
    }
    function go(step) { idx = (idx + step + total) % total; render(); restart(); }
    function restart() {
      clearInterval(timer);
      if (!paused) timer = setInterval(() => { idx = (idx + 1) % total; render(); }, REASON_INTERVAL_MS);
    }

    $("reason-next").onclick = () => go(1);
    $("reason-prev").onclick = () => go(-1);
    $("reason-pause").onclick = (e) => {
      paused = !paused;
      e.currentTarget.textContent = paused ? "▶" : "❚❚";
      e.currentTarget.setAttribute("aria-label", paused ? "Play" : "Pause");
      restart();
    };

    // swipe on mobile
    let sx = null;
    const card = $("reason-card");
    card.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    card.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      sx = null;
    });

    render();
    restart();
  }

  /* ---------- gallery ---------- */
  function buildGallery(wrapId, list) {
    const wrap = $(wrapId);
    list.forEach((p) => {
      const fig = document.createElement("figure");
      fig.className = "polaroid";
      const img = new Image();
      img.alt = p.caption;
      img.loading = "lazy";
      img.src = p.src;
      img.onerror = () => {
        const ph = document.createElement("div");
        ph.className = "ph";
        ph.textContent = "💗";
        img.replaceWith(ph);
        fig.style.cursor = "default";
      };
      const cap = document.createElement("figcaption");
      cap.textContent = p.caption;
      fig.append(img, cap);
      fig.addEventListener("click", () => {
        if (!fig.querySelector("img")) return;
        const lb = document.createElement("div");
        lb.className = "lightbox";
        const big = new Image();
        big.src = p.src;
        big.alt = p.caption;
        lb.appendChild(big);
        lb.onclick = () => lb.remove();
        document.body.appendChild(lb);
      });
      wrap.appendChild(fig);
    });
  }

  /* ---------- game: catch the hearts ---------- */
  function initGame() {
    const cv = $("game-canvas"), ctx = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    const overlay = $("game-overlay"), msg = $("game-msg");
    let basket, items, score, lives, running, last, spawnT, keys = {}, won = false;

    function reset() {
      basket = { x: W / 2, w: 70 };
      items = []; score = 0; lives = 3; spawnT = 0;
      hud();
    }
    function hud() {
      $("game-score").textContent = `💗 ${score} / ${GAME_TARGET}`;
      $("game-lives").textContent = "❤".repeat(lives) + "♡".repeat(3 - lives);
    }

    function spawn() {
      const bad = Math.random() < 0.22;
      items.push({
        x: 20 + Math.random() * (W - 40), y: -20,
        v: 120 + Math.random() * 80 + score * 6,
        bad, ch: bad ? "💔" : ["💗", "💖", "💕", "🌸"][Math.floor(Math.random() * 4)],
      });
    }

    function loop(t) {
      if (!running) return;
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;

      if (keys.ArrowLeft) basket.x -= 320 * dt;
      if (keys.ArrowRight) basket.x += 320 * dt;
      basket.x = Math.max(basket.w / 2, Math.min(W - basket.w / 2, basket.x));

      spawnT -= dt;
      if (spawnT <= 0) { spawn(); spawnT = Math.max(0.35, 0.9 - score * 0.02); }

      const by = H - 40;
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.v * dt;
        if (it.y > by - 14 && it.y < by + 14 && Math.abs(it.x - basket.x) < basket.w / 2 + 8) {
          items.splice(i, 1);
          if (it.bad) { lives--; flash("#ffd0dc"); } else { score++; }
          hud();
          if (score >= GAME_TARGET) return end(true);
          if (lives <= 0) return end(false);
        } else if (it.y > H + 20) {
          items.splice(i, 1);
        }
      }
      draw(by);
      requestAnimationFrame(loop);
    }

    let flashColor = null, flashT = 0;
    function flash(c) { flashColor = c; flashT = 8; }

    function draw(by) {
      ctx.clearRect(0, 0, W, H);
      if (flashT > 0) { ctx.fillStyle = flashColor; ctx.fillRect(0, 0, W, H); flashT--; }
      ctx.font = "28px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      items.forEach((it) => ctx.fillText(it.ch, it.x, it.y));
      // basket
      ctx.fillStyle = "#e0709a";
      roundRect(basket.x - basket.w / 2, by - 6, basket.w, 22, 11);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px Quicksand, sans-serif";
      ctx.fillText("my heart", basket.x, by + 5);
    }
    function roundRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.fill();
    }

    function start() {
      reset();
      overlay.classList.add("hidden");
      running = true;
      last = performance.now();
      requestAnimationFrame(loop);
    }
    function end(win) {
      running = false;
      overlay.classList.remove("hidden");
      if (win) {
        msg.innerHTML = "You did it! 🥳<br>Every heart you caught is a piece of mine.";
        $("game-start").textContent = "Play again";
        if (!won) { won = true; $("game-secret").classList.remove("hidden"); }
        burstConfetti(150);
      } else {
        msg.innerHTML = "Oops! My mistakes got in the way 💔<br>…but I'll never stop trying. Again?";
        $("game-start").textContent = "Try again";
      }
    }

    function pointerX(clientX) {
      const r = cv.getBoundingClientRect();
      basket.x = ((clientX - r.left) / r.width) * W;
    }
    cv.addEventListener("pointermove", (e) => running && pointerX(e.clientX));
    cv.addEventListener("pointerdown", (e) => running && pointerX(e.clientX));
    window.addEventListener("keydown", (e) => {
      if (running && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { keys[e.key] = true; e.preventDefault(); }
    });
    window.addEventListener("keyup", (e) => { keys[e.key] = false; });
    $("game-start").onclick = start;

    reset();
    draw(H - 40);
  }

  /* ---------- forgive buttons ---------- */
  const NO_LINES = [
    "Are you sure? 🥺",
    "Pretty please? 🙏",
    "I'll make you chai every morning ☕",
    "I'll let you choose the movie forever 🍿",
    "The button doesn't want you to say no either…",
    "Okay fine, I'll just ask nicely one more time 💗",
  ];
  let noCount = 0;
  const noBtn = $("no-btn");
  function dodge(e) {
    if (e) e.preventDefault();
    $("no-msg").textContent = NO_LINES[Math.min(noCount, NO_LINES.length - 1)];
    noCount++;
    if (noCount >= NO_LINES.length + 1) {
      noBtn.textContent = "Yes 💗";
      noBtn.classList.remove("ghost");
      noBtn.style.transform = "none";
      noBtn.onclick = sayYes;
      noBtn.removeEventListener("mouseenter", dodge);
      noBtn.removeEventListener("touchstart", dodge);
      return;
    }
    const maxX = Math.min(window.innerWidth / 2 - 60, 140);
    const dx = (Math.random() * 2 - 1) * maxX;
    const dy = (Math.random() * 2 - 1) * 70;
    noBtn.style.transform = `translate(${dx}px, ${dy}px)`;
    $("yes-btn").style.transform = `scale(${1 + noCount * 0.1})`;
  }
  noBtn.addEventListener("mouseenter", dodge);
  noBtn.addEventListener("touchstart", dodge, { passive: false });
  noBtn.onclick = dodge;

  function sayYes() {
    $("forgive-box").classList.add("hidden");
    $("no-msg").classList.add("hidden");
    $("final").classList.remove("hidden");
    burstConfetti(250);
    setTimeout(() => burstConfetti(200), 900);
  }
  $("yes-btn").onclick = sayYes;

  /* ---------- confetti ---------- */
  const cc = $("confetti"), cx = cc.getContext("2d");
  let parts = [], confettiRunning = false;
  function resizeConfetti() { cc.width = innerWidth; cc.height = innerHeight; }
  addEventListener("resize", resizeConfetti);
  resizeConfetti();

  function burstConfetti(n) {
    const colors = ["#f4a6c0", "#e0709a", "#c84b7a", "#ffd6e5", "#fff1c9"];
    for (let i = 0; i < n; i++) {
      parts.push({
        x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
        s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        c: colors[Math.floor(Math.random() * colors.length)], heart: Math.random() < 0.3, life: 0,
      });
    }
    if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(confettiLoop); }
  }
  function confettiLoop() {
    cx.clearRect(0, 0, cc.width, cc.height);
    parts = parts.filter((p) => p.y < cc.height + 30 && p.life < 300);
    parts.forEach((p) => {
      p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r);
      if (p.heart) { cx.font = p.s * 3 + "px serif"; cx.fillText("💗", 0, 0); }
      else { cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); }
      cx.restore();
    });
    if (parts.length) requestAnimationFrame(confettiLoop);
    else { confettiRunning = false; cx.clearRect(0, 0, cc.width, cc.height); }
  }
})();
