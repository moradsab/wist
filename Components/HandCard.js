import React from 'react';
import { TouchableOpacity, View,StyleSheet,Text } from 'react-native';

const suits={
    H: "♥",
    D: "♦",
    C: "♣",
    S: "♠"

}

const HandCard =({item,throwCard,canThrow}) => {

    const color=(suit)=>{
        if(suit=='H'||suit=='C'){
            return 'red'
        }
        return 'black'
    }

    return(
        <View style={{backgroundColor:'white'}}>
            {(canThrow=="all" || canThrow==item.suits)?
                <TouchableOpacity style={styles.card} onPress={()=>throwCard(item.index) }>
                <Text style={[styles.suit,{color: color(item.suits)}]}>{suits[item.suits]}</Text>
                <Text style={[styles.text,{color: color(item.suit)}]}>{item.card}</Text>
                </TouchableOpacity>
            :
            <View style={styles.nonthrowableCard}>
                <Text style={[styles.suit,{color: color(item.suits)}]}>{suits[item.suits]}</Text>
                <Text style={[styles.text,{color: color(item.suit)}]}>{item.card}</Text>
            </View>
            
            }
        </View>
    )
}
const styles = StyleSheet.create({
    card: {
        width: 50,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor : "white",
        borderColor: "black",
        borderWidth: 2,
        borderRadius: 10,
        margin: 5,
        opacity: 1,
        flex: 1
    },
    nonthrowableCard: {
        width: 50,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor : "white",
        borderColor: "black",
        borderWidth: 2,
        borderRadius: 10,
        margin: 5,
        opacity: 0.5,
        flex: 1
    },
    text: {
        fontWeight: 'bold',
        backgroundColor: "white",
        fontSize: 30

    },
    suit: {

        fontWeight: 'bold',
        fontSize: 30,
        backgroundColor: "white",
        left: 0,
        margin: 1

    }
    
  });
  
  export default HandCard;
