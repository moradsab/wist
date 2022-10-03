import React, { useState } from 'react';
import { View,Text, StyleSheet, TouchableOpacity } from "react-native";
import {ref, query,get, orderByChild ,equalTo,push, set,runTransaction} from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../Components/database';
const storelastState = async(value) => {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('@storage_Key', jsonValue)
  }

export default function Join({setroom,user,setplayerkey,restart}) {
    const [play,setPlay]=useState(1)
    async function Join(roomName){
        const roomRef=ref(database,"Rooms/"+roomName)

        if(roomRef){
            await runTransaction(roomRef,(room) => {
                if(room){
                    const searchkey=()=>{
                        for(var i=0;i<4;i++){
                            if(!room.players){
                                room.players={}
                            }
                            if(!(room.players["client_"+i.toString()])){
                                return i
                            }
                        }
                    }
                    const key=searchkey()
                    if(key<4){
                        room.players["client_"+key.toString()]={id: user}
                        room.data.nop++
                        if(room.data.nop==4){
                            room.data.status='isallready'
                        }
                        setplayerkey("client_"+key.toString())
                        setroom(roomRef.key);
                        storelastState({user:user,room:roomRef.key,playerkey:"client_"+key.toString()})
                    }
                }else{
                    storelastState({user:user})
                    restart();}
                return room
            });
        }
    }

    async function Create(){
        const newRoom={
            data : {
                nop : 1,
                status : "queuing",
            },
            players : {
                client_0 : {
                    id : user,
                }
            }
        }
        const newRoomRef=await push(ref(database,"Rooms/"));
        set(newRoomRef,newRoom)
        setplayerkey("client_0");
        setroom(newRoomRef.key);
        storelastState({user:user,room:newRoomRef.key,playerkey:"client_0"})
    }

    const searchRoom = async()=> {
        setPlay(0)
        await get(query(query(ref(database,'Rooms/'),orderByChild('data/status')),equalTo('queuing'))).then((snap)=>{
            if(snap.exists()){
                Join(Object.keys(snap.val())[0].toString())
            }else{
                Create()
            }
        })
        setPlay(1)
    }
    
    return (
        <View>
            {play?
                <TouchableOpacity style={styles.playButtonContainer} onPress={()=>{searchRoom()}}>
                    <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center'}}>Play</Text>
                </TouchableOpacity>
            :
                <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center'}}>Waiting for room</Text>
            }
            
        </View>
    )
}

const styles = StyleSheet.create({
    playButtonContainer: {
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor:'black',
        borderWidth:2,
        borderRadius:15

    } 
  });
