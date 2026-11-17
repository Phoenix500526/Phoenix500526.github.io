(() => {
  const walk = document.querySelector('.ph-city-walk');
  if (!walk) return;
  const scene = walk.querySelector('.ph-walk-scene');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let ready = false;
  const sync = () => {
    walk.classList.toggle('is-walking', ready && visible && !document.hidden && !reducedMotion.matches);
  };
  const preload = () => {
    Promise.all([scene.dataset.street, scene.dataset.dog].map(src => {
      const image = new Image();
      image.fetchPriority = 'low';
      image.src = src;
      return image.decode();
    })).then(() => {
      scene.style.backgroundImage = `url("${scene.dataset.street}")`;
      walk.querySelector('.ph-dog-sprite').style.backgroundImage = `url("${scene.dataset.dog}")`;
      ready = true;
      walk.classList.add('is-ready');
      sync();
    }).catch(() => {
      // Keep the embedded street visible if either full-size image fails.
    });
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  });
  // This script is deferred; slow page resources must not hold up the scene.
  preload();
  observer.observe(scene);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  sync();
})();
