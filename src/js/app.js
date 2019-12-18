import {settings, select, classNames} from './settings.js';
import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {Booking} from './components/Booking.js';

const app = {
  initPages: function() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.titleLinks = document.querySelectorAll(select.title.links);
    thisApp.main = document.querySelector(select.main.link);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id; // eslint-disable-line no-unused-vars

    for(let page of thisApp.pages){
      if(page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for(let link of thisApp.navLinks) {
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');
        /* run thisApp.activatePage with that id*/
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }

    thisApp.main.addEventListener('click', function(){
      const clickedElement = this;

      const id = clickedElement.getAttribute('href').replace('#', '');
      thisApp.activatePage(id);
      window.location.hash = '#/' + id;
    });

  },

  activatePage: function(pageId) {
    const thisApp = this;
    /* add class "active" to matching pages, remove from non-matching*/
    for(let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /* add class "active" to matching links, remove from non-matching*/
    for(let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }

  },

  initBooking: function() {
    const thisApp = this;
    const bookingWidgetContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingWidgetContainer);

  },

  hoverEffect: function() {
    const css = '.box-1:hover h1{ margin: 0 }';
    const style = document.createElement('style');

    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

document.getElementsByTagName('section')[0].appendChild(style);

  },

  initSlider: function() {
    let slideIndex = 0;

    const showSlides = function() {

      const slides = document.querySelectorAll('.slides');
      const dots = document.querySelectorAll('.dot');

      for(let i=0; i<slides.length; i++) {
        slides[i].style.display = 'none';
      }

      for(let i=0; i<dots.length; i++) {
        dots[i].className = dots[i].className.replace('active', '');
      }

      slideIndex++;
      if (slideIndex > slides.length) {slideIndex = 1};
      slides[slideIndex-1].style.display = 'block';
      dots[slideIndex-1].className += ' active';
      setTimeout(showSlides, 3000);

    };

    showSlides();
 },


  initMenu: function() {
    const thisApp = this;
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function() {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        // console.log('parsedResponse:', parsedResponse);
        /* save parsedResponse as thisApp.data.products*/
        thisApp.data.products = parsedResponse;
        /* execute initMenu method */
        thisApp.initMenu();
      });
    // console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function() {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  init: function() {
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.hoverEffect();
    thisApp.initSlider();
    // thisApp.initMain();

  },
};

app.init();
