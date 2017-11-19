import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';

export default class Control extends Component {

  constructor(props) {
    super(props)
    this.state = {
      statusDevice: 'ON',
    }
  }

  render() {
    var powerIcon='\u23FC'
    console.log(powerIcon)
    return (
      <View style={{width:100, height:100, borderRadius:100, alignItems:'center',justifyContent:'center',  backgroundColor:'#ff0000', borderWidth:8, borderColor:'#ff3333', background : -webkit-radial-gradient(center , ellipse cover, #efefef 0% , #EEE 80% , #FFF 100%);}}>
          <Image source={require('../images/power_icon.png')} style={{width:60, height:60,}}/>
      </View>
    )
  }
}