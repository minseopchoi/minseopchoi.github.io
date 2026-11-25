(function () {
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function setState(target, v) {
    target.setAttribute('data-state', v);
    target.dispatchEvent(new CustomEvent('statechange'));
    document.querySelectorAll('[data-seg]').forEach(function (seg) {
      if (document.querySelector(seg.getAttribute('data-seg')) !== target) return;
      seg.querySelectorAll('button[data-value]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-value') === v ? 'true' : 'false');
      });
    });
  }

  function initSeg(root) {
    root.querySelectorAll('[data-seg]').forEach(function (seg) {
      var target = document.querySelector(seg.getAttribute('data-seg'));
      if (!target) return;
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-value]');
        if (!b) return;
        target.removeAttribute('data-autoplay');
        setState(target, b.getAttribute('data-value'));
      });
    });
  }

  function reveal(el) {
    el.classList.add('is-in');
    var ap = el.getAttribute('data-autoplay');
    if (!ap || reduce) return;
    var s = ap.split(',');
    setState(el, s[0]);
    setTimeout(function () { if (el.hasAttribute('data-autoplay')) setState(el, s[1]); }, 900);
  }
  function initReveal(root) {
    var els = root.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initTangle(root) {
    root.querySelectorAll('.tg-lines').forEach(function (svg) {
      var n = 6, s = '';
      for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
          if ((i + j) % 2 === 0 || Math.abs(i - j) > 2) {
            var x1 = ((i + 0.5) / n) * 600, x2 = ((j + 0.5) / n) * 600;
            s += '<line x1="' + x1 + '" y1="0" x2="' + x2 + '" y2="100"/>';
          }
        }
      }
      svg.innerHTML = s;
    });
  }

  function initWaffle(root) {
    root.querySelectorAll('[data-waffle]').forEach(function (w) {
      var map = JSON.parse(w.getAttribute('data-waffle'));
      var host = w.closest('[data-state]');
      var html = '';
      for (var i = 0; i < 100; i++) html += '<i></i>';
      w.innerHTML = html;
      function paint() {
        var n = map[host.getAttribute('data-state')] || 0;
        Array.prototype.forEach.call(w.children, function (c, i) { c.classList.toggle('on', i < n); });
      }
      paint();
      host.addEventListener('statechange', paint);
    });
  }

  function initMatrix(root) {
    root.querySelectorAll('.mx').forEach(function (mx) {
      function clear() { mx.querySelectorAll('.hl').forEach(function (x) { x.classList.remove('hl'); }); }
      mx.addEventListener('mouseover', function (e) {
        var t = e.target.closest('[data-r],[data-c]');
        clear();
        if (!t) return;
        var r = t.getAttribute('data-r'), c = t.getAttribute('data-c');
        mx.querySelectorAll('div').forEach(function (d) {
          var dr = d.getAttribute('data-r'), dc = d.getAttribute('data-c');
          if ((r !== null && dr === r && dc !== null) || (c !== null && dc === c)) d.classList.add('hl');
        });
      });
      mx.addEventListener('mouseleave', clear);
    });
  }

  function initToc(root) {
    var links = root.querySelectorAll('.toc a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('on'); });
          map[en.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  function initEmail(root) {
    root.querySelectorAll('[data-email]').forEach(function (a) {
      var p = a.getAttribute('data-email').split('|');
      var addr = p[0] + '@' + p[1];
      a.href = 'mailto:' + addr;
      a.textContent = addr;
    });
  }

  function initLayerLink(root) {
    root.querySelectorAll('.lc').forEach(function (lc) {
      function mark(g) {
        lc.querySelectorAll('.grp').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-g') === g); });
        lc.querySelectorAll('.panel.before .lyr').forEach(function (x) { x.classList.toggle('hl', x.getAttribute('data-g') === g); });
      }
      lc.querySelectorAll('.grp').forEach(function (grp) {
        var g = grp.getAttribute('data-g');
        grp.addEventListener('mouseenter', function () { mark(g); });
        grp.addEventListener('focusin', function () { mark(g); });
        grp.addEventListener('click', function () { mark(g); });
      });
      lc.addEventListener('mouseleave', function () { mark(null); });
    });
  }

  function initAll(root) {
    initSeg(root); initTangle(root); initWaffle(root); initMatrix(root);
    initReveal(root); initToc(root); initEmail(root); initLayerLink(root);
  }
  window.initAll = initAll;
  initAll(document);

  (function initTopPager() {
    var pager = document.querySelector('.pager');
    var crumb = document.querySelector('.crumb');
    if (!pager || !crumb) return;
    var nav = document.createElement('nav');
    nav.className = 'mini-pager';
    nav.setAttribute('aria-label', '이전·다음 프로젝트');
    pager.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href.indexOf('index.html') !== -1) return;
      var isNext = a.classList.contains('next');
      var b = a.querySelector('b');
      var title = b ? b.textContent.replace(/^←\s*/, '').replace(/\s*→$/, '') : '';
      var m = document.createElement('a');
      m.href = href;
      m.title = title;
      m.setAttribute('aria-label', (isNext ? '다음: ' : '이전: ') + title);
      m.textContent = isNext ? '다음 →' : '← 이전';
      nav.appendChild(m);
    });
    if (!nav.children.length) return;
    var row = document.createElement('div');
    row.className = 'toprow';
    crumb.parentNode.insertBefore(row, crumb);
    row.appendChild(crumb);
    row.appendChild(nav);
  })();

  var payloadEl = document.getElementById('locked-payload');
  if (!payloadEl) return;
  var p = JSON.parse(payloadEl.textContent);
  var form = document.getElementById('unlock-form');
  var input = document.getElementById('unlock-pw');
  var err = document.getElementById('unlock-err');
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  input.addEventListener('input', function () { err.textContent = ''; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.textContent = '';
    if (!input.value) { err.textContent = '비밀번호를 입력해 주세요.'; input.focus(); return; }
    if (!window.crypto || !crypto.subtle) { err.textContent = '이 브라우저에서는 열 수 없어요. 최신 Chrome, Safari, Edge에서 열어 주세요.'; return; }
    var btn = form.querySelector('button');
    btn.disabled = true;
    var enc = new TextEncoder();
    var iv = b64(p.iv), ct = b64(p.ct), mac = b64(p.mac);
    crypto.subtle.importKey('raw', enc.encode(input.value), 'PBKDF2', false, ['deriveBits'])
      .then(function (base) {
        return crypto.subtle.deriveBits({ name: 'PBKDF2', salt: b64(p.salt), iterations: p.iter, hash: 'SHA-256' }, base, 512);
      })
      .then(function (bits) {
        bits = new Uint8Array(bits);
        return Promise.all([
          crypto.subtle.importKey('raw', bits.slice(0, 32), { name: 'AES-CBC' }, false, ['decrypt']),
          crypto.subtle.importKey('raw', bits.slice(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
        ]);
      })
      .then(function (keys) {
        var data = new Uint8Array(iv.length + ct.length);
        data.set(iv); data.set(ct, iv.length);
        return crypto.subtle.verify('HMAC', keys[1], mac, data).then(function (ok) {
          if (!ok) throw new Error('bad-password');
          return crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, keys[0], ct);
        });
      })
      .then(function (plain) {
        var rootEl = document.getElementById('locked-root');
        rootEl.innerHTML = new TextDecoder().decode(plain);
        document.getElementById('lock-panel').remove();
        initAll(rootEl);
        rootEl.focus();
      })
      .catch(function (x) {
        btn.disabled = false;
        err.textContent = x && x.message === 'bad-password'
          ? '비밀번호가 맞지 않아요. 다시 확인해 주세요.'
          : '페이지를 여는 중에 문제가 생겼어요. 새로고침 후 다시 시도해 주세요.';
        input.select();
      });
  });
})();
