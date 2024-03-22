import React from 'react'
import { TouchableOpacity } from "react-native"

export default ({children,...rest}:any)=>{
    return (
        <TouchableOpacity {...rest}>
            {children}
        </TouchableOpacity>
    )
}