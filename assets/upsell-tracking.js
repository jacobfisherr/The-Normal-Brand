/**
 * Upsell Tracking for convert
 */

class UpsellTracker {
  constructor() {
    this.trackingParam = 'upsell_source';
    this.trackingValue = 'cart_drawer';
    this.init();
  }

  init() {
    this.checkForUpsellSource();
    this.setupFormMonitoring();
  }

  checkForUpsellSource() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const upsellSource = urlParams.get(this.trackingParam);
      
      if (upsellSource === this.trackingValue) {
        console.log('User landed on product page from cart drawer recommendation');
        
        document.body.setAttribute('data-upsell-source', 'true');
        
        this.cleanupTrackingUrl();
      }
    } catch (error) {
      console.warn('Failed to check for upsell source:', error);
    }
  }

  cleanupTrackingUrl() {
    try {
      const url = new URL(window.location);
      const searchParams = url.searchParams;
      
      searchParams.delete(this.trackingParam);
      
      if (searchParams.toString()) {
        url.search = '?' + searchParams.toString();
      } else {
        url.search = '';
      }
      
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, url.toString());
      }
    } catch (error) {
      console.warn('Failed to cleanup tracking URL:', error);
    }
  }

  setupFormMonitoring() {
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (this.isAddToCartForm(form)) {
        this.handleAddToCartForm(form);
      }
    });

    document.addEventListener('click', (event) => {
      const button = event.target.closest('button[type="submit"], input[type="submit"]');
      if (button && this.isAddToCartButton(button)) {
        const form = button.closest('form');
        if (form) {
          this.handleAddToCartForm(form);
        }
      }
    });
  }

  isAddToCartForm(form) {
    return form.action && (
      form.action.includes('/cart/add') ||
      form.action.includes('/cart') ||
      form.querySelector('input[name="add"]') ||
      form.querySelector('button[name="add"]')
    );
  }

  isAddToCartButton(button) {
    return button.name === 'add' || 
           button.textContent.toLowerCase().includes('add to cart') ||
           button.getAttribute('aria-label')?.toLowerCase().includes('add to cart');
  }

  handleAddToCartForm(form) {
    try {
      const hasUpsellSource = document.body.getAttribute('data-upsell-source') === 'true';
      
      if (hasUpsellSource) {
        const currentUrl = window.location.href;
        const productHandle = this.extractHandleFromUrl(currentUrl);
        
        if (productHandle) {
          window._conv_q = window._conv_q || [];  
          _conv_q.push(["triggerConversion", "1004105457"]); //Added cart upsell to cart
          document.body.removeAttribute('data-upsell-source');
        }
      }
    } catch (error) {
      console.warn('Failed to handle add to cart form:', error);
    }
  }

  extractHandleFromUrl(url) {
    try {
      const match = url.match(/\/products\/([^\/\?#]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.upsellTracker = new UpsellTracker();
});

window.UpsellTracker = UpsellTracker;
