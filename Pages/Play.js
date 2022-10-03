import React, {useState,useEffect} from 'react';
import { View,Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import {ref, set,increment } from 'firebase/database';
import HandCard from '../Components/HandCard';
import TableCard from '../Components/TableCard';
import useJSON from '../Components/useJSON';
import { deckArray } from '../Components/CardsDeck';
import { database } from '../Components/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const tst={"client_0": {"data": {"card": "J", "index": 48, "suits": "S"}, "turn": 2}, "client_1": {"data": {"card": "3", "index": 40, "suits": "S"}, "turn": 3}, "client_2": {"data": {"card": "7", "index": 44, "suits": "S"}, "turn": 0}, "client_3": {"data": {"card": "A", "index": 51, "suits": "S"}, "turn": 1}}

const suits={
  H: "♥",
  D: "♦",
  C: "♣",
  S: "♠"

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

const addtablecard=(tablecards,card,playerkey,handcount)=>{
  if(tablecards &&  handcount%4!=0){
      return {...tablecards,[playerkey]:{turn:handcount%4,data:card}}
  }
  return {[playerkey]:{turn:handcount%4,data:card}}
}

const _winCard=(tablecards,shaka)=>{
  var _win,_first
  for(var player in tablecards){
    if(tablecards[player].turn==0){
      _win=player
      _first=player
    }
  }
  for(var player in tablecards){
    if(tablecards[player].data.suits==shaka){
      if(tablecards[_win].data.suits==shaka && (tablecards[player].data.index)%13>(tablecards[_win].data.index)%13){
        _win=player
      }else if(tablecards[_win].data.suits!=shaka){
        _win=player
      }
    }else if(tablecards[_win].data.suits!=shaka && tablecards[player].data.suits==tablecards[_first].data.suits && tablecards[player].data.index%13>tablecards[_win].data.index%13){
        _win=player
    }
  }
  return _win
}

const nextPlayer=(curr)=>{
  return "client_"+((Math.floor(curr.slice(-1))+1)%4).toString()
}

const _playerteam = (playerkey)=>{
  return "team_"+Math.floor(Number(playerkey.split("_")[1])%2).toString()
}

const _opteam=(playerkey)=>{
  return "team_"+(((Math.floor(Number(playerkey.split("_")[1])%2))+1)%2).toString()

}



export default function Play({room,handcount,playerkey,round,points,team,turn,restart,user}){


  const [table]=useJSON(ref(database, "Rooms/"+room+"/game/table"))
  const [tablecards,settablecards]=useState({})
  const [shaka,setshaka]=useState(null)
  const [player]=useJSON(ref(database, "Rooms/"+room+'/players/'+playerkey))
  const [playercards,setplayercards]=useState([])
  const [play,setplay]=useState(0)
  const [canThrow,setcanThrow]=useState("")


  useEffect(()=>{
    if(player?.cards){
      const _cards=player.cards
      if(playercards!==_cards){
        setplayercards(_cards)
      }
    }

  },[player,playercards]);

  

  useEffect(()=>{
    if(table?.cards){
      const _tablecards=table.cards
      if(tablecards!=_tablecards){
        settablecards(_tablecards)
        setcanThrow(_canThrow(tablecards,playercards))
      }
    }
    if(table?.shaka ){
      const _shaka=table.shaka
      if(shaka!=_shaka){
        setshaka(_shaka)
      }
    }
  },[table,tablecards,shaka]);

  useEffect(()=>{
    if(handcount%4==Object.keys(tablecards).length%4 && (round.team_0+round.team_1+playercards.length)==13){
      setcanThrow(_canThrow(tablecards,playercards))
      setplay(1)
    }else{
      setplay(0)
    }
  },[tablecards,handcount,play,playercards,canThrow]);
  
  const _sorted=Object.values(tablecards).sort((a,b)=>{ b.turn>a.turn})

  const _canThrow=(tablecards,playercards)=>{

    if(Object.keys(tablecards).length%4!=0){
      var _first
      for(var player in tablecards){
        if(tablecards[player].turn==0){
          _first=tablecards[player].data
        }
      }
      for(var card in playercards){
        if(playercards[card].suits==_first.suits){
          return _first.suits
        }
      }

    }

    return "all"
  }


  const updatePoints=async(_started,_op,round)=>{
    if(round[_started]<round.request){
      if(round[_op]>6){
        await set(ref(database,"Rooms/"+room+"/game/score/points"),{[_started]: points[_started]-round.request,[_op]:points[_op]+round[_op]})
        return {[_started]: points[_started]-round.request,[_op]:points[_op]+round[_op]}
      }else{
        await set(ref(database,"Rooms/"+room+"/game/score/points"),{[_started]: points[_started]-round.request,[_op]:points[_op]})
        return {[_started]: points[_started]-round.request,[_op]:points[_op]}
      }
    }else{
      await set(ref(database,"Rooms/"+room+"/game/score/points/"+_started),increment(round[_started]))
      return {[_started]: points[_started]+round[_started],[_op]:points[_op]}
    }
  }

  const setNewRound=async(handcount)=>{
      await set(ref(database,"Rooms/"+room+"/game/data"),{status: "request" ,handcount: handcount,turn: ""})
      await set(ref(database,"Rooms/"+room+"/game/table"),null)
      await set(ref(database,"Rooms/"+room+"/game/score/round"),{team_0:0,team_1:0})
  }

  const newDeck=async()=>{
    const dividedCards=divideDeck()
    for(var i=0;i<4;i++){
      const playerCardsRef=ref(database,"Rooms/"+room+"/players/client_"+ i.toString()+'/cards')
      await set(playerCardsRef,dividedCards[i])
    }

  }

  const updateScore=async(_winTeam)=>{
    await set(ref(database,"Rooms/"+room+"/game/score/round/"+_winTeam),increment(1))
    await set(ref(database,"Rooms/"+room+"/game/table/cards"),null)
  }



  const _turn=(tablecards,handcount,turn,shaka)=>{
    if((handcount+1)%4==0){
      const _winplayer=_winCard(tablecards,shaka)
      const _winTeam=_playerteam(_winplayer)
      updateScore(_winTeam)
      if((handcount+1)%52==0){
        const _started=round.started
        const _op="team_"+((Number(_started.split("_")[1])+1)%2).toString()
        var _round=round
        _round[_winTeam]=_round[_winTeam]+1
        const _points=updatePoints(_started,_op,_round)
        setNewRound(handcount+1)
        newDeck()
      }
      return _winCard(tablecards,shaka)
    }else{
      return nextPlayer(turn)
    }
  }

  const throwCard=async(i)=>{

    const cardThrow=playercards.find((item)=>item.index===i)
    const newCards=playercards.filter((item)=>item.index!==i)
    const newTableCards=addtablecard(tablecards,cardThrow,playerkey,handcount)
    
    
    const _handcount=handcount+1

    const curr=_turn(newTableCards,handcount,turn,shaka)

    if(_handcount%52!=0){

      await set(ref(database,"Rooms/"+room+"/players/"+ playerkey+'/cards'),newCards)

    }




    await set(ref(database,"Rooms/"+room+"/game/data/handcount"),_handcount)
    .then(
      await set(ref(database,"Rooms/"+room+"/game/data/turn"), curr)
    ).then(
      await set(ref(database,"Rooms/"+room+"/game/table/cards"),newTableCards)
    )
    if(handcount%52==0 ){
      await set(ref(database,"Rooms/"+room+"/game/table/shaka"),cardThrow.suits)
    }


    settablecards(newTableCards)

    setplayercards(newCards)
  }


  const storelastState = async(value) => {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem('@storage_Key', jsonValue)
  }
  
  const exitGame=async()=>{
    storelastState({user:user})
    restart()
    await set(ref(database,"Rooms/"+room+"/game/data/status"),'exit')
  }


    return(
      <View>

        <View style={styles.score}>
          <TouchableOpacity style={styles.exitButton} onPress={()=>exitGame()}>
            <Text style={{color:'black',fontWeight:'bold',fontSize:18}}>X</Text>
          </TouchableOpacity>

          <View >
            <View style={styles.teamScore}>
              <Text style={{fontSize:20,fontWeight:'900',color:'black'}}>Team score</Text>
              <Text style={{fontSize:20,fontWeight:'900',color:'black'}}>Score: {points[_playerteam(playerkey)]}</Text>
              <Text style={{fontSize:20,fontWeight:'900',color:'black'}}>Round: {round[_playerteam(playerkey)]}{round?.started==_playerteam(playerkey)?"/"+round.request:null}</Text>
              <Text style={{fontSize:20,fontWeight:'900',color:shaka=="H"||shaka=='D'?'red':'black'}}>{round?.started==_playerteam(playerkey)?suits[shaka]:null}</Text>
            </View>

            <View style={[styles.mate,{backgroundColor: turn== team.mate? 'red':'black'}]}/>
            
            <View style={styles.opScore}>
              <Text style={{fontSize:20,fontWeight:'900',color:'black'}}>Opponet score</Text>
              <Text style={{fontSize:20,fontWeight:'900',color:'black'}}>Score: {points[_opteam(playerkey)]}</Text>
              <Text style={{fontSize:20,fontWeight:'900',color:'black'}}>Round: {round[_opteam(playerkey)]}{round?.started==_opteam(playerkey)?"/"+round.request:null}</Text>
              <Text style={{fontSize:20,fontWeight:'900',color:shaka=="H"||shaka=='D'?'red':'black'}}>{round?.started==_opteam(playerkey)?suits[shaka]:null}</Text>
            </View>
          </View>
        </View>

        <View style={{flexDirection: 'row',alignItems:'center'}}>

            <View style={[styles.op1,{backgroundColor: turn==team.op2? 'red':'black'}]}/>

            <View style={{alignItems:'center',alignSelf:'center',paddingLeft:100,paddingRight:100}}>
              {tablecards?
                <FlatList contentContainerStyle={styles.tableContainer} data={_sorted} renderItem={({item})=><TableCard  item={item.data}/>} keyExtractor={(item)=>item.turn} />
              :null}
            </View>

            <View style={[styles.op2,{backgroundColor: turn==team.op1? 'red':'black'}]}/>
        </View>
        <View>
          {playercards?
          <View>
            {turn==playerkey && play?
              <FlatList contentContainerStyle={styles.cardsContainer} data={playercards} renderItem={({item})=><HandCard canThrow={canThrow} throwCard={throwCard} item={item}/>} keyExtractor={(item)=>item.index} />
            :
              <FlatList contentContainerStyle={styles.cardsContainer} data={playercards} renderItem={({item})=><TableCard item={item}/>}/>
            }
          </View>:null}
        </View>   
      </View>
    )
}

const styles = StyleSheet.create({

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
    marginLeft:100,
    alignItems:'center'
  },
    teamScore:{
      flex: 1,
      position: 'absolute',
      right:0,
      marginRight: 100,
      alignItems:'center'
    },
    cardsContainer: {
      flexDirection: 'row',
      alignItems:'center',
      alignSelf: 'center'
    },
    tableContainer: {
      flexDirection: 'row',
      marginLeft:200,
      height:130,
      padding:10,
      alignItems:'center',
      alignSelf: 'center'
    },
    mate: {
      width: 30,
      height: 30,
      alignSelf: 'center',
      borderRadius:100
    },
    op1: {
      width: 30,
      height: 30,
      padding:10,
      margin:20,
      flex: 1,
      position: 'absolute',
      left:0,
      borderRadius:100

    },
    op2: {
      width: 30,
      height: 30,
      padding:10,
      margin:20,
      flex: 1,
      position: 'absolute',
      right:0,
      borderRadius:100
    }

    
  });