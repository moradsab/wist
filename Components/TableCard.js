import React  from 'react';
import { View,StyleSheet,Text } from 'react-native';

const suits={
    H: "♥",
    D: "♦",
    C: "♣",
    S: "♠"

}

const TableCard =({item}) => {
    const color=(suit)=>{
        if(suit=='H'||suit=='D'){
            return 'red'
        }
        return 'black'
    }

    return(
        <View style={styles.card}>
            <Text style={[styles.suit,{color: color(item.suits)}]}>{suits[item.suits]}</Text>
            <Text style={[styles.text,{color: color(item.suit)}]}>{item.card}</Text>
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
        margin: 4,
        opacity: 1,
        flex: 1
    },
    text: {
        fontWeight: 'bold',
        fontSize: 30

    },
    suit: {

        fontWeight: 'bold',
        fontSize: 30,
        left: 0,
        margin: 1

    }
    
  });
  
  export default TableCard;