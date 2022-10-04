import React,{ useEffect} from 'react';
import {  ref, set,onValue, onDisconnect, increment} from "firebase/database";
import { database } from '../Components/database';
import {Text,View,TouchableOpacity ,StyleSheet, ActivityIndicator} from "react-native";
import { deckArray } from '../Components/CardsDeck';

const divideDeck=()=>{
    var deck=deckArray
    var dividedDeck=[[],[],[],[]]
    for(var i=0; i<4;i++){
      for(var j=0;j<13;j++){
        const randomCard=deck[Math.floor(Math.random()*deck.length)];
        dividedDeck[i].push(randomCard)
        deck=deck.filter((card)=>card !== randomCard)
      }
    }
    return dividedDeck;
  }
export default function Wait({playerkey , room ,isallready, data ,exitroom ,restart}) {


    useEffect(()=>{
        if(!data){
            restart()
        }
    },[data])

    useEffect(()=>{
        onDisconnect(ref(database,"Rooms/"+room+"/players/"+playerkey+"/connected")).set(false)
    },[room,playerkey])
    
    useEffect(()=>{
        if(room && playerkey){
        onValue(ref(database,"Rooms/"+room+"/players/"),shot=>{
            const val=shot.val();
            for(var i in val){
                if(val[i]?.connected===false)
                    set(ref(database,"Rooms/"+room+"/players/"+i),null).then(
                        set(ref(database,"Rooms/"+room+"/data/nop"),increment(-1))
                    )
            }
        }, {
            onlyOnce: true
          });}
    },[room])


    useEffect(()=>{
        const setready=async()=>{
            await set(ref(database,"Rooms/"+room+"/players/"+playerkey+"/ready"),true);
        }
        const newDeck=async()=>{
            const dividedCards=divideDeck()
            for(var i=0;i<4;i++){
              const playerCardsRef=ref(database,"Rooms/"+room+"/players/client_"+ i.toString()+'/cards/')
              await set(playerCardsRef,dividedCards[i])
            }
      
          }

        const initgame=async()=>{
            await set(ref(database,"Rooms/"+room+"/data/status"),'started')
            await set(ref(database, "Rooms/"+room+"/game/"), {data: {handcount:0,status: 'request'},score:{points:{team_0:0,team_1:0},round:{team_0:0,team_1:0}}})
        }
        if(isallready){
            setready()
            onValue(ref(database,"Rooms/"+room+"/players/"),shot=>{
                const val=shot.val();
                var ready_count=0;
                for(var i in val){
                    if(val[i].ready===true)
                        ready_count++;
                }

                if(ready_count===4){
                    newDeck()
                    initgame()
                }else{console.log('lam')}
            }, {
                onlyOnce: true
              });
        }


    },[room,isallready])


    return (
        <View>
            <Text style={{fontSize: 24,fontWeight:'bold',color:"black",alignSelf:'center'}}>Waiting for other players</Text>
            <View style={{flexDirection:'row',alignSelf:'center'}}>
                <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center'}}>{data? (data?.nop-1).toString():null} {data?" joined":null}</Text>
                <ActivityIndicator animating={true} style={{marginLeft:10}} color='black'/>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={()=>exitroom()}>
                <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center'}}>Cancel</Text>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
    cancelButton: {
        width: 100,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor:'black',
        borderWidth:2,
        borderRadius:15,
        alignSelf:'center',
        marginTop: 10

    } 
  });