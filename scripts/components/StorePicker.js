/* 
  StorePicker
  This will let us make <StorePicker/>
*/
import React from 'react';
import { History } from 'react-router';
import reactMixin from 'react-mixin';

import autobind from 'autobind-decorator';

import helperFuncs from '../helpers';

@autobind
class StorePicker extends React.Component {

  goToStore(event) {
    event.preventDefault();
    
    // get the data from the input
    var storeId = this.refs.storeId.value;
    this.history.pushState(null,'/store/' + storeId);
  }

  render() {
    return (
      <form className="store-selector" onSubmit={this.goToStore}>
        <h2>Please Enter A Store</h2>
        <input type="text" ref="storeId" required defaultValue={helperFuncs.getFunName()} />
        <input type="submit" />
      </form>
    );
  }
}

reactMixin.onClass(StorePicker, History);

export default StorePicker;
