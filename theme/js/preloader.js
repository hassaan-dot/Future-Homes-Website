/**
 * WEBSITE: https://themefisher.com
 * TWITTER: https://twitter.com/themefisher
 * FACEBOOK: https://facebook.com/themefisher
 * GITHUB: https://github.com/themefisher/
 */

/**
 * Future Homes - Global Construction Lottie Preloader Manager
 */

(function () {
  'use strict';

  var lottieInstance = null;
  var minDisplayDuration = 400; // Minimum display time for smooth visual experience
  var startTime = Date.now();
  var isPreloaderActive = true;

  function initLottieLoader() {
    var container = document.getElementById('lottie-construction-container');
    if (!container) return;

    if (window.lottie) {
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
  }

  function setProgress(percent) {
    var progressBar = document.getElementById('preloader-progress-bar');
    if (progressBar) {
      progressBar.style.width = Math.min(100, Math.max(0, percent)) + '%';
    }
  }

  function hidePreloader() {
    var preloader = document.getElementById('page-preloader');
    if (!preloader || !isPreloaderActive) return;

    setProgress(100);

    var elapsedTime = Date.now() - startTime;
    var remainingTime = Math.max(0, minDisplayDuration - elapsedTime);

    setTimeout(function () {
      preloader.classList.add('preloader-hidden');
      isPreloaderActive = false;
      document.body.classList.remove('preloader-active-overflow');
    }, remainingTime);
  }

  function showPreloader(statusMessage) {
    var preloader = document.getElementById('page-preloader');
    var statusEl = document.getElementById('preloader-status-text');
    if (!preloader) return;

    if (statusMessage && statusEl) {
      statusEl.textContent = statusMessage;
    } else if (statusEl) {
      statusEl.textContent = 'Building Excellence...';
    }

    setProgress(10);
    preloader.classList.remove('preloader-hidden');
    isPreloaderActive = true;
    startTime = Date.now();
    document.body.classList.add('preloader-active-overflow');

    if (lottieInstance) {
      lottieInstance.play();
    }

    // Simulate progress animation during page transition
    setTimeout(function () { setProgress(45); }, 100);
    setTimeout(function () { setProgress(75); }, 250);
  }

  // Expose global methods for data / API / dynamic component loading
  window.showPagePreloader = showPreloader;
  window.hidePagePreloader = hidePreloader;

  // Track page image & component loading progress
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

  // Handle internal link navigation transitions smoothly
  function setupNavigationInterception() {
    document.addEventListener('click', function (e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target || !target.getAttribute('href')) return;

      var href = target.getAttribute('href');
      var isTargetBlank = target.getAttribute('target') === '_blank';
      var isDownload = target.hasAttribute('download');
      var isHash = href.indexOf('#') === 0;
      var isSpecial = href.indexOf('javascript:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('mailto:') === 0;

      if (isTargetBlank || isDownload || isHash || isSpecial) return;

      // Check if internal domain or relative path
      var isRelative = href.indexOf('/') === 0 || (!href.includes('://') && !href.startsWith('//'));
      var isSameDomain = href.includes(window.location.hostname);

      if (isRelative || isSameDomain) {
        var currentPath = window.location.pathname;
        // If navigating to a different page
        if (href !== currentPath && href !== currentPath + '#' && href !== window.location.href) {
          e.preventDefault();
          showPreloader('Constructing View...');
          setTimeout(function () {
            window.location.href = href;
          }, 180);
        }
      }
    });
  }

  // DOM ready initialization
  document.addEventListener('DOMContentLoaded', function () {
    initLottieLoader();
    monitorAssets();
    setupNavigationInterception();
  });

  // Window load safety trigger
  window.addEventListener('load', function () {
    hidePreloader();
  });

  // Handle back/forward cache restore
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      hidePreloader();
    }
  });

})();
