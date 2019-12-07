import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';


export class Product {
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
      thisProduct.addPulse();

    });

  }

  addPulse() {
    let cartSelector = document.querySelector('.cart');
    cartSelector.classList.add('pulse');
    window.setTimeout(function(){cartSelector.classList.remove('pulse');}, 500, true);
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

    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);

  }
}
