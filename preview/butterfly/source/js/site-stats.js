(() => {
  const start = () => {
    const metrics = ['site_uv', 'site_pv'];
    const showStatus = text => metrics.forEach(metric => {
      const element = document.getElementById('busuanzi_value_' + metric);
      if (element) element.textContent = text;
    });
    let attempts = 0;
    const request = () => {
      const attempt = ++attempts;
      const callback = 'BusuanziCallback_' + Date.now() + '_' + attempt;
      const script = document.createElement('script');
      let settled = false;
      showStatus('加载中…');
      // Keep the request alive: a slow response can still replace this status.
      const timer = setTimeout(() => showStatus('暂不可用'), 8000);
      const cleanup = () => {
        settled = true;
        clearTimeout(timer);
        script.remove();
        delete window[callback];
      };
      window[callback] = data => {
        if (settled) return;
        cleanup();
        if (!metrics.every(metric => Number.isSafeInteger(data?.[metric]) && data[metric] >= 0)) {
          showStatus('暂不可用');
          return;
        }
        metrics.forEach(metric => {
          const element = document.getElementById('busuanzi_value_' + metric);
          if (element) element.textContent = String(data[metric]);
        });
      };
      script.onerror = () => {
        if (settled) return;
        cleanup();
        if (attempt < 3) {
          setTimeout(request, attempt * 1000);
        } else {
          showStatus('暂不可用');
        }
      };
      script.async = true;
      script.referrerPolicy = 'no-referrer-when-downgrade';
      script.src = 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=' + callback;
      document.head.appendChild(script);
    };
    request();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
