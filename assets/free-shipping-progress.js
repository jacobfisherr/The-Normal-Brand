class FreeShippingProgress extends HTMLElement {
  constructor() {
    super();
    this.threshold = parseInt(this.dataset.freeShippingThreshold) || 15000;
    this.progressFill = this.querySelector('.progress-fill');
    this.progressTruck = this.querySelector('.progress-truck');
    this.messageText = this.querySelector('.free-shipping-text');
    
    this.init();
  }

  init() {
    // Subscribe to cart updates
    if (window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.cartUpdate) {
      document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));
    }
    
    // Initial update
    this.updateProgress();
  }

  handleCartUpdate(event) {
    // Update progress after a short delay to ensure cart data is updated
    setTimeout(() => {
      this.updateProgress();
    }, 100);
  }

  updateProgress() {
    // Get cart total from the page
    const cartTotalElement = document.querySelector('[data-cart-total]') || 
                            document.querySelector('.totals__total-value') ||
                            document.querySelector('.cart__total');
    
    if (!cartTotalElement) return;
    
    // Extract cart total (remove currency symbols and convert to cents)
    let cartTotalText = cartTotalElement.textContent || cartTotalElement.innerText;
    cartTotalText = cartTotalText.replace(/[^0-9.]/g, '');
    const cartTotal = Math.round(parseFloat(cartTotalText) * 100);
    
    if (isNaN(cartTotal)) return;
    
    // Calculate progress
    const progressPercentage = Math.min((cartTotal / this.threshold) * 100, 100);
    const remainingAmount = Math.max(this.threshold - cartTotal, 0);
    
    // Update progress bar
    if (this.progressFill) {
      this.progressFill.style.width = `${progressPercentage}%`;
      this.progressFill.dataset.progress = progressPercentage;
    }
    
    // Update truck position
    if (this.progressTruck) {
      this.progressTruck.style.left = `${progressPercentage}%`;
    }
    
    // Update message
    this.updateMessage(cartTotal, remainingAmount);
    
    // Add animation class for smooth transitions
    this.classList.add('progress-updated');
    setTimeout(() => {
      this.classList.remove('progress-updated');
    }, 600);
  }

  updateMessage(cartTotal, remainingAmount) {
    if (!this.messageText) return;
    
    const thresholdDollars = (this.threshold / 100).toFixed(0);
    
    if (remainingAmount > 0) {
      if (cartTotal > 0) {
        const remainingDollars = (remainingAmount / 100).toFixed(0);
        this.messageText.innerHTML = `
         HOORAY! YOU ARE JUST $${remainingDollars} AWAY FROM FREE SHIPPING
        `;
      } else {
        this.messageText.innerHTML = `
         ADD $${thresholdDollars} TO YOUR CART FOR FREE SHIPPING
        `;
      }
      
    } else {
      this.messageText.innerHTML = `
        Congratulations! You have unlocked free shipping
      `;
      
      this.classList.add('free-shipping-achieved');
    }
  }
}

// Register the custom element
customElements.define('free-shipping-progress', FreeShippingProgress);

// Fallback for older browsers
if (!customElements.get('free-shipping-progress')) {
  customElements.define('free-shipping-progress', FreeShippingProgress);
}
