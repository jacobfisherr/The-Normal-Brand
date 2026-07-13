/* [PLP video A/B test] start — remove this block + overrides.css block + card-product.liquid map if test loses */
const PLP_AB = {
  _map: undefined,
  flagObserver: false,
  gridObserver: false,
  io: null,

  map() {
    if (this._map === undefined) {
      const el = document.getElementById('plp-ab-video-map');
      try { this._map = el ? JSON.parse(el.textContent) : {}; }
      catch (e) { this._map = {}; }
    }
    return this._map;
  },

  flagOn() {
    return document.documentElement.getAttribute('data-vs-plp-video') === 'true';
  },

  watchFlag() {
    if (this.flagObserver) return;
    this.flagObserver = true;
    new MutationObserver(() => {
      const on = this.flagOn();
      document.querySelectorAll('product-card[data-plp-ab-test="true"]').forEach((card) => {
        card.syncPlayback(on);
      });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-vs-plp-video'] });
  },

  watchViewport() {
    if (this.io) return;
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.plpVisible = entry.isIntersecting;
          entry.target.syncPlayback(this.flagOn());
        });
      },
      { rootMargin: '300px 0px' }
    );
  },

  reconcile() {
    const seen = new Set();
    document.querySelectorAll('product-card[data-plp-ab-test="true"]').forEach((card) => {
      if (!card.videoUrl) return;
      if (card.userSelected) {
        seen.add(card.videoUrl);
        return;
      }
      if (seen.has(card.videoUrl)) {
        card.setMedia(null);
      } else {
        seen.add(card.videoUrl);
        card.setMedia(card.videoUrl);
      }
    });
  },

  reconcileDeferred() {
    setTimeout(() => {
      this.reconcile();
      setTimeout(() => { this.reconcile(); }, 120);
    }, 80);
  },

  watchGrid() {
    if (this.gridObserver) return;
    this.gridObserver = true;

    let queued = false;
    const run = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        this.reconcileDeferred();
      });
    };
    const isCard = (node) =>
      node.nodeType === 1 && (node.matches?.('product-card') || node.querySelector?.('product-card'));

    const container =
      document.getElementById('ProductGridContainer') ||
      document.getElementById('product-grid')?.parentElement ||
      document.body;

    new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) if (isCard(node)) return run();
        for (const node of m.removedNodes) if (isCard(node)) return run();
      }
    }).observe(container, { childList: true, subtree: true });
  },
};

function handleFromUrl(url) {
  if (!url) return null;
  const path = url.split('?')[0].split('/products/')[1];
  return path ? path.split('/')[0] : null;
}
/* [PLP video A/B test] end */

class ProductCard extends HTMLElement {
  constructor() {
    super();

    this.elements = {
      swatches: this.querySelectorAll('.product_tile_color_holder input[type="radio"]'),
      swatchLabels: this.querySelectorAll('.product_tile_color_holder label'),
      swatchName: this.querySelector('.product-tile-color-name'),
      image: this.querySelector('.card__media img:first-child'),
      priceRegular: this.querySelector('.price__regular .price-item'),
      priceSaleOriginal: this.querySelector('.price__sale .price-item--regular'),
      priceSale: this.querySelector('.price__sale .price-item--sale'),
      titles: this.querySelectorAll('.full-unstyled-link:not(.product_tile_color_holder__more-colors)'),
      links: this.querySelectorAll('.full-unstyled-link'),
    };

    this.elements.swatches.forEach((el) => {
      el.addEventListener('change', this.onSwatchChange.bind(this));
    });

    this.elements.swatchLabels.forEach((el) => {
      el.addEventListener('mouseenter', this.onSwatchChangeMouseEnter.bind(this));
    });

    this.setupVideo();
  }

  onSwatchChangeMouseEnter(e) {
    const targetSwatch = e.target.getAttribute('for');

    if (targetSwatch) {
      const targetSwatchElement = document.querySelector(`#${targetSwatch}`);
      this.onSwatchChange({
        target: targetSwatchElement,
      });
    }
  }

  getUrlWithCollectionContext(url) {
    if (url.includes('/collections/')) {
      return url;
    }
    
    // Preserve collection path if present in current URL
    const currentPath = window.location.pathname;
    const collectionMatch = currentPath.match(/^(\/collections\/[^\/]+)/);
    
    if (collectionMatch && url.startsWith('/products/')) {
      return `${collectionMatch[1]}${url}`;
    }
    
    return url;
  }

