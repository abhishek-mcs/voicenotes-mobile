import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, View, StyleSheet, InteractionManager, Platform, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';

export const OTPInput = ({ numberOfInputs = 6, onChange=(v)=>{},otpValue='',errorText='' }) => {
  const inputRefs = Array.from({ length: numberOfInputs }, () => useRef<TextInput>(null));
  const [currentIndex,setCurrentIndex] = useState(0)
  const isPasting=useRef(false);

  useFocusEffect(useCallback(()=>{
    setTimeout(() => {
      inputRefs[0]?.current?.focus()
    }, 350);
  },[]))

  const focusNextInput = (index) => {
    if (index < numberOfInputs - 1) {
      inputRefs[index + 1].current.focus();
    }
  };

  const focusPrevInput = (index) => {
    if (index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const setOTPValue=(index,value,isClear=false)=>{
    const temp=otpValue.split('');
    temp[index]=isClear?'-':(temp[index]==''||temp[index]=='-')?value:temp[index];
    let newVal=temp.join('');
    onChange(newVal)
  }

  const handleInputChange = (index, value) => {
    isPasting.current=true
    const isClear=value?.toLowerCase()?.indexOf('backspace')!=-1||false
    if ((value === '' || isClear) && index > 0) {
      focusPrevInput(index);
    } else if(value!=''&&!isClear) {
      focusNextInput(index);
    }
      setOTPValue(index,value,isClear)
  };
  
  const handleInputPaste =async (v) => {
    try{
      if(!isPasting.current&&v!=''){
        isPasting.current=true
        const value = await Clipboard.getString()??'';
        const numericValue = value.replace(/[^0-9]/g, '');
        numericValue==''&&inputRefs[0].current.setNativeProps({text:''});
        let currentIndexToUpdate = 0;
        for (let i = 0; i < numericValue.length && currentIndexToUpdate < numberOfInputs; i++) {
            setOTPValue(i,numericValue[i])
            inputRefs[i].current.setNativeProps({text:numericValue[i]});
            currentIndexToUpdate++;
            inputRefs[i].current.focus();
            if(i==numberOfInputs-1){(isPasting.current=false)}
        }
      }
    }catch{}
    isPasting.current=false
  };

  const firstHalf = inputRefs.slice(0, numberOfInputs / 2);
  const secondHalf = inputRefs.slice(numberOfInputs / 2);

  return (
    <View style={styles.main}>
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {firstHalf.map((inputRef, index) => (
          <View style={{flexDirection:'row'}} onTouchStart={(e)=>e?.stopPropagation()}>
            {(index!=0&&currentIndex==index)&&<View style={styles.separator}/>}
          <View key={index} style={[styles.inputWrapper, index === 0 && styles.firstHalfBorderRadius, index === firstHalf.length - 1 && styles.lastInputRadiusRight,index!=0&&styles.noBorderLeft,currentIndex==index&&styles.activeColor]}>
            <TextInput
              ref={inputRef}
              onFocus={()=>setCurrentIndex(index)}
              placeholder='0'
              placeholderTextColor={'rgba(113, 113, 113, 0.44)'}
              style={styles.input}
              maxLength={1}
              selectTextOnFocus={false}
              keyboardType="numeric"
              onKeyPress={({nativeEvent}) => handleInputChange(index, nativeEvent?.key)}
              onChangeText={async(v)=>await handleInputPaste(v)}
            />
          </View>
          </View>
        ))}
      </View>
      {/* <SvgXml style={styles.dash} xml={settingsSVG.dash} /> */}
      <View style={styles.inputContainer}>
        {secondHalf.map((inputRef, index) => (
          <View style={{flexDirection:'row'}} onTouchStart={(e)=>e?.stopPropagation()}>
          {(index!=0&&currentIndex==index+numberOfInputs/2)&&<View style={styles.separator}/>}
          <View key={index+numberOfInputs/2} style={[styles.inputWrapper, index === 0 && styles.firstHalfBorderRadius, index === secondHalf.length - 1 && styles.lastInputRadiusRight,index!=0&&styles.noBorderLeft,(currentIndex==(index+numberOfInputs/2))&&styles.activeColor]}>
            <TextInput
              ref={inputRef}
              onFocus={()=>setCurrentIndex(index+numberOfInputs/2)}
              style={[Platform.OS=="ios"?{width:42}:{},styles.input]}
              placeholder='0'
              placeholderTextColor={'rgba(113, 113, 113, 0.44)'}
              maxLength={1}
              selectTextOnFocus={false}
              aria-selected={false}
              keyboardType="numeric"
              onKeyPress={({nativeEvent}) => handleInputChange(index + numberOfInputs / 2, nativeEvent?.key)}
              onChange={async(v)=>await handleInputPaste(v)}
            />
          </View>
          </View>
        ))}
      </View>
    </View>
    <Text style={st("mt-2 ml-2 text-red-600 font-sf-normal text-sm")}>{errorText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  main:{
    marginTop:32,
    marginBottom:48
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'center',
    borderWidth: 1,
    borderColor:'rgba(243, 233, 233, 1)',
    width: 42,
    height: 50,
  },
  activeColor:{borderColor:'#000'},
  input: {
    textAlign: 'center',
    fontSize: 16
  },
  dash: {
    marginHorizontal: 12,
    fontSize: 20,
    fontWeight: 'bold',
  },
  firstHalfBorderRadius: {
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
  },
  lastInputRadiusRight: {
    borderTopRightRadius: 11,
    borderBottomRightRadius: 11
  },
  noBorderLeft:{borderLeftWidth:0},
  separator:{width:1,backgroundColor:'#000',height:50},
  errorText:{}
});
