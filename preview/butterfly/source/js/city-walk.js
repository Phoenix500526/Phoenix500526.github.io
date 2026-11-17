(() => {
  const walk = document.querySelector('.ph-city-walk');
  if (!walk) return;
  const scene = walk.querySelector('.ph-walk-scene');
  const button = walk.querySelector('.ph-walk-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let paused = false;
  const sync = () => {
    walk.classList.toggle('is-walking', visible && !paused && !document.hidden && !reducedMotion.matches);
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? '继续散步动画' : '暂停散步动画');
    button.querySelector('span').textContent = paused ? '继续' : '暂停';
    button.querySelector('i').className = paused ? 'fas fa-play' : 'fas fa-pause';
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
  button.addEventListener('click', () => { paused = !paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  sync();
})();
