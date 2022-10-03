import { ref,set} from 'firebase/database';
import React, {useState,useEffect} from 'react';
import { View,StyleSheet,Text,TouchableOpacity} from "react-native";
import useJSON from '../Components/useJSON';
import { database } from '../Components/database';
import Play from './Play';
import Request from './Request';
import Win from './Win';
import AsyncStorage from '@react-native-async-storage/async-storage';




const Exit=({restart,user})=>{

  useEffect(()=>{
    const storelastState = async(value) => {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@storage_Key', jsonValue)
    }
    storelastState({user:user})

  },[])


  return(
    <View>
      <Text style={{fontSize: 24,fontWeight:'900',color:"black",alignSelf:'center'}}>A player left the game</Text>
      <TouchableOpacity onPress={()=>restart()} style={{borderColor:'black',borderWidth:2,borderRadius:20,marginTop:10,shadowColor:'black',shadowOpacity:0.2}}>
          <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center'}}>Lobby</Text>
      </TouchableOpacity>
  </View>
  )
}


export default function Game({user,playerkey,room,team , restart}){

  const [data]= useJSON(ref(database, "Rooms/"+room+"/game/data"))
  
  const [score]=useJSON(ref(database, "Rooms/"+room+"/game/score"))

  const [handcount,setHandcount]=useState(0)
  const [status,setStatus]=useState("")
  const [turn,setTurn]=useState("")
  const [round,setround]=useState(null)
  const [points,setpoints]=useState(null)


  useEffect(()=>{

    if(data?.status){
      const _status=data.status
      if(status!=_status){
          setStatus(_status)
      }
    }
  },[data,status])



  useEffect(()=>{
    if(data?.turn){
      const _turn=data.turn
      if(_turn!=turn){
          setTurn(_turn)
      }
  }

  },[data,turn])

  useEffect(()=>{
    const setWin=async()=>{
      await set(ref(database,"Rooms/"+room+"/game/data/status"),"win")
    }
    if(score?.round){
      const _round=score.round
      if(_round!=round){
        setround(_round)
      }
    }
    if(score?.points){
      const _points=score.points
      if(points!=_points){
        setpoints(_points)
        if(_points.team_0>50 || _points.team_1>50){
          const bank="client_"+Math.floor((handcount/52)).toString()
          if(playerkey==bank){
            setWin()
          }
          setStatus("win")
        }
      }
    }
  },[score,points,round])



  useEffect(()=>{

    if(data?.handcount){
      const _handcount=data.handcount
      if(handcount!=_handcount){
          setHandcount(_handcount)
      }
  }

  },[handcount,data])






   return(
        <View>
            <View>
            {status=='request'?
                <Request room={room} handcount={handcount} playerkey={playerkey} team={team} restart={restart} user={user}/>
            :null
            }
          </View>
          <View>
            {status=="play"?
            <View>
              <Play room={room}  handcount={handcount} playerkey={playerkey} round={round} team={team} turn={turn} points={points} restart={restart} user={user}/>
            </View>
            :null}
          </View>
          <View>
            {status=='win'?
                <Win playerkey={playerkey} points={points} restart={restart}/>
            :null
            }
          </View>
          <View>
            {status=='exit'?
                <Exit restart={restart} user={user}/>
            :null
            }
          </View>

    </View>

   )
}

  const styles = StyleSheet.create({
    cardsContainer: {
      flexDirection: 'row',
    },
    tableContainer: {
      flexDirection: 'row',
      padding: 30
    },
    client1: {
      width: 30,
      height: 30,
      margin: 3,
      alignSelf: 'center'
    },
    client2: {
      width: 30,
      height: 30,
      margin: 3,
      flex: 1,
      position: 'absolute',
      left:0

    },
    client3: {
      width: 30,
      height: 30,
      margin: 3,
      flex: 1,
      position: 'absolute',
      right:0
    }

    
  });
  
  