  onSwatchChange(e) {
    const {
      dataset: { productName, productImage, productPrice, productCompareAtPrice, productUrl },
      value,
    } = e.target;

    if (productName) {
      this.elements.titles.forEach((el) => {
        el.innerHTML = productName;
      });
    }

    if (productUrl) {
      const urlWithCollection = this.getUrlWithCollectionContext(productUrl);
      this.elements.links.forEach((el) => {
        el.href = urlWithCollection;
      });
    }

    if (productImage) {
      this.elements.image.src = productImage;
      this.elements.image.srcset = productImage;
    }

    if (productCompareAtPrice !== productPrice) {
      this.elements.priceSaleOriginal.innerHTML = productCompareAtPrice;
      this.elements.priceSale.innerHTML = productPrice;
    } else {
      if (productPrice) {
        this.elements.priceRegular.innerHTML = productPrice;
      }
    }

    if (this.elements.swatchName) {
      this.elements.swatchName.innerHTML = value;
    }

    this.classList.add('swatch-selected');

    /* [PLP video A/B test] show video when swatch color matches the clip */
    if (this.videoUrl) {
      this.userSelected = true;
      const wanted = (this.videoColor || '').trim().toLowerCase();
      if (wanted) {
        this.setMedia((value || '').trim().toLowerCase() === wanted ? this.videoUrl : null);
      } else {
        const entry = this.videoMap[handleFromUrl(productUrl)];
        this.setMedia(entry ? entry.u : null);
      }
    }
  }

  // isOpen() {
  //   return this.detailsContainer.hasAttribute('open');
  // }

  // onSummaryClick(event) {
  //   event.preventDefault();
  //   event.target.closest('details').hasAttribute('open') ? this.close() : this.open(event);
  // }

  // onBodyClick(event) {
  //   if (!this.contains(event.target) || event.target.classList.contains('modal-overlay')) this.close(false);
  // }

  // open(event) {
  //   this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
  //   event.target.closest('details').setAttribute('open', true);
  //   document.body.addEventListener('click', this.onBodyClickEvent);
  //   document.body.classList.add('overflow-hidden');
  //   this.header.classList.add('shopify-section-header-hidden');

  //   trapFocus(
  //     this.detailsContainer.querySelector('[tabindex="-1"]'),
  //     this.detailsContainer.querySelector('input:not([type="hidden"])')
  //   );
  // }

  // close(focusToggle = true) {
  //   removeTrapFocus(focusToggle ? this.summaryToggle : null);
  //   this.detailsContainer.removeAttribute('open');
  //   document.body.removeEventListener('click', this.onBodyClickEvent);
  //   document.body.classList.remove('overflow-hidden');
  // }

  /* [PLP video A/B test] card-level video setup */
  setupVideo() {
    const map = PLP_AB.map();
    if (!Object.keys(map).length) return;

    const swatchHandles = [...this.elements.swatches]
      .map((s) => handleFromUrl(s.dataset.productUrl))
      .filter(Boolean);
    const defaultLink = this.querySelector('.card__heading a, .card__information a.full-unstyled-link');
    const defaultHandle = handleFromUrl(defaultLink?.getAttribute('href'));

    let entry = null;
    for (const handle of [defaultHandle, ...swatchHandles]) {
      if (handle && map[handle]) {
        entry = map[handle];
        break;
      }
    }
    if (!entry) return;

    const media = this.querySelector('.card__media .media');
    if (!media) return;

    this.setAttribute('data-plp-ab-test', 'true');
    this.videoMap = map;
    this.videoUrl = entry.u;
    this.videoColor = entry.c || '';
    this.plpVisible = false;
    this.userSelected = false;

    const image = media.querySelector('img');
    const video = document.createElement('video');
    video.className = 'plp-ab-video motion-reduce';
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
    video.preload = 'auto';
    if (image) video.poster = image.currentSrc || image.getAttribute('src') || '';
    video.addEventListener('loadeddata', () => this.syncPlayback(PLP_AB.flagOn()));
    media.appendChild(video);
    this.video = video;

    PLP_AB.watchFlag();
    PLP_AB.watchViewport();
    PLP_AB.watchGrid();
    PLP_AB.io.observe(this);
  }

  setMedia(url) {
    if (!this.video) return;
    if (url) {
      this.videoSrc = url;
      this.classList.add('plp-ab-video-active');
      this.syncPlayback(PLP_AB.flagOn());
    } else {
      this.videoSrc = null;
      this.classList.remove('plp-ab-video-active');
      this.video.removeAttribute('src');
      this.video.pause();
    }
  }

  syncPlayback(flagOn) {
    if (!this.video) return;
    if (flagOn && this.classList.contains('plp-ab-video-active') && this.plpVisible && this.videoSrc) {
      if (this.video.getAttribute('src') !== this.videoSrc) this.video.src = this.videoSrc;
      this.video.play()?.catch(() => {});
    } else {
      this.video.pause();
    }
  }
}

customElements.define('product-card', ProductCard);
PLP_AB.reconcile();
