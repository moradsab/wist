import React, { useState , useEffect} from 'react'
import { onValue,off } from "firebase/database";

export default function useJSON(ref) {
    const [value, setvalue] = useState({});
    useEffect(() => {
        //Turning ref off -- memory leak
        return () => {
            off(ref);
        }
        // eslint-disable-next-line
    }, []);
    onValue(ref, (snap)=>{
        if(JSON.stringify(value)!==JSON.stringify(snap.val())){
            setvalue(snap.val())
        }
    });
    return [value];
}