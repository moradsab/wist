
import { set,ref} from 'firebase/database';
import React, {useState,useEffect} from 'react';
import { View,Text, StyleSheet, FlatList,TouchableOpacity } from "react-native";
import useJSON from '../Components/useJSON';
import TableCard from '../Components/TableCard';
import { deckArray } from '../Components/CardsDeck';
import { database } from '../Components/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storelastState = async(value) => {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('@storage_Key', jsonValue)
  }

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

const maxReq=(reqs)=>{
    var max=7
    for(var req in reqs){
        if(Number(reqs[req]) && reqs[req]>=max){
           max=Number(reqs[req]) 
        }
    }
    return max
}

const possibleReqs=(reqs)=>{
    var possiblereqs=["pass"]
    var max=6
    if(Object.keys(reqs).length){
        for(var player in reqs){
            if (Number(reqs[player])>max && Number(reqs[player])){
                max=Number(reqs[player])
            }
        }
    }
    for(var i=max+1;i<14;i++){
        possiblereqs.push(i.toString())
    }
    return possiblereqs
}

const BankRequest=({bank,reqs,team,setReq,newRequest})=>{
    const [take,setTake]=useState(0)
    const notTake=()=>{
        if(reqs[team.op1]=='pass' & reqs[team.op2]=='pass'){
            newRequest()
            return null
        }else{
            if(reqs[team.op1]>reqs[team.op2]){
                return team.op1
            }else{
                return team.op2
            }
        }
    
    }
    
    return(
        <View>
            {take?
            <View>
                <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center',alignContent:'center'}}>Start</Text>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity onPress={()=>setReq(bank)} style={{height:37,width:55,borderColor: "black",borderWidth: 2,marginLeft:5,borderRadius:20,alignItems:'center'}}>
                        <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center',alignContent:'center'}}>You</Text>
                    </TouchableOpacity>
                    {reqs[team.mate]==maxReq(reqs)?
                    <View>
                        <TouchableOpacity onPress={()=>setReq(team.mate)} style={{height:37,width:55,borderColor: "black",borderWidth: 2,marginLeft:10,borderRadius:20,alignItems:'center'}}>
                            <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center',alignContent:'center'}}>Mate</Text>
                        </TouchableOpacity>
                    </View>:null}
                </View>
            </View>
            :
            <View>
                <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center',alignContent:'center'}}>You want to play</Text>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity onPress={()=>setTake(1)} style={{height:37,width:55,borderColor: "black",borderWidth: 2,marginLeft:10,borderRadius:20,alignItems:'center'}}>
                        <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center',alignContent:'center'}}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>setReq(notTake())} style={{height:37,width:55,borderColor: "black",borderWidth: 2,marginLeft:5,borderRadius:20,alignItems:'center'}}>
                        <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center',alignContent:'center'}}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>

            }
        </View>
    )
}


