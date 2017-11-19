/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { View, AppState } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { HomeStack } from './src/Router';

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      ble: null,
      appState: AppState.currentState
    }
  }
  componentWillMount() {
    console.log('up')
    this.setState({
      ble: new BleManager()
    })
  }
  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnMount() {
    console.log('die')
    AppState.removeEventListener('change', this._handleAppStateChange)
    this.state.ble.destroy()
    delete this.state.ble
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    console.log(nextAppState)
    this.setState({ appState: nextAppState });
  }

  render() {
    return (
      <HomeStack screenProps={{ ble: this.state.ble }} />
    )
  }
}