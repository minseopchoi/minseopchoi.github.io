(function () {
  document.documentElement.classList.add('js');
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var hasIO = 'IntersectionObserver' in window;
  var gs = window.gsap && window.ScrollTrigger && !reduce;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (!hasIO) document.documentElement.classList.add('no-io');
  var narrow = matchMedia('(max-width: 820px)');

  function fitMetric() {
    document.querySelectorAll('.c-metric strong').forEach(function (el) {
      el.style.fontSize = '';
      var avail = el.parentElement.clientWidth, w = el.scrollWidth;
      if (avail > 0 && w > avail) el.style.fontSize = Math.floor(parseFloat(getComputedStyle(el).fontSize) * avail / w) + 'px';
    });
  }
  fitMetric();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitMetric);
  var fitT; window.addEventListener('resize', function () { cancelAnimationFrame(fitT); fitT = requestAnimationFrame(fitMetric); });

  document.querySelectorAll('[data-disclose]').forEach(function (b) {
    var t = document.getElementById(b.getAttribute('aria-controls'));
    if (!t) return;
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      t.hidden = open;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  var stripLinks = document.querySelectorAll('.strip a[data-stage]');
  function mark(stage) { stripLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-stage') === stage); }); }
  if (stripLinks.length) {
    var groups = {};
    document.querySelectorAll('[data-stage-sec]').forEach(function (s) {
      var k = s.getAttribute('data-stage-sec');
      (groups[k] = groups[k] || []).push(s);
    });
    if (window.ScrollTrigger) {
      Object.keys(groups).forEach(function (k) {
        var g = groups[k], link = document.querySelector('.strip a[data-stage="' + k + '"]');
        ScrollTrigger.create({
          trigger: g[0], endTrigger: g[g.length - 1], start: 'top 45%', end: 'bottom 45%',
          onToggle: function (self) { if (self.isActive) mark(k); else if (k === 'problem' && self.direction < 0) mark(''); },
          onUpdate: function (self) { link.style.setProperty('--p', self.progress.toFixed(3)); }
        });
      });
    } else if (hasIO) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) mark(e.target.getAttribute('data-stage-sec')); });
      }, { rootMargin: '-44% 0px -55% 0px' });
      document.querySelectorAll('[data-stage-sec]').forEach(function (s) { io.observe(s); });
    }
  }

  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && hasIO) {
    var tio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -54% 0px' });
    tocLinks.forEach(function (a) { var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) tio.observe(s); });
  }

  document.querySelectorAll('[data-scrolly]').forEach(function (wrap) {
    var fig = wrap.querySelector('.stage [data-step]');
    var steps = wrap.querySelectorAll('.step[data-to]');
    if (!fig || !steps.length) return;
    var vbWide = fig.getAttribute('viewBox'), vbNarrow = fig.getAttribute('data-viewbox-narrow');
    function fit() { if (vbNarrow) fig.setAttribute('viewBox', narrow.matches ? vbNarrow : vbWide); }
    fit();
    if (narrow.addEventListener) narrow.addEventListener('change', fit);
    fig.querySelectorAll('.wander,.wire,.route').forEach(function (p) {
      p.style.setProperty('--len', p.getTotalLength ? Math.ceil(p.getTotalLength()) + 2 : 1000);
    });
    function go(step) {
      fig.setAttribute('data-step', step.getAttribute('data-to'));
      steps.forEach(function (s) { s.classList.toggle('on', s === step); });
    }
    if (!hasIO) { steps.forEach(function (s) { s.classList.add('on'); }); return; }
    go(steps[0]);
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) go(e.target); });
    }, { rootMargin: narrow.matches ? '-66% 0px -22% 0px' : '-42% 0px -42% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  });

  document.querySelectorAll('.flow').forEach(function (flow) {
    function focus(b) { if (b) flow.setAttribute('data-focus', b); else flow.removeAttribute('data-focus'); }
    flow.querySelectorAll('[data-b]').forEach(function (el) {
      var b = el.getAttribute('data-b').split(' ')[0];
      el.addEventListener('mouseenter', function () { focus(b); });
      el.addEventListener('focus', function () { focus(b); });
      el.addEventListener('blur', function () { focus(null); });
    });
    flow.addEventListener('mouseleave', function () { focus(null); });
    if (!reduce && hasIO) flow.classList.add('anim');
  });

  document.querySelectorAll('[data-hour]').forEach(function (box) {
    var cfg = JSON.parse(box.getAttribute('data-hour'));
    var n = parseInt(box.getAttribute('data-cells') || '60', 10);
    var grid = box.querySelector('.min');
    var html = '';
    for (var i = 0; i < n; i++) html += '<i style="--i:' + i + '"></i>';
    grid.innerHTML = html;
    var cells = grid.children;
    var btns = box.querySelectorAll('[data-hour-set]');
    var auto = true;
    function paint(k) {
      var c = cfg[k] || { on: 0 };
      for (var i = 0; i < n; i++) {
        cells[i].className = i < c.on ? 'on' : (i < c.on + (c.maybe || 0) ? 'maybe' : (c.gain ? 'gain' : ''));
      }
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-hour-set') === k ? 'true' : 'false'); });
      box.querySelectorAll('[data-show]').forEach(function (el) { el.hidden = el.getAttribute('data-show').split(' ').indexOf(k) === -1; });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { auto = false; paint(b.getAttribute('data-hour-set')); }); });
    var order = Object.keys(cfg);
    if (reduce || !hasIO) { paint(order[order.length - 1]); return; }
    paint('none');
    var io = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io.disconnect();
      paint(order[0]);
      setTimeout(function () { if (auto) paint(order[1]); }, 2200);
    }, { threshold: 0.45 });
    io.observe(box);
  });

  document.querySelectorAll('.gantt').forEach(function (g) {
    function focus(k) { if (k) g.setAttribute('data-focus', k); else g.removeAttribute('data-focus'); }
    g.querySelectorAll('[data-err]').forEach(function (el) {
      var k = el.getAttribute('data-err');
      el.addEventListener('mouseenter', function () { focus(k); });
      el.addEventListener('focus', function () { focus(k); });
      el.addEventListener('blur', function () { focus(null); });
    });
    g.addEventListener('mouseleave', function () { focus(null); });
  });

  var revealEls = document.querySelectorAll('[data-reveal],.flow,.tline,.themes,.tbar');
  if (!hasIO || reduce) revealEls.forEach(function (el) { el.classList.add('is-in'); });
  else {
    var rio = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
    }, { threshold: 0.35 });
    revealEls.forEach(function (el) { rio.observe(el); });
  }

  if (!gs) return;
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .fromTo('.c-hero h1 .ln', { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 30 }, { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, duration: 1.1, stagger: 0.09, clearProps: 'clipPath,transform' }, 0.05)
    .fromTo('.c-metric strong', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, clearProps: 'clipPath' }, 0.45);
  gsap.utils.toArray('.figs strong').forEach(function (el) {
    gsap.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.out', clearProps: 'clipPath', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
})();
