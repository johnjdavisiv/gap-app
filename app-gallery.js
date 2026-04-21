// app-gallery.js — vanilla renderer for the app-gallery block.
//
// Expects window.RW_APPS and window.RW_APP_GALLERY_UI_ICONS (both populated
// by apps.js). Finds any .rw-app-gallery element on the page and renders the
// card strip into it. Reads data-current to omit the active app.
//
// Usage:
//   <link rel="stylesheet" href="./app-gallery.css">
//   <script src="./apps.js" defer></script>
//   <script src="./app-gallery.js" defer></script>
//   ...
//   <div class="rw-app-gallery" data-current="wind-calculator"></div>

(function () {
  const HEADING_TEXT = 'Check out my other apps';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function svgElementFrom(svgString) {
    const tmp = document.createElement('div');
    tmp.innerHTML = svgString.trim();
    return tmp.firstElementChild;
  }

  function buildCard(app) {
    const a = document.createElement('a');
    a.className = 'rw-app-gallery__card';
    a.href = app.href;
    a.setAttribute('data-app-id', app.id);

    const iconWrap = document.createElement('span');
    iconWrap.className = 'rw-app-gallery__icon';
    iconWrap.setAttribute('aria-hidden', 'true');
    const svg = svgElementFrom(app.iconSvg);
    if (svg) iconWrap.appendChild(svg);

    const title = document.createElement('span');
    title.className = 'rw-app-gallery__title';
    title.textContent = app.title;

    a.appendChild(iconWrap);
    a.appendChild(title);
    return a;
  }

  function buildArrow(direction, uiIcons) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'rw-app-gallery__arrow rw-app-gallery__arrow--' + direction;
    btn.setAttribute(
      'aria-label',
      direction === 'left' ? 'Scroll to previous apps' : 'Scroll to more apps'
    );
    const svgString =
      direction === 'left' ? uiIcons.chevronLeft : uiIcons.chevronRight;
    const svg = svgElementFrom(svgString);
    if (svg) {
      svg.setAttribute('aria-hidden', 'true');
      btn.appendChild(svg);
    }
    return btn;
  }

  function updateOverflowState(viewport, strip) {
    const hasOverflow = strip.scrollWidth - strip.clientWidth > 1;
    const atStart = strip.scrollLeft <= 1;
    const atEnd = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 1;

    viewport.setAttribute('data-overflow', hasOverflow ? 'true' : 'false');
    viewport.setAttribute(
      'data-overflow-start',
      hasOverflow && !atStart ? 'true' : 'false'
    );
    viewport.setAttribute(
      'data-overflow-end',
      hasOverflow && !atEnd ? 'true' : 'false'
    );
  }

  function getCardWidth(strip) {
    const firstCard = strip.querySelector('.rw-app-gallery__card');
    if (!firstCard) return 160;
    const style = window.getComputedStyle(strip);
    const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function render(root) {
    const apps = window.RW_APPS || [];
    const uiIcons = window.RW_APP_GALLERY_UI_ICONS || {};
    const currentId = root.getAttribute('data-current') || '';
    const showAll = root.getAttribute('data-all') === 'true';

    const visible = showAll
      ? apps
      : apps.filter(function (a) {
          return a.id !== currentId;
        });

    // Clear any existing content (re-render safe).
    root.innerHTML = '';

    const heading = document.createElement('h2');
    heading.className = 'rw-app-gallery__heading';
    heading.textContent = root.getAttribute('data-heading') || HEADING_TEXT;
    root.appendChild(heading);

    const viewport = document.createElement('div');
    viewport.className = 'rw-app-gallery__viewport';

    const strip = document.createElement('div');
    strip.className = 'rw-app-gallery__strip';
    strip.setAttribute('role', 'region');
    strip.setAttribute('aria-label', 'Other Running Writings apps');

    visible.forEach(function (app) {
      strip.appendChild(buildCard(app));
    });

    const leftArrow = buildArrow('left', uiIcons);
    const rightArrow = buildArrow('right', uiIcons);

    viewport.appendChild(strip);
    viewport.appendChild(leftArrow);
    viewport.appendChild(rightArrow);
    root.appendChild(viewport);

    // Arrow click handlers — scroll by ~one card width.
    leftArrow.addEventListener('click', function () {
      strip.scrollBy({ left: -getCardWidth(strip), behavior: 'smooth' });
    });
    rightArrow.addEventListener('click', function () {
      strip.scrollBy({ left: getCardWidth(strip), behavior: 'smooth' });
    });

    // Boundary-state recomputation.
    const recompute = function () {
      updateOverflowState(viewport, strip);
    };
    strip.addEventListener('scroll', recompute, { passive: true });

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(recompute);
      ro.observe(strip);
    } else {
      window.addEventListener('resize', recompute);
    }

    // Fonts / images can change the card size after the first layout; compute
    // again on the next frame and one more time after a beat.
    requestAnimationFrame(recompute);
    setTimeout(recompute, 250);
    recompute();
  }

  ready(function () {
    const roots = document.querySelectorAll('.rw-app-gallery');
    roots.forEach(render);
  });
})();
