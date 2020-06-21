import React, { Component } from 'react';
import './App.css';
import OAuthButton from './OAuthButton';
import { API, Auth, Hub } from 'aws-amplify';

class App extends Component {
  constructor(props) {
  	console.log('constructor');
    super(props);
    this.signOut = this.signOut.bind(this);
    // let the Hub module listen on Auth events
    Hub.listen('auth', (data) => {
        switch (data.payload.event) {
            case 'signIn':
            	API.get('testApiCall', '/hello').then(response => {
			      this.setState({responseMessage: response.message});
			    });
                this.setState({authState: 'signedIn', authData: data.payload.data});
                break;
            case 'signIn_failure':
                this.setState({authState: 'signIn', authData: null, authError: data.payload.data});
                break;
            default:
                break;
        }
    });
    this.state = {
      authState: 'loading',
      authData: null,
      authError: null,
      responseMessage: 'Calling API...'
    }
  }

  componentDidMount() {
    console.log('on component mount');
    // check the current user when the App component is loaded
    Auth.currentAuthenticatedUser().then(user => {
      console.log('signed in');
      console.log(user);
      API.get('testApiCall', '/hello').then(response => {
      	this.setState({responseMessage: response.message});
      });
      this.setState({authState: 'signedIn'});
    }).catch(e => {
      console.log(e);
      console.log('not signed in');
      this.setState({authState: 'signIn'});
    });
  }

  signOut() {
    Auth.signOut().then(() => {
      this.setState({authState: 'signIn'});
    }).catch(e => {
      console.log(e);
    });
  }

  render() {
  	console.log('render');
    const { authState } = this.state;
    return (
      <div className="App">
        {authState === 'loading' && (<div>loading...</div>)}
        {authState === 'signIn' && <OAuthButton/>}
        {authState === 'signedIn' && (<div><p>{this.state.responseMessage}</p><button onClick={this.signOut}>Sign out</button></div>)}
      </div>
    );
  }
}

export default App;
