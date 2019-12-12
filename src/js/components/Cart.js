import {settings, select, classNames, templates} from '../settings.js';
import {CartProduct} from './CartProduct.js';
import {utils} from '../utils.js';

export class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.products = [];
    // console.log('thisCart.products', thisCart.products);

    thisCart.getElements(element);
    thisCart.initActions();

    // console.log('new Cart', thisCart);
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

    });
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    // console.log('adress', thisCart.dom.address);
    const payload = {

      'products': [],
      'address': thisCart.dom.address.value,
      'phone': thisCart.dom.phone.value,
      'totalPrice': thisCart.totalPrice,
      'totalNumber': thisCart.totalNumber,
      'subtotalPrice': thisCart.subtotalPrice,
      'deliveryFee': 20,
    };

    const totNum = payload['totalNumber'];
    console.log('totNum', totNum);

    if(thisCart.dom.address.value != '' && thisCart.dom.phone.value != '' && totNum != 0 && totNum != undefined) {
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

      thisCart.resetForm();
    } else {
      console.log('EMPTY FORM!');
    }

  }

  resetForm () {
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
    // thisCart.products= thisCart.products.splice(index, 1);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
    console.log('cartProduct222', cartProduct);
  }

}

export default Cart;
