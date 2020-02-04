/* 
  Inventory 
*/
import React from 'react';
import autobind from 'autobind-decorator';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

import AddFishForm from './AddFishForm';

// Initialize Firebase
const config = {
  apiKey: "AIzaSyBZAYW-05l5f7cenVtfX3wSctrtBmcD1ug",
  authDomain: "catch-of-the-day-1c276.firebaseapp.com",
  databaseURL: "https://catch-of-the-day-1c276.firebaseio.com"
};

firebase.initializeApp(config);

const auth = firebase.auth();

const ref = firebase.database().ref();

@autobind
class Inventory extends React.Component {

  constructor() {
    super();

    this.state = {
      uid: ''
    };

    auth.onAuthStateChanged(user => {
      if (user) {
        const userId = {
          user: {
            uid: user.uid
          }
        };

        this.authHandler(userId);
      } else {
        return null;
      }
    });
  }

  logOut() {
    auth.signOut();

    this.setState({
      uid: null
    });
  }
  
  authHandler(authData) {
    const storeRef = ref.child(this.props.params.storeId);

    storeRef.on('value', snapshot => {
      const data = snapshot.val() || {};

      // claim it as our own if there is no owner already
      if (!data.owner) {
        storeRef.update({
          owner: authData.user.uid
        });
      }

      // update our local state to reflect the current store owner and user
      this.setState({
        uid: authData.user.uid,
        owner: data.owner || authData.user.uid
      });
    });
  }

  signInWithPopup(provider) {
    auth.signInWithPopup(provider)
        .then(authData => this.authHandler(authData))
        .catch(error => {
          // An error occurred
          // do something here
        });
  }

  authenticate(provider) {
    if (provider === 'twitter') {
      provider = new firebase.auth.TwitterAuthProvider();

      this.signInWithPopup(provider);
    }
    
    if (provider === 'facebook') {
      provider = new firebase.auth.FacebookAuthProvider();

      this.signInWithPopup(provider);
    } 
    if (provider === 'github') {
      provider = new firebase.auth.GithubAuthProvider();

      this.signInWithPopup(provider);
    }
  }

  renderLogin() {
    return (
      <nav className="login">
        <h2>Inventory</h2>
        <p>Sign in to manage your store's Inventory</p>
        <button className="github" onClick={this.authenticate.bind(this, 'github')}>Log In with Github</button>
        <button className="facebook" onClick={this.authenticate.bind(this, 'facebook')}>Log In with Facebook</button>
        <button className="twitter" onClick={this.authenticate.bind(this, 'twitter')}>Log In with Twitter</button>
      </nav>
    );
  }

  renderInventory(key) {
    const linkState = this.props.linkState;
    
    return (
      <div className="fish-edit" key={key}>
        <input type="text" valueLink={linkState('fishes.' + key + '.name')} />
        <input type="text" valueLink={linkState('fishes.' + key + '.price')} />
        <select valueLink={linkState('fishes.' + key + '.status')}>
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea type="text" valueLink={linkState('fishes.' + key + '.desc')} />
        <input type="text" valueLink={linkState('fishes.' + key + '.image')} />
        <button type="submit" onClick={this.props.removeFish.bind(null, key)}>Remove Fish</button>
      </div>
    );
  }

  render() {
    let logoutButton = <button onClick={this.logOut}>Log Out!</button>

    // first check if user isn't logged in
    if (!this.state.uid) {
      return (
        <div>{this.renderLogin()}</div>
      );
    }

    // then check if they aren't the owner of the current store
    if (this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Sorry, you aren't the owner of this store</p>
          {logoutButton}
        </div>
      );
    }

    return (
      <div>
        <h2>Inventory</h2>
        {logoutButton}

        <AddFishForm {...this.props} />

        <button onClick={this.props.loadSamples}>Load Sample Fishes</button>

        <div><h6></h6></div>

        {Object.keys(this.props.fishes).map(this.renderInventory)}
      </div>
    );
  }
}

Inventory.propTypes = {
  addFish: React.PropTypes.func.isRequired,
  loadSamples: React.PropTypes.func.isRequired,
  fishes: React.PropTypes.object.isRequired,
  linkState: React.PropTypes.func.isRequired,
  removeFish: React.PropTypes.func.isRequired
};

export default Inventory;
