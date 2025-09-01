// Fast Service Worker registration for PWABuilder
(function() {
  if (!('serviceWorker' in navigator)) return;
  // Register as early as possible
  window.addEventListener('load', function() {
    try {
      navigator.serviceWorker.register('service-worker.js', { scope: './' })
        .then(function(reg) {
          // Optional: listen for updates
          if (reg && reg.update) { try { reg.update(); } catch(e){} }
        })
        .catch(function(err) {
          console.error('SW registration failed:', err);
        });
    } catch (e) {
      console.error('SW registration error:', e);
    }
  });
})();
