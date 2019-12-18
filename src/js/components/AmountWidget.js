import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

export class AmountWidget extends BaseWidget{
  constructor(element, isHourWidget) {
    super(element, settings.amountWidget.defaultValue);
    console.log(isHourWidget);
    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.initActions();

    thisWidget.renderValue();

  }

  getElements() {
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    thisWidget.dom.isHourWidget = thisWidget.dom.wrapper.querySelector(select.widgets.amount.inputHours);

  }

  isValid(value) {
    const thisWidget = this;
    const AvailableTime = 5;

    if(thisWidget.dom.isHourWidget) {
      return value>=0.5 && value<= AvailableTime;
    } else {

      return !isNaN(value)
      && value>=settings.amountWidget.defaultMin
      && value<=settings.amountWidget.defaultMax;
    }
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      event.preventDefault();
      thisWidget.value = thisWidget.dom.input.value;
      thisWidget.dom.forbidden.innerHTML = '';
    });


    thisWidget.dom.linkDecrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value-=1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value = thisWidget.value + 1);
    });

  }



}
