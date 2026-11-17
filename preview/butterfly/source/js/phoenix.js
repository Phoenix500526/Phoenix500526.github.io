document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.ph-theme-toggle')?.addEventListener('click', () => document.getElementById('darkmode')?.click());

  const siteStats = document.querySelectorAll('#busuanzi_value_site_uv, #busuanzi_value_site_pv');
  if (siteStats.length) setTimeout(() => {
    siteStats.forEach(element => {
      if (element.textContent === '加载中…') element.textContent = '暂不可用';
    });
  }, 8000);

  document.querySelectorAll('.ph-post-cover img').forEach(image => {
    const hide = () => image.parentElement.classList.add('is-broken');
    image.addEventListener('error', hide);
    if (image.complete && !image.naturalWidth) hide();
  });

  // Keep Butterfly's delegated code handlers, using real keyboard-accessible buttons.
  document.querySelectorAll('.highlight-tools i.copy-button, .highlight-tools i.fullpage-button').forEach(icon => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = icon.className;
    const label = icon.classList.contains('copy-button') ? '复制代码' : '切换代码全屏';
    button.setAttribute('aria-label', label);
    button.title = label;
    icon.replaceWith(button);
  });
  document.querySelectorAll('.code-expand-btn').forEach(button => {
    button.setAttribute('role', 'button');
    button.tabIndex = 0;
    button.setAttribute('aria-label', '展开完整代码');
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const expanded = button.classList.contains('expand-done');
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', expanded ? '收起代码' : '展开完整代码');
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); button.click(); }
    });
  });

  const toc = document.getElementById('card-toc');
  const tocButton = document.querySelector('.ph-mobile-toc');
  const closeToc = () => {
    toc?.classList.remove('open');
    tocButton?.setAttribute('aria-expanded', 'false');
    tocButton?.focus();
  };
  const addCloseButton = (panel, label, close) => {
    if (!panel) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ph-panel-close';
    button.textContent = '关闭 ×';
    button.setAttribute('aria-label', label);
    button.addEventListener('click', close);
    panel.prepend(button);
  };
  addCloseButton(toc, '关闭目录', closeToc);
  const menu = document.getElementById('sidebar-menus');
  const menuButton = document.querySelector('#toggle-menu button');
  const closeMenu = () => {
    document.getElementById('menu-mask')?.click();
  };
  addCloseButton(menu, '关闭导航菜单', closeMenu);
  if (menu && menuButton) {
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', '网站导航');
    menu.setAttribute('aria-modal', 'true');
    const background = [...document.querySelectorAll('#body-wrap, #rightside')];
    let wasOpen = false;
    // Observe native Butterfly open/close so mask clicks and resizing stay in sync.
    const syncMenu = () => {
      const open = menu.classList.contains('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menu.inert = !open;
      background.forEach(element => { element.inert = open; });
      if (open !== wasOpen) {
        // Wait for WebKit to apply inert/visibility changes before moving focus.
        requestAnimationFrame(() => {
          if (menu.classList.contains('open') !== open) return;
          const target = open ? menu.querySelector('button') : menuButton.getClientRects().length ? menuButton : document.querySelector('.nav-site-title');
          target?.focus({ preventScroll: true });
        });
      }
      wasOpen = open;
    };
    new MutationObserver(syncMenu).observe(menu, { attributes: true, attributeFilter: ['class'] });
    const nav = document.getElementById('nav');
    if (nav) new MutationObserver(() => {
      // Native menu layout updates on a later frame than its resize close check.
      if (menu.classList.contains('open') && !menuButton.getClientRects().length) closeMenu();
    }).observe(nav, { attributes: true, attributeFilter: ['class'] });
    syncMenu();
    menu.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const items = [...menu.querySelectorAll('button, a[href]')].filter(element => element.getClientRects().length);
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
  tocButton?.addEventListener('click', () => {
    const open = toc.classList.toggle('open');
    tocButton.setAttribute('aria-expanded', String(open));
    if (open) toc.querySelector('a')?.focus({ preventScroll: true });
  });
  toc?.addEventListener('click', event => {
    if (event.target.closest('a') && window.innerWidth <= 900) {
      toc.classList.remove('open');
      tocButton?.setAttribute('aria-expanded', 'false');
    }
  });

  const search = document.querySelector('#local-search .search-dialog');
  const searchInput = search?.querySelector('input');
  let searchOpener;
  if (search) {
    search.setAttribute('role', 'dialog');
    search.setAttribute('aria-modal', 'true');
    search.setAttribute('aria-label', '搜索文章');
    searchInput.setAttribute('aria-label', '搜索文章、源码与算法');
    search.querySelector('.search-close-button').setAttribute('aria-label', '关闭搜索');
    document.querySelector('#local-search-results')?.setAttribute('aria-live', 'polite');
    document.querySelector('#search-button .search').addEventListener('click', event => { searchOpener = event.currentTarget; });
    search.querySelector('.search-close-button').addEventListener('click', () => searchOpener?.focus());
  }

  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (menu?.classList.contains('open')) return;
      document.querySelector('#search-button .search')?.click();
    }
    if (event.key === 'Escape') {
      if (menu?.classList.contains('open')) closeMenu();
      if (toc?.classList.contains('open')) {
        closeToc();
      }
      const fullscreen = document.querySelector('.code-fullpage .fullpage-button');
      if (fullscreen) { fullscreen.click(); fullscreen.focus(); }
      if (search?.offsetParent) searchOpener?.focus();
    }
    if (event.key === 'Tab' && search?.offsetParent) {
      const focusable = [...search.querySelectorAll('button, input, a[href]')].filter(element => element.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
});
