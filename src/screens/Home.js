/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Alert,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  Button
} from 'react-native';
import search from '../images/search2.png';
import loading from '../images/loading.gif'

export default class Home extends Component<{}> {

  constructor(props) {
    super(props)
    this.manager = this.props.screenProps.ble;
    this.state = {
      devices: new Array(),
      connectButton: 'Connect',
      pressed: false,
      scanning: true,
    }
    this.scan = this.scan.bind(this)
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') this.scan()
      })
    } else {
      this.scan()
    }
  }

  scan() {
    if (this.state.scanning) {
      var { devices } = this.state
      devices = new Array()
      this.setState({ devices })
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          Alert.alert('Bluetooth has been disabled.', 'Use have to turn on Bluetooth.',
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false })
          return
        }
        if (device.name != null) {
          devices.push({
            name: [device.name != null ? device.name : "n/a"],
            id: device.id,
            uuid: device.serviceUUIDs,
            rssi: device.rssi
          })
        }
        console.log(device)
        this.setState({ devices })
      });
    } else this.manager.stopDeviceScan();
    this.setState({ scanning: !this.state.scanning })
  }

  async connectToDevice(deviceID) {
    this.manager.stopDeviceScan()
    this.setState({ scanning: true, pressed: true })
    await this.manager.connectToDevice(deviceID)
    this.props.navigation.navigate('Control', { deviceID: deviceID })
  }

  keyExtractor = (item) => [item.name, item.id, item.rssi]

  _renderItem(item) {
    return (

      <View style={styles.listContainer}>
        <View style={styles.rssi}>
          <Text style={{ color: '#ffffff' }}>{item.rssi}</Text>
        </View>
        <View style={{ flexDirection: 'column' }}>
          <Text>{item.name}</Text>
          <Text>{item.id}</Text>
        </View>
        <TouchableHighlight
          underlayColor='ivory'
          style={[styles.button]}
          onPress={this.connectToDevice.bind(this, item.id)}
          disabled={this.state.pressed}
        >
          <Text style={{ color: '#ffffff' }}>{this.manager.isDeviceConnected(item.id) ? 'Connect' : 'Connected'}</Text>
        </TouchableHighlight>
      </View>
      // </View>
    )
  }

  render() {
    // console.log(this.state.devices.localName)
    console.log(this.state.devices)
    return (
      // console.log(this.state.device)
      <View>
        <View style={styles.headerContainer}>
          <View style={{ marginLeft: 10, width: 80, height: 60 }}>
            <Image source={require('../images/logo.png')} style={{ flex: 1, width: null, height: null, resizeMode: 'contain' }} />
          </View>
          <View>
            <Text style={{ fontSize: 20, color: '#ffffff', marginRight: 10 }}> BLE Control</Text>
          </View>
          <View>
            <TouchableOpacity onPress={() => this.scan()}>
              <View style={{ width: 50, height: 50, marginRight: 10 }}>
                <Image source={this.state.scanning ? search : loading}
                  style={{ flex: 1, width: null, height: null, resizeMode: 'contain', marginRight: 10 }}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <FlatList
            data={this.state.devices}
            extraData={this.state}
            keyExtractor={this.keyExtractor}
            renderItem={({ item }) => this._renderItem(item)}
          />
        </View>
      </View>
    );
  }

  componentWillUnMount() {
    this.manager.destroy()
    delete this.manager
  }
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 5,
    borderBottomWidth: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00729b',
    borderWidth: 0.5,
  },
  rssi: {
    borderRadius: 60,
    backgroundColor: '#00729b',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  button: {
    borderRadius: 5,
    backgroundColor: '#00729b',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 47,
  },
});
