import React, { Component } from 'react';
import { View, Text, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import switch_off from '../images/switch_off.png';
import switch_on from '../images/switch_on.png';
import light_on from '../images/light_on.png';
import light_off from '../images/light_off.png';

export default class Control extends Component {

  constructor(props) {
    super(props)
    this.state = {
      statusDevice: 'ON',
      pressed: false,
      servicesMap: {},
      characteristicsMap: {}
    }
    this._onPress = this._onPress.bind(this)
    this.manager = this.props.screenProps.ble
    this.getCharacteristic = this.getCharacteristic.bind(this)
  }

  componentWillMount() {
    var { deviceID } = this.props.navigation.state.params
    this.manager.setLogLevel('Verbose')
    this.manager.discoverAllServicesAndCharacteristicsForDevice(deviceID)
      .then((device) => {
        return this.getCharacteristic(device)
      })
    console.log(deviceID)
  }

  async getCharacteristic(device) {
    var services = await device.services()
    var { servicesMap } = this.state
    for (let service of services) {
      var { characteristicsMap } = this.state
      var characteristics = await service.characteristics()

      for (let characteristic of characteristics) {
        characteristicsMap[characteristic.uuid] = {
          uuid: characteristic.uuid,
          isReadable: characteristic.isReadable,
          isWritable: characteristic.isWritableWithResponse,
          isNotifiable: characteristic.isNotifiable,
          isNotifying: characteristic.isNotifying,
          value: characteristic.value
        }
      }
      servicesMap[service.uuid] = {
        uuid: service.uuid,
        isPrimary: service.isPrimary,
        characteristicsCount: characteristics.length,
        characteristics: characteristicsMap
      }
    }
    console.log(servicesMap)
    console.log(characteristicsMap)
  }

  async _onPress() {
    var { deviceID } = this.props.navigation.state.params
    var { servicesMap, characteristicsMap } = this.state
    for (var i in characteristicsMap){
      if(characteristicsMap[i].isWritable === true){
        var uuid = characteristicsMap[i].uuid
      }
    }
    console.log(uuid)
    await this.manager.writeCharacteristicWithoutResponseForDevice(deviceID, "000000ff-0000-1000-8000-00805f9b34fb", '00000000-0000-1000-8000-00805f9b34fb', this.state.pressed ? 'AA==':'AQ==')
    console.log(this.state.pressed ? 'AA==':'AQ==')
    if (this.refs.myRef) {
      await this.setState({ pressed: !this.state.pressed, statusDevice: this.state.pressed ? 'ON' : 'OFF' })
      console.log(this.state.pressed)
    }
    await this.manager.monitorCharacteristicForDevice(deviceID, '000000ff-0000-1000-8000-00805f9b34fb', '00000001-0000-1000-8000-00805f9b34fb',(error, characteristic) => {
      if(error){
        console.log(error.message)
        return
      }
      console.log(characteristic.uuid, characteristic.value)
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Turn {this.state.statusDevice} the light</Text>
        </View>

        <View style={{ width: 350, height: 350, padding: 20 }}>
          <Image
            source={this.state.pressed == true ? light_on : light_off}
            style={{ flex: 1, width: null, height: null, resizeMode: 'contain' }}
          />
        </View>
        <View style={{ marginBottom: 50, flexDirection: 'row', alignItems: 'center', }}>
          <TouchableWithoutFeedback onPress={this._onPress} ref='myRef'>
            <Image source={this.state.pressed == true ? switch_on : switch_off} style={{ width: 150, height: 150, marginLeft: 75 }} />
          </TouchableWithoutFeedback>
          <Text style={{ fontSize: 18, color: 'blue', textDecorationLine: 'underline', marginLeft: 20 }}>
            Log out
          </Text>
        </View>
      </View>
    )
  }
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  subContainer: {
    width: 100,
    height: 100
  }
})