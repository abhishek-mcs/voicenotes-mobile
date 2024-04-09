import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from "react-native"

export default ({children,...rest}:TouchableOpacityProps)=>{
    return (
        <TouchableOpacity {...rest}>
            {children}
        </TouchableOpacity>
    )
}