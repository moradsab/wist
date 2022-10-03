import { View ,Text, TouchableOpacity} from "react-native";
import React from "react";

const _playerteam = (playerkey)=>{
    return "team_"+Math.floor(Number(playerkey.split("_")[1])%2).toString()
  }
  
  const _opteam=(playerkey)=>{
    return "team_"+(((Math.floor(Number(playerkey.split("_")[1])%2))+1)%2).toString()
  
  }

  const _winteam=(points)=>{
    if(points.team_0>points.team_1){
        return "team_0"
    }
    return "team_1"
  }

export default function Win({playerkey,points,restart}){
    const team=_playerteam(playerkey)
    const op=_opteam(playerkey)
    const win=_winteam(points)


    return(
        <View>
            <View>
                <Text style={{fontSize: 60,fontWeight:'900',color:team==win?"black":"red"}}>You {team==win?"win":"lose"}</Text>
            </View>

            <View>
                <Text style={{fontSize: 24,fontWeight:'900',color:"black",alignSelf:'center'}}>Your score {points[team]}</Text>
                <Text style={{fontSize: 24,fontWeight:'900',color:"red",alignSelf:'center'}}>Opponet score {points["team_"+((Number(team.split("_")[1])+1)%2).toString()]}</Text>
            </View>

            <TouchableOpacity onPress={restart} style={{borderColor:'black',borderWidth:2,borderRadius:20,marginTop:10,shadowColor:'black',shadowOpacity:0.2}}>
                <Text style={{fontSize: 18,fontWeight:'bold',color:"black",alignSelf:'center'}}>Lobby</Text>
            </TouchableOpacity>

        </View>

    )

}

  