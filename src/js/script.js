/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      // console.log('new Product: ', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }
    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion() {
      const thisProduct = this;
      // console.log('Link was clicked!' + thisProduct);
      /* find the clickable trigger (the element that should react to clicking) */
      const clickedElement = thisProduct.accordionTrigger;
      // console.log('clickedElement/ this.element', clickedElement);
      /* START: click event listener to trigger */
      clickedElement.addEventListener('click' , function(event) {
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle(classNames.menuProduct.imageVisible);
        /* find all active products */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        // console.log('activeProducts: ', activeProducts);
        /* START LOOP: for each active product */
        for(let activeProduct of activeProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if(activeProduct !== thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove(classNames.menuProduct.imageVisible);
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }
    initOrderForm() {
      const thisProduct = this; // eslint-disable-line no-unused-vars
      // console.log('initOrderForm');
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      // console.log('processOrder');
      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      // console.log('___________________PRODUCT____', thisProduct);
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData: ', formData);
      thisProduct.params = {};
      /* set variable price to equal thisProduct.data.price */
      let price = thisProduct.data.price;
      // console.log('price: ', price );
      /* START LOOP: for each paramId in thisProduct.data.params */
      for (let paramId in thisProduct.data.params) {
        // console.log('paramId: ', paramId );
        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        // console.log('param: ', param);
        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options) {
          // console.log('optionId: ', optionId );
          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];
          // console.log('Option: ', option );
          /* START IF: if option is selected and option is not default */
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          // console.log('optionSelected: ', optionSelected );
          if (optionSelected && !option.default) {
            /* add price of option to variable price */
            price += option.price;
            /* END IF: if option is selected and option is not default */
          }
          /* START ELSE IF: if option is not selected and option is default */
          else if (!optionSelected && option.default) {
            /* deduct price of option from price */
            price -= option.price;
            /* END ELSE IF: if option is not selected and option is default */
          }
          /* END LOOP: for each optionId in param.options */
          const imageWrapper = thisProduct.imageWrapper;

          // console.log('paramId: ', paramId);
          // console.log('optionId: ', optionId);
          for(let image of imageWrapper.children) {
            if (image.classList.contains(paramId + '-' + optionId)) {
              if (optionSelected) {
                if(!thisProduct.params[paramId]) {
                  thisProduct.params[paramId] = {
                    label: param.label,
                    options: {},
                  };
                }
                thisProduct.params[paramId].options[optionId] = option.label;
                // console.log('thisProduct.params: ', thisProduct.params);
                image.classList.add(classNames.menuProduct.imageVisible);
              }
              else {
                image.classList.remove(classNames.menuProduct.imageVisible);
              }
            }
          }
        }
      }
      /* multiply price by amount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;
      // console.log('final price: ', price);
    }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    addToCart() {
      const thisProduct = this;

      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      // console.log('thisProduct-add to Cart: ', thisProduct);
      app.cart.add(thisProduct);

    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions(thisWidget.input.value);

      // console.log('amountWidget: ', thisWidget);
      // console.log('construktor arguments: ', element);

    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      //TODO: Add validation

      if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;

      // console.log('thisWidget.input.value: ', thisWidget.input.value);
    }
    initActions() {
      const thisWidget = this;
      // console.log('initOrderForm');
      thisWidget.input.addEventListener('change', function(){
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });

    }
    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.products = [];
      // console.log('thisCart.products', thisCart.products);


      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }
    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }

    }
    initActions() {
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click' , function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(){
        event.preventDefault();
        thisCart.sendOrder();
        thisCart.resetForm();
      });
    }
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;
      console.log('adress', thisCart.dom.address);
      const payload = {

        products: [],
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        totalNumber: thisCart.totalNumber,
        subtotalPrice: thisCart.subtotalPrice,
        deliveryFee: 20,
      };
      console.log('thisCart product: ', thisCart.products);
      for(let product of thisCart.products) {
        console.log('product: ', product);
        payload.products.push(product.getData());
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(response) {
          return response.json();
        })
        .then(function(parsedResponse) {
          console.log('parsedResponse:', parsedResponse);
        });
    }

    resetForm () {
      console.log('PRODUCTSSSSSSSSSSSSSSSSSS', this.products);
      const thisCart = this;
      thisCart.dom.phone.value = '';
      thisCart.dom.address.value = '';

      for(let product of thisCart.products) {
        product.dom.wrapper.remove();
      }

      thisCart.products = [];
      thisCart.update();

      for(let key of thisCart.renderTotalsKeys) {
        for(let elem of thisCart.dom[key]) {
          elem.innerHTML = 0;
        }
      }


    }



    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);
      console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      thisCart.update();
    }
    update() {
      const thisCart = this;

      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(let product of thisCart.products) {
        thisCart.subtotalPrice += product.price;
        // console.log('subtotal Price: ', thisCart.subtotalPrice);
        // console.log('product Price: ', product.price);

        thisCart.totalNumber += product.amount;
        // console.log('total Num: ', thisCart.totalNumber);
      }
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
      // console.log('total price: ', thisCart.totalPrice);

      for(let key of thisCart.renderTotalsKeys) {
        for(let elem of thisCart.dom[key]) {
          elem.innerHTML = thisCart[key];
        }
      }
    }
    remove(cartProduct) {
      console.log('cartProduct111', cartProduct);
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct);
      thisCart.products= thisCart.products.splice(index, 1);
      // thisCart.products.splice(index, 1);
      cartProduct.dom.wrapper.remove();
      thisCart.update();
      console.log('cartProduct222', cartProduct);
    }

  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));


      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget ();
      thisCartProduct.initActions();

      console.log('new Cart Product: ', thisCartProduct);
    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }
    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });

    }
    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent ('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        }
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);

    }
    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
        console.log('remove: ', thisCartProduct.remove);
      });
    }
    getData() {
      const thisCartProduct = this;
      const data = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params,
      };
      return data;
    }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;
      // console.log('thisApp.data: ', thisApp.data);
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
          console.log('parsedResponse:', parsedResponse);

          /* save parsedResponse as thisApp.data.products*/
          thisApp.data.products = parsedResponse;
          /* execute initMenu method */
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function() {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function() {
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },
  };

  app.init();
}
