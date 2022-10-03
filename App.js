import React, {useState,useEffect} from 'react';
import { View, StyleSheet, SafeAreaView,Text, ActivityIndicator } from "react-native";
import {signInAnonymously } from "firebase/auth";
import { auth } from './Components/database';
import Lobby from './Pages/Lobby';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';
import {ref} from 'firebase/database';
import { database } from './Components/database.js';
import useJSON from './Components/useJSON';
LogBox.ignoreLogs(["AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage"]);

export default function App() {

  const[loggedIn,setLoggedIn]=useState(0)
  const [lastState,setlastState]=useState(null)
  const [connection]=useJSON(ref(database,".info/connected"))
  const [connected,setconnected]=useState(0)

  useEffect(()=>{
    if(connection){
      if(connection==true){
        setconnected(1)
      }else{
        setconnected(0)
      }
    }else(setconnected(0))

  },[connected,connection])

  useEffect(()=>{

    const getlastState = async  () => {
      const jsonValue = await AsyncStorage.getItem('@storage_Key')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    }

    const storelastState = async(value) => {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@storage_Key', jsonValue)
    }

    const signIn=async()=>{
      await signInAnonymously(auth).then((u)=>{
        if(u){
          storelastState({user: u.user.uid})
          setlastState({user: u.user.uid})
          setLoggedIn(1)
      }})
    }

    getlastState().then((s)=>{
      if(s){
        if(s!=lastState){
          setlastState(s)
        }
        if(s?.user){
          setLoggedIn(1)

        }
      }else{
        signIn()
      }
  })

  },[loggedIn]);


  return(
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} >
        {loggedIn && connected ?<Lobby lastState={lastState} />
        :
        <View>
          <ActivityIndicator style={{alignSelf:'center'}} size='large' color='black'/>
          <Text  style={{fontSize: 20,fontWeight:'900',color:"black",alignSelf:'center'}}>Check your connection</Text>
        </View>
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  safe: {
    flex: 1
  }
});
