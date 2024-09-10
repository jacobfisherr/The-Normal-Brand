document.addEventListener('DOMContentLoaded', () => {
  console.log($);

  $('body').on('click', '#size-chart-toggle', function () {
    var sizeChartModal = $('.size-chart-modal');
    var sizeChartModalDetails = sizeChartModal.find('details');

    sizeChartModalDetails.setAttribute('open', 'true');

    console.log(sizeChartModalDetails);

    requestAnimationFrame(function () {
      trapFocus(
        sizeChartModalDetails.find('[tabindex="-1"]').eq(0),
        sizeChartModalDetails.querySelector('[type="button"]').eq(0)
      );
    });
  });

  $('body').on('click', '.size-chart-modal__close-button', function () {
    var sizeChartModal = $('.size-chart-modal');
    var sizeChartModalDetails = sizeChartModal.find('details');

    sizeChartModalDetails.removeAttribute('open');
    removeTrapFocus(this);
  });

  $('body').on('click', function (event) {
    var sizeChartModal = $('.size-chart-modal');
    var sizeChartModalDetails = sizeChartModal.find('details');

    if (!sizeChartModalDetails.contains(event.currentTarget) || $(event.target).hasClass('modal-overlay')) {
      sizeChartModalDetails.removeAttribute('open');
      removeTrapFocus(false);
    }
  });
});

// class SizeChartModal extends HTMLElement {
//   constructor() {
//     super();
//     this.contentContainer = document.querySelector('size-chart-modal');
//     this.detailsContainer = this.contentContainer.querySelector('details');

//     this.addEventListener('click', this.onSummaryClick.bind(this));
//     this.detailsContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
//     this.detailsContainer.querySelector('button[type="button"]').addEventListener('click', this.close.bind(this));
//   }

//   onSummaryClick(event) {
//     event.preventDefault();
//     this.detailsContainer.hasAttribute('open') ? this.close() : this.open();
//     console.dir(this);
//   }

//   onBodyClick(event) {
//     if (!thisdetailsContainer.contains(event.target) || event.target.classList.contains('modal-overlay'))
//       this.close(false);
//   }

//   open() {
//     this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
//     this.detailsContainer.setAttribute('open', true);

//     document.body.classList.add('overflow-hidden');
//     document.body.addEventListener('click', this.onBodyClickEvent);

//     setTimeout(() => {
//       trapFocus(
//         this.detailsContainer.querySelector('[tabindex="-1"]'),
//         this.detailsContainer.querySelector('input:not([type="hidden"])')
//       );
//     }, 10);

//     setTimeout(() => {
//       document.body.classList.add('overflow-hidden');
//       document.body.addEventListener('click', this.onBodyClickEvent);

//       trapFocus(
//         this.detailsContainer.querySelector('[tabindex="-1"]'),
//         this.detailsContainer.querySelector('input:not([type="hidden"])')
//       );
//     }, 10);

//     requestAnimationFrame(function () {});
//   }

//   close(focusToggle = true) {
//     removeTrapFocus(focusToggle ? this : null);
//     this.detailsContainer.removeAttribute('open');
//     document.body.removeEventListener('click', this.onBodyClickEvent);
//     document.body.classList.remove('overflow-hidden');
//   }
// }

// customElements.define('size-chart-modal-toggle', SizeChartModal);
