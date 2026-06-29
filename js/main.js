// Progressive enhancement only — site works fully without this file.
(() => {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  if (!links.length) return;

  // Nav-targeted sections that are actually visible (skips display:none, e.g. an empty Projects).
  const targets = links
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(el => el && el.getClientRects().length);

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href').slice(1) === id));
  };

  const update = () => {
    // At the bottom of the page, activate the last target (the footer can't reach a mid-screen line).
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      setActive(targets[targets.length - 1]?.id);
      return;
    }
    // Otherwise: the last target whose top has crossed the 40% line; none while the hero is in view.
    const line = window.innerHeight * 0.4;
    let current = null;
    for (const t of targets) {
      if (t.getBoundingClientRect().top <= line) current = t;
    }
    setActive(current ? current.id : null);
  };

  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { update(); ticking = false; }); ticking = true; }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();
