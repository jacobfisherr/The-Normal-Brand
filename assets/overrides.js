var TNB = {
  state: {
    tallSizingActive: false,
  },
  sliderArrows: function () {
    const handleClickNext = function (e) {
      const parent = $(e.currentTarget).closest('.collection');
      const slider = parent.find('slider-component > ul');
      const items = slider.find('li');

      const scrollLeft = slider.get(0).scrollLeft;
      const itemWidth = items.get(0).scrollWidth;

      slider.get(0).scrollTo({
        left: scrollLeft + itemWidth,
        behavior: 'smooth',
      });

      parent.find('.slider-button--prev').removeAttr('disabled');

      if (scrollLeft + itemWidth >= slider.get(0).scrollWidth - slider.get(0).clientWidth) {
        parent.find('.slider-button--next').attr('disabled', '');
      }
    };

    const handleClickPrev = function (e) {
      const parent = $(e.currentTarget).closest('.collection');
      const slider = parent.find('slider-component > ul');
      const items = slider.find('li');

      const scrollLeft = slider.get(0).scrollLeft;
      const itemWidth = items.get(0).scrollWidth;

      slider.get(0).scrollTo({
        left: scrollLeft - itemWidth,
        behavior: 'smooth',
      });

      parent.find('.slider-button--next').removeAttr('disabled');

      if (scrollLeft - itemWidth * 2 <= 0) {
        parent.find('.slider-button--prev').attr('disabled', '');
      }
    };

    $('body').on('click', '.collection__arrows .slider-button--prev', handleClickPrev);
    $('body').on('click', '.collection__arrows .slider-button--next', handleClickNext);
  },
  megaMenuHover: function () {
    const inlineMenu = document.querySelector('.header__inline-menu');
    if (!inlineMenu) return;

    const detailsItems = inlineMenu.querySelectorAll('details');

    detailsItems.forEach((item) => {
      const summary = item.querySelector('summary');
      const ulElement = item.querySelector('ul');

      const openMenu = () => {
        item.setAttribute('open', true);
        if (summary) {
          summary.setAttribute('aria-expanded', 'true');
        }
      };

      const closeMenu = () => {
        item.removeAttribute('open');
        if (summary) {
          summary.setAttribute('aria-expanded', 'false');
        }
      };

      item.addEventListener('mouseenter', openMenu);
      item.addEventListener('mouseleave', closeMenu);
      if (ulElement) {
        ulElement.addEventListener('mouseleave', closeMenu);
      }
    });
  },
  tallSizingControls: function () {
    function handleClickControl(controls, tall) {
      var regularOptions = controls.parentNode.querySelectorAll('label:not([data-tall-size])');
      var tallOptions = controls.parentNode.querySelectorAll('label[data-tall-size]');
      var buttonRegular = controls.querySelector('[data-button-regular]');
      var buttonTall = controls.querySelector('[data-button-tall]');

      regularOptions.forEach(function (el) {
        el.classList.add('hide');
      });
      tallOptions.forEach(function (el) {
        el.classList.add('hide');
      });

      buttonRegular.classList.add('inactive');
      buttonTall.classList.add('inactive');
      TNB.state.tallSizingActive = false;

      if (tall) {
        tallOptions.forEach(function (el) {
          el.classList.remove('hide');
        });

        buttonTall.classList.remove('inactive');

        TNB.state.tallSizingActive = true;
      } else {
        regularOptions.forEach(function (el) {
          el.classList.remove('hide');
        });

        buttonRegular.classList.remove('inactive');
      }
    }

    $('body').on('click', '.tall-sizing-controls [data-button-regular]', function (e) {
      const target = $(e.currentTarget);
      const controls = target.closest('.tall-sizing-controls').get(0);
      handleClickControl(controls, false);
    });

    $('body').on('click', '.tall-sizing-controls [data-button-tall]', function (e) {
      const target = $(e.currentTarget);
      const controls = target.closest('.tall-sizing-controls').get(0);
      handleClickControl(controls, true);
    });
  },
  refreshTallSizingControls: function () {
    if (TNB.state.tallSizingActive) {
      $('[data-button-tall]').click();
    }
  },
};

function init() {
  subscribe(PUB_SUB_EVENTS.optionValueSelectionChange, function (e) {
    TNB.refreshTallSizingControls();
  });

  TNB.tallSizingControls();
  TNB.megaMenuHover();
  TNB.sliderArrows();

  const productCount = document.querySelector('#ProductCount');
  const productCountDesktop = document.querySelector('#ProductCountDesktop');
  const outOfStockProducts = document.querySelectorAll('.product-grid [data-in-stock="false"]');

  if (productCount) {
    const count = productCount.innerText;
    const parsedCount = parseInt(count);

    productCount.innerText = parsedCount - outOfStockProducts.length + ' products';
    productCount.style.display = 'block';
  }

  if (productCountDesktop) {
    const count = productCountDesktop.innerText;
    const parsedCount = parseInt(count);

    productCountDesktop.innerText = parsedCount - outOfStockProducts.length + ' products';
    productCountDesktop.style.display = 'block';
  }

  const headerMenuItems = document.querySelectorAll('summary.header__menu-item');
  const handleMenuItemClick = (e) => {
    console.log('click', e);
  }

  headerMenuItems.forEach((menuItem) => {
    menuItem.addEventListener('click', handleMenuItemClick);
  });
}

window.addEventListener('DOMContentLoaded', function () {
  init();
});
