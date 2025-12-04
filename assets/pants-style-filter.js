/**
 * Pants Style Filter - Uses theme's facet system
 */

if (!customElements.get('pants-style-filter')) {
  class PantsStyleFilter extends HTMLElement {
    constructor() {
      super();
      this.init();
      this.initCustomScrollbar();
    }

    init() {
      const buttons = this.querySelectorAll('.pants-style-card__button');

      buttons.forEach((button) => {
        button.addEventListener('click', this.handleFilterClick.bind(this));
      });
    }

    handleFilterClick(event) {
      event.preventDefault();

      const button = event.currentTarget;
      const filterParam = button.dataset.filter;

      if (!filterParam) {
        console.warn('No filter parameter found on button');
        return;
      }

      // Get current URL params
      const currentUrl = new URL(window.location.href);
      const searchParams = new URLSearchParams(currentUrl.search);

      // Parse and add the filter parameter
      const [filterKey, filterValue] = filterParam.split('=');
      if (filterKey && filterValue) {
        // Decode the value first (+ signs represent spaces in URL encoding)
        const decodedValue = decodeURIComponent(filterValue.replace(/\+/g, ' '));
        searchParams.set(filterKey, decodedValue);
      }

      // Use theme's filter system if available
      if (typeof FacetFiltersForm !== 'undefined' && FacetFiltersForm.renderPage) {
        FacetFiltersForm.renderPage(searchParams.toString(), event);
      } else {
        // Fallback to regular navigation
        window.location.href = `${currentUrl.pathname}?${searchParams.toString()}`;
      }
    }

    initCustomScrollbar() {
      const slider = this.querySelector('.pants-style-filter-list');
      const scrollbar = this.querySelector('.pants-style-scrollbar');
      const thumb = this.querySelector('.pants-style-scrollbar__thumb');
      const track = this.querySelector('.pants-style-scrollbar__track');

      if (!slider || !scrollbar || !thumb || !track) return;

      // Update scrollbar on slider scroll
      const updateScrollbar = () => {
        const scrollPercentage = slider.scrollLeft / (slider.scrollWidth - slider.clientWidth);
        const thumbWidth = (slider.clientWidth / slider.scrollWidth) * 100;
        const thumbPosition = scrollPercentage * (100 - thumbWidth);

        thumb.style.width = `${thumbWidth}%`;
        thumb.style.left = `${thumbPosition}%`;
      };

      // Initial update
      updateScrollbar();

      // Update on scroll
      slider.addEventListener('scroll', updateScrollbar);

      // Update on window resize
      window.addEventListener('resize', updateScrollbar);

      // Make thumb draggable
      let isDragging = false;
      let startX = 0;
      let startScrollLeft = 0;

      thumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startScrollLeft = slider.scrollLeft;
        thumb.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const deltaX = e.clientX - startX;
        const scrollRatio = slider.scrollWidth / track.offsetWidth;
        slider.scrollLeft = startScrollLeft + deltaX * scrollRatio;
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
        thumb.style.cursor = 'pointer';
      });

      // Click on track to jump
      track.addEventListener('click', (e) => {
        if (e.target === thumb) return;

        const trackRect = track.getBoundingClientRect();
        const clickPosition = (e.clientX - trackRect.left) / trackRect.width;
        slider.scrollLeft = clickPosition * (slider.scrollWidth - slider.clientWidth);
      });

      // Touch support for mobile
      let touchStartX = 0;
      let touchStartScrollLeft = 0;

      thumb.addEventListener('touchstart', (e) => {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartScrollLeft = slider.scrollLeft;
      });

      document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const deltaX = e.touches[0].clientX - touchStartX;
        const scrollRatio = slider.scrollWidth / track.offsetWidth;
        slider.scrollLeft = touchStartScrollLeft + deltaX * scrollRatio;
      });

      document.addEventListener('touchend', () => {
        isDragging = false;
      });
    }
  }

  customElements.define('pants-style-filter', PantsStyleFilter);
}
