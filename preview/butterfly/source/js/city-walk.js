(() => {
  const walk = document.querySelector('.ph-city-walk');
  if (!walk) return;
  const scene = walk.querySelector('.ph-walk-scene');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const sync = () => {
    walk.classList.toggle('is-walking', visible && !document.hidden && !reducedMotion.matches);
  };
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && !scene.style.backgroundImage) {
      scene.style.backgroundImage = `url("${scene.dataset.street}")`;
      walk.querySelector('.ph-dog-sprite').style.backgroundImage = `url("${scene.dataset.dog}")`;
    }
    sync();
  });
  observer.observe(scene);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  sync();
})();
