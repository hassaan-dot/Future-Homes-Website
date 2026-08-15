/**
 * Future Homes - Global Construction Lottie Preloader Manager
 * Full-screen overlay during first load and internal page navigation.
 * Must never remain in the header or document flow after content is ready.
 */

(function () {
  'use strict';

  var lottieInstance = null;
  var minDisplayDuration = 400;
  var maxDisplayDuration = 8000;
  var startTime = Date.now();
  var isPreloaderActive = true;
  var hideTimer = null;
  var maxTimer = null;

  function getPreloader() {
    return document.getElementById('page-preloader');
  }

  function attachToBody(preloader) {
    if (!preloader || !document.body) {
      return;
    }
    if (preloader.parentElement !== document.body) {
      document.body.appendChild(preloader);
    } else if (document.body.lastElementChild !== preloader) {
      document.body.appendChild(preloader);
    }
  }

  function initLottieLoader() {
    var container = document.getElementById('lottie-construction-container');
    if (!container || !window.lottie) {
      return;
    }

    try {
      lottieInstance = window.lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/images/construction-loader.json'
      });
    } catch (err) {
      console.warn('Lottie animation fallback:', err);
    }
  }

  function setProgress(percent) {
    var progressBar = document.getElementById('preloader-progress-bar');
    if (progressBar) {
      progressBar.style.width = Math.min(100, Math.max(0, percent)) + '%';
    }
  }

  function hidePreloader() {
    var preloader = getPreloader();
    if (!preloader || !isPreloaderActive) {
      if (preloader) {
        preloader.classList.add('preloader-hidden');
        preloader.setAttribute('aria-busy', 'false');
        preloader.setAttribute('aria-hidden', 'true');
      }
      document.body.classList.remove('preloader-active-overflow');
      return;
    }

    setProgress(100);

    var elapsedTime = Date.now() - startTime;
    var remainingTime = Math.max(0, minDisplayDuration - elapsedTime);

    if (hideTimer) {
      clearTimeout(hideTimer);
    }

    hideTimer = setTimeout(function () {
      preloader.classList.add('preloader-hidden');
      preloader.setAttribute('aria-busy', 'false');
      preloader.setAttribute('aria-hidden', 'true');
      isPreloaderActive = false;
      document.body.classList.remove('preloader-active-overflow');
      if (lottieInstance && typeof lottieInstance.pause === 'function') {
        lottieInstance.pause();
      }
    }, remainingTime);
  }

  function showPreloader(statusMessage) {
    var preloader = getPreloader();
    var statusEl = document.getElementById('preloader-status-text');
    if (!preloader) {
      return;
    }

    attachToBody(preloader);

    if (statusMessage && statusEl) {
      statusEl.textContent = statusMessage;
    } else if (statusEl) {
      statusEl.textContent = 'Building Excellence...';
    }

    setProgress(10);
    preloader.classList.remove('preloader-hidden');
    preloader.setAttribute('aria-busy', 'true');
    preloader.removeAttribute('aria-hidden');
    isPreloaderActive = true;
    startTime = Date.now();
    document.body.classList.add('preloader-active-overflow');

    if (lottieInstance && typeof lottieInstance.play === 'function') {
      lottieInstance.play();
    }

    setTimeout(function () { setProgress(45); }, 100);
    setTimeout(function () { setProgress(75); }, 250);
  }

  window.showPagePreloader = showPreloader;
  window.hidePagePreloader = hidePreloader;

  function monitorAssets() {
    var images = document.querySelectorAll('img');
    var totalImages = images.length;
    if (totalImages === 0) {
      hidePreloader();
      return;
    }

    var loadedCount = 0;
    function imageLoaded() {
      loadedCount++;
      var pct = Math.round((loadedCount / totalImages) * 90);
      setProgress(pct);
      if (loadedCount >= totalImages) {
        hidePreloader();
      }
    }

    for (var i = 0; i < images.length; i++) {
      var img = images[i];
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded);
      }
    }
  }

  function isInternalHref(href) {
    var isHash = href.indexOf('#') === 0;
    var isSpecial = href.indexOf('javascript:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('mailto:') === 0;
    if (isHash || isSpecial) {
      return false;
    }
    var isRelative = href.indexOf('/') === 0 || (href.indexOf('://') === -1 && href.indexOf('//') !== 0);
    var isSameDomain = href.indexOf(window.location.hostname) !== -1;
    return isRelative || isSameDomain;
  }

  function setupNavigationInterception() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target || !target.getAttribute('href')) {
        return;
      }

      var href = target.getAttribute('href');
      var isTargetBlank = target.getAttribute('target') === '_blank';
      var isDownload = target.hasAttribute('download');
      var isDropdownToggle = target.getAttribute('data-toggle') === 'dropdown';

      if (isTargetBlank || isDownload || isDropdownToggle || !isInternalHref(href)) {
        return;
      }

      var destination;
      try {
        destination = new URL(href, window.location.href);
      } catch (err) {
        return;
      }

      if (destination.pathname === window.location.pathname && destination.hash) {
        return;
      }

      if (destination.href === window.location.href) {
        return;
      }

      e.preventDefault();
      showPreloader('Building Excellence...');
      setTimeout(function () {
        window.location.href = destination.href;
      }, 180);
    });
  }

  function boot() {
    var preloader = getPreloader();
    if (preloader) {
      attachToBody(preloader);
      document.body.classList.add('preloader-active-overflow');
    }
    initLottieLoader();
    monitorAssets();
    setupNavigationInterception();

    if (maxTimer) {
      clearTimeout(maxTimer);
    }
    maxTimer = setTimeout(hidePreloader, maxDisplayDuration);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', function () {
    hidePreloader();
  });

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      hidePreloader();
    }
  });

})();
