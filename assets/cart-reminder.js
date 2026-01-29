class CartReminder extends HTMLElement {
  constructor() {
    super();
    this.isActive = false;
  }

  connectedCallback() {
    // Create the reminder content dynamically
    const cartUrl = this.dataset.cartUrl || '/cart';

    this.innerHTML = `
      <div class="cart-reminder">
        <p class="cart-reminder__message">You have items in your cart!</p>
        <button class="cart-reminder__cta" data-cart-url="${cartUrl}">View Cart</button>
      </div>
    `;

    this.reminder = this.querySelector('.cart-reminder');

    if (!this.reminder) return;

    // Set up the CTA button click handler
    this.ctaButton = this.querySelector('.cart-reminder__cta');
    if (this.ctaButton) {
      this.ctaButton.addEventListener('click', this.handleCtaClick.bind(this));
    }

    this.initReminder();
  }

  initReminder() {
    this.hasShown = sessionStorage.getItem('cartReminderShown');

    // Only show if cart has items and reminder hasn't been shown this session
    if (!this.hasShown && this.dataset.cartCount > 0) {
      this.init();
    }

    if (this.dataset.cartCount > 0) {
      window.dispatchEvent(
        new CustomEvent('cart-has-items', {
          detail: {
            hasItems: true,
          },
        })
      );
    }
  }

  init() {
    setTimeout(() => {
      this.show();
    }, 200);

    // Close on any click outside the reminder and mysterybox popup
    document.addEventListener('click', this.handleDocumentClick.bind(this));

    // Close on escape key
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  show() {
    this.reminder.classList.add('active');
    this.isActive = true;
  }

  hide() {
    this.reminder.classList.remove('active');
    this.isActive = false;
    sessionStorage.setItem('cartReminderShown', 'true');
  }

  handleDocumentClick(event) {
    if (!this.isActive) {
      return;
    }

    // Don't close if clicking the reminder itself
    if (this.contains(event.target)) {
      return;
    }

    // Don't close if clicking inside the mysterybox popup
    if (event.target.closest('#alia-root-103968') || event.target.querySelector('[d="M0 0h24v24H0z"]')) {
      return;
    }

    // Close on any other click
    this.hide();
  }

  handleEscapeKey(event) {
    if (event.key === 'Escape' && this.isActive) {
      this.hide();
    }
  }

  handleCtaClick(event) {
    event.preventDefault();
    event.stopPropagation();

    // Try to open cart drawer if it exists
    const cartDrawer = document.querySelector('cart-drawer');

    if (cartDrawer && typeof cartDrawer.open === 'function') {
      cartDrawer.open(this.ctaButton);
      this.hide();
    } else {
      const cartUrl = this.ctaButton.dataset.cartUrl || '/cart';
      window.location.href = cartUrl;
    }
  }
}

customElements.define('cart-reminder', CartReminder);
