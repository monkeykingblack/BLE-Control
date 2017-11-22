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
  SectionList,
  TouchableHighlight
} from 'react-native';

export default class Home extends Component<{}> {

  constructor(props) {
    super(props)
    this.manager = this.props.screenProps.ble;
    this.state = {
      devices: new Array(),
      connectButton: 'Connect',
      pressed: false
    }
    this.scanAndConnect = this.scanAndConnect.bind(this)
  }

  componentWillMount() {
    if (Platform.OS === 'ios') {
      this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') this.scanAndConnect()
      })
    } else {
      this.scanAndConnect()
    }
  }

  scanAndConnect() {
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

      var { devices } = this.state;
      devices.push({
        name: [device.name != null ? device.name : "n/a"],
        id: device.id,
        uuid: device.serviceUUIDs,
        rssi: device.rssi 
      })

      console.log(device)
      this.setState({ devices })
    });
  }

  async connectToDevice(deviceID) {
    this.manager.stopDeviceScan()
    if( await this.manager.isDeviceConnected(deviceID) == true){
      Alert.alert('Device has been connected.',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false })
    } else  {
      await this.manager.connectToDevice(deviceID)
      this.setState({ pressed: true })
      this.props.navigation.navigate('Control', {deviceID: deviceID })
    }
  }

  keyExtractor = (item) => [item.name, item.id, item.rssi]

  _renderItem(item) {
    return (
      <View style={styles.listContainer}>
        <View style={styles.rssi}>
          <Text>{item.rssi}</Text>
        </View>
        <View style={{ flexDirection: 'column' }}>
          <Text>{item.name}</Text>
          <Text>{item.id}</Text>
        </View>
        <TouchableHighlight
          underlayColor='ivory'
          style={[styles.button, this.state.pressed && styles.buttonHandle]}
          onPress={this.connectToDevice.bind(this, item.id)}
          disabled={this.state.pressed}
        >
          <Text>{this.state.connectButton}</Text>
        </TouchableHighlight>
      </View>
    )
  }

  render() {
    // console.log(this.state.devices.localName)
    console.log(this.state.devices)
    return (
      // console.log(this.state.device)
      <View style={{ flex: 1 }}>
        <FlatList
          data={this.state.devices}
          extraData={this.state}
          keyExtractor={this.keyExtractor}
          renderItem={({ item }) => this._renderItem(item)}
        />
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
  rssi: {
    borderRadius: 60,
    backgroundColor: 'yellow',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  button: {
    borderRadius: 5,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: 47,
    borderWidth: 1,
    borderColor: '#FFFF00'
  },
  buttonHandle: {
    backgroundColor: 'orange'
  }
});
