import React, {useState,useEffect} from 'react';
import { View } from "react-native";
import Join from './Join';
import {searchRoom} from './Join';
import Wait from './Wait';
import useJSON from '../Components/useJSON';
import { database } from '../Components/database';
import {ref, set,increment,remove, get, query,onValue, equalTo} from "firebase/database";
import Game from './Game'
import AsyncStorage from '@react-native-async-storage/async-storage';


const teams={
  client_0:{
    op1 : "client_1",
    mate: "client_2",
    op2: "client_3"
  },
  client_1:{
    op1 : "client_2",
    mate: "client_3",
    op2: "client_0"
  },
  client_2:{
    op1 : "client_3",
    mate: "client_0",
    op2: "client_1"
  },
  client_3:{
    op1 : "client_0",
    mate: "client_1",
    op2: "client_2"
  }
}

const storelastState = async(value) => {
  const jsonValue = JSON.stringify(value)
  await AsyncStorage.setItem('@storage_Key', jsonValue)
}



export default function Lobby({lastState}){
    const user=lastState.user
    const [status,setstatus]=useState("");
    const [room,setroom]=useState("");
    const [isallready,setallready]=useState(0);
    const [data] = useJSON(ref(database, "Rooms/"+room+"/data/"));
    const [playerkey , setplayerkey] = useState("");

    const restart=()=>{
      setstatus("not entered");
      setroom("");
      setplayerkey("");
    }

    useEffect(()=>{restart()},[])
  
    useEffect(()=>{

      const getlastState = async  () => {
        const jsonValue = await AsyncStorage.getItem('@storage_Key')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
      }
      const storelastState = async(value) => {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem('@storage_Key', jsonValue)
      }
      getlastState().then((state)=>{
        if(lastState!=state){
          if(state?.room && state?.playerkey && state?.status=='started'){
            get(query(ref(database,"Rooms/"+state.room))).then((snap)=>{
              if(snap.exists() ){
                setroom(state.room)
                setplayerkey(state.playerkey)
              }else{
                storelastState({user:lastState.user})
                restart()
              }
            })
          }
        }
      })
    },[room,playerkey,isallready,status,lastState]);

    useEffect(()=>{
      const storelastState = async(value) => {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem('@storage_Key', jsonValue)
      }
      
      if(data?.status){
        const _status=data.status;
        if(status!==_status){
          setstatus(data.status);
          if(_status=='started'){
          storelastState({user: lastState.user, room: room,playerkey:playerkey,status:_status})}
          if(_status==="isallready")
            setallready(1);
          else{
            setallready(0);
          }
        }
      }
    },[data,status,room]);

    useEffect(()=>{
      if(room){
        onValue(ref(database,"Rooms/"+room),shot=>{
          if(!shot.exists()){
            restart()
          }
        }, {
          onlyOnce: true
        });}

    },[room])
  
    const exitroom=async()=>{
      if(data?.nop<=1){
        await remove(ref(database,"Rooms/"+room));
      }else if (room){
        await set(ref(database,"Rooms/"+room+"/data/nop"), increment(-1));
        await remove(ref(database,"Rooms/"+room+"/players/"+playerkey));
      }
      await storelastState({user:lastState.user})
      restart()
    }

    return(
      <View style={{backgroundColor:'white'}}>
        {status==="not entered"?
          <View>
            <Join setroom={setroom} user={user} setplayerkey={setplayerkey} restart={restart}/>
          </View>
        :
          <View>
            <View>
              {(status==="queuing" || status==="isallready")?
              <Wait playerkey={playerkey} room={room} data={data} isallready={isallready} exitroom={exitroom} restart={restart} />
              :null}
              {
                status==="started"?
                
                <Game user={user}  playerkey={playerkey} room={room} team={teams[playerkey]} restart={restart}/>
                :null
                }
            </View>
          </View>
        } 
      </View>
    )
  }