export default function Request({room,handcount,playerkey,team,restart,user}){

    const [getReqs]=useJSON(ref(database,"Rooms/"+room+"/game/request"))
    const [reqTurn,setReqTurn]=useState(null);
    const [reqs,setReqs]=useState({})
    const [req,setReq]=useState(null)


    const [player]=useJSON(ref(database, "Rooms/"+room+'/players/'+playerkey))
    const [playercards,setplayercards]=useState([])

    const [possiblereqs,setpossiblereqs]=useState(possibleReqs({}))

    const bank="client_"+Math.floor((handcount/52)).toString()



    useEffect(()=>{
        if(player?.cards){
            const _cards=player.cards
            if(playercards!==_cards){
                setplayercards(_cards)
            }
        }
    },[player,playercards]);

  


    useEffect(()=>{

        if(getReqs){
            const _getReqs=getReqs
            if(reqs!==_getReqs){
                setReqs(_getReqs)
                const _reqTurn="client_"+((Math.floor(bank.slice(-1))+1+Object.keys(_getReqs).length)%4).toString()
                if(_reqTurn!=reqTurn){
                    setReqTurn(_reqTurn)
                }
                const _posreqs=possibleReqs(_getReqs)
                if(_posreqs!=possiblereqs){
                    setpossiblereqs(_posreqs)
                }
            }
        }else{
            if(Object.keys(reqs).length){
            setReqs({})
            setReq(null)}
            setpossiblereqs(possibleReqs({}))
            setReqTurn("client_"+((Math.floor(bank.slice(-1))+1)%4).toString())
        }

    },[reqTurn,getReqs,reqs])


    useEffect(()=>{

        const endRequest=async(bankReq)=>{
            await set(ref(database,"Rooms/"+room+"/game/data/status"), "play").then(
                await set(ref(database,"Rooms/"+room+"/game/data/turn"),bankReq)
            ).then(
                await  set(ref(database,"Rooms/"+room+"/game/request"),null)
            ).then(
                await set(ref(database,"Rooms/"+room+"/game/score/round"),{started: "team_"+Math.floor(Number(bankReq.split("_")[1])%2).toString(),request: maxReq(reqs),team_0: 0,team_1: 0})
            )
        }

        if(playerkey==bank && reqs[bank]){
            endRequest(reqs[bank])
        }
    },[reqs])

    useEffect(()=>{

        
        const sendReq=async(req)=>{
            await set(ref(database,"Rooms/"+room+"/game/request/"+playerkey),req)
        }

        if(req){
            sendReq(req)
        }
    },[req,reqs])

    const newDeck=async()=>{
        const dividedCards=divideDeck()
        for(var i=0;i<4;i++){
          const playerCardsRef=ref(database,"Rooms/"+room+"/players/client_"+ i.toString()+'/cards')
          await set(playerCardsRef,dividedCards[i])
        }

        await set(ref(database,"Rooms/"+room+"/game/request/"),null)
    
      }


      const exitGame=async()=>{
        storelastState({user:user})
        restart()
        await set(ref(database,"Rooms/"+room+"/game/data/status"),'exit')
      }

      const newRequest=()=>{
        set(ref(database,"Rooms/"+room+"/game/request"),{})
        newDeck()
        setReqs({})
      }




    return(
        <View style={{flexDirection:'column'}}>
            <View>
            <TouchableOpacity style={styles.exitButton} onPress={()=>exitGame()}>
                <Text style={{color:'black',fontWeight:'bold',fontSize:18}}>X</Text>
            </TouchableOpacity>

            </View>
            <View style={styles.mate}>
                <View style={[styles.player,{backgroundColor:reqTurn==team.mate? 'red':'black'}]}/>
                <Text style={{fontSize: 18,fontWeight:'bold',color:"black"}}>{reqs[team.mate]? reqs[team.mate]:null}</Text>
            </View>
            <View style={styles.centerContainer}>
                <View style={styles.op1}>
                    <View style={[styles.player,{backgroundColor:reqTurn==team.op2? 'red':'black'}]}/>
                    <Text style={{fontSize: 18,fontWeight:'bold',color:"black"}}>{reqs[team.op2]? reqs[team.op2]:null}</Text>
                </View>
                <View  style={{alignSelf:'center',alignItems:'center'}}>
                    {reqTurn===playerkey?
                        <View>
                            {reqTurn===bank?
                                <View>
                                    <BankRequest database={database} handcount={handcount} setReqs={setReqs} setReq={setReq} bank={bank} reqs={reqs} team={team} newRequest={newRequest}/>
                                </View>
                            :
                            <FlatList contentContainerStyle={styles.reqList} data={possiblereqs} renderItem={({item})=>
                                <TouchableOpacity style={{height:37,width:55,borderColor: "black",borderWidth: 2,marginLeft:5,borderRadius:20,alignItems:'center'}} onPress={()=>setReq(item)}>
                                    <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center',alignContent:'center'}}>{item}</Text>
                                </TouchableOpacity>} 
                            keyExtractor={(item)=>possiblereqs.indexOf(item)}/>
                            }
                        </View>
                        :
                        <View>
                            <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center'}}>Waiting for other players</Text>
                        </View>
                    }
                </View>
                <View style={styles.op2}>
                    <View style={[styles.player,{backgroundColor:reqTurn==team.op1? 'red':'black'}]}/>
                    <Text style={{fontSize: 18,fontWeight:'bold',color:"black"}}>{reqs[team.op1]? reqs[team.op1]:null}</Text>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                <FlatList contentContainerStyle={styles.cardsContainer} data={playercards} renderItem={({item})=><TableCard item={item}/>}/>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    cardsContainer: {
        flexDirection: 'row',
        alignItems:'center',
        alignSelf: 'center'
      },
    reqList:{
        flexDirection:'row',alignSelf:'center'
    },
    exitButton:{
      height:30,
      width:30,
      left:0,
      position:'absolute',
      marginLeft: 20,
      borderRadius: 50,
      backgroundColor:'white',
      borderColor:'black',
      borderWidth:2,
      alignContent:'center',
      alignItems:'center'
    },
    score:{
      flexDirection: 'row',
      flex:1,
      alignItems:'center',
      padding:20
    },
    opScore:{
      flex: 1,
      position: 'absolute',
      left:0,
      marginLeft:100
    },
      teamScore:{
        flex: 1,
        position: 'absolute',
        right:0,
        marginRight: 100
      },
      topContainer:{
        marginTop: 10,
        height: 50

      },
      bottomContainer: {
        flexDirection: 'row',
        alignItems:'center',
        alignSelf: 'center',
        height:130,
        width:'100%'
      },
      centerContainer: {
        flexDirection: 'row',
        height:40,
        alignItems:'center',
        alignSelf: 'center',
        marginBottom:10
      },
      mate: {
        alignSelf: 'center',
        marginBottom:10
      },
      op1: {
        position: 'absolute',
        left:0,
        marginLeft:-50
        
      },
      op2: {
        position: 'absolute',
        right:0,
        marginRight:-50
      },
      player:{
        width: 30,
        height: 30,
        borderRadius:100
      }
  
      
    });
