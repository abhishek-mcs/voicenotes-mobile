import Header from "components/settings/header"
import { Pressable, ScrollView, StyleSheet, View, Text, TextInput, Keyboard, ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView } from "react-native"
import { useTheme } from "context/theme-context"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import ImagePicker from "components/settings/ImagePicker"
import { isIOS } from "utils/common"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { createAuthor, updateAuthor } from "queries/settings"
import { setUserDetail } from "redux/reducers/userDetails"
import { KeyboardAwareScrollView } from "react-native-keyboard-controller"

function BioEditor() {
    const router = useRouter()
    const styles = useStyles()
    const { Colors } = useTheme()
    const scrollViewRef = useRef<ScrollView>(null)
    const {userDetails}:any = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch()

    const [name, setName] = useState<string>(userDetails?.author?.name || '')
    const [about, setAbout] = useState<string>(userDetails?.author?.about || '')
    const [website, setWebsite] = useState<string>(userDetails?.author?.website || '')
    const [avatar, setAvatar] = useState<string>(userDetails?.author?.avatar || '')

    const aboutRef = useRef<TextInput>(null)
    const websiteRef = useRef<TextInput>(null)
    const [working, setWorking] = useState<boolean>(false)

    const scrollToInput = (ref: any) => {
        if (!ref || !ref.current) return;
        
        setTimeout(() => {
            ref.current.measureInWindow((x: number, y: number, width: number, height: number) => {
                const screenHeight = Dimensions.get('window').height;
                const keyboardHeight = Keyboard.metrics()?.height || 0;
                const inputBottomPosition = y + height;
                const keyboardPosition = screenHeight - keyboardHeight;
                
                if (inputBottomPosition > keyboardPosition - 20) {
                    scrollViewRef.current?.scrollTo({
                        y: inputBottomPosition - keyboardPosition + 120,
                        animated: true
                    });
                }
            });
        }, 300);
    };

    const onSubmit = async () => {
        setWorking(true)
        Keyboard.dismiss();
        if(!avatar) {
            Alert.alert(
                '',
                'Please upload an image.',
                [{ text: 'OK' }]
            )
            setWorking(false)
            return;
        }

        if(!name) {
            Alert.alert(
                '',
                'Please enter a name to be displayed in your profile.',
                [{ text: 'OK' }]
            )
            setWorking(false)
            return;
        }

        let websiteToSubmit = website;
        if(website) {
            const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            if (!urlRegex.test(website)) {
                Alert.alert(
                    '',
                    'Please enter a valid website URL',
                    [{ text: 'OK' }]
                )
                setWorking(false)
                return;
            }
            websiteToSubmit = website.startsWith('http') ? website : `https://${website}`;
            setWebsite(websiteToSubmit);
        }

        try {
            const response = userDetails?.author ? 
            await updateAuthor(
                name, 
                about, 
                websiteToSubmit || null, 
                avatar !== userDetails?.author?.avatar ? avatar : undefined
            ) : 
            await createAuthor(
                name, 
                about, 
                avatar, 
                websiteToSubmit
            );
            
            dispatch(setUserDetail({
                ...userDetails,
                author: response
            }))
    
            router.back();
        } catch(error) {
            console.warn(error)
            Alert.alert(
                'Oops!',
                `Failed to ${userDetails?.author ? 'update' : 'create'} your profile. Please try again later.`,
                [{ text: 'OK' }]
            )
        } finally { setWorking(false) }
    }
    
    return <Header
        cancelLabel="Back"
        label="Your profile"
        working={false}
        onCancel={() => router.back()}
    >
        <KeyboardAwareScrollView
            contentContainerStyle={styles.root}
            style={{ width: '100%', height: '100%' }}
            keyboardShouldPersistTaps="handled"
        >
            <ImagePicker caption="Profile photo" initialURL={userDetails?.author?.avatar} isAuthor onChange={url => setAvatar(url)} />
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>Author name</Text>
                <TextInput 
                    value={name}
                    onFocus={() => scrollToInput(null)} 
                    placeholder="Your name" 
                    placeholderTextColor={Colors.placeholderText} 
                    onChangeText={text => setName(text)} 
                    style={styles.input} 
                    returnKeyLabel="Next" 
                    returnKeyType="next" 
                    onSubmitEditing={() => aboutRef?.current?.focus()} 
                />
            </View>
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>About</Text>
                <TextInput 
                    value={about}
                    onFocus={() => scrollToInput(aboutRef)} 
                    placeholder="Tell your audience who you are. Share a little or a lot — it's up to you." 
                    placeholderTextColor={Colors.placeholderText} 
                    onChangeText={text => setAbout(text)} 
                    ref={aboutRef} 
                    returnKeyLabel="Next" 
                    returnKeyType="next" 
                    multiline 
                    onSubmitEditing={() => websiteRef?.current?.focus()} 
                    style={[styles.input, { height: 80, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' }]} 
                />
            </View>
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>Website (optional)</Text>
                <TextInput 
                    ref={websiteRef} 
                    value={website}
                    onFocus={() => scrollToInput(websiteRef)} 
                    placeholder="http://" 
                    placeholderTextColor={Colors.placeholderText} 
                    autoCapitalize="none" 
                    autoCorrect={false} 
                    returnKeyLabel="Go" 
                    returnKeyType="go" 
                    onChangeText={text => setWebsite(text)} 
                    style={styles.input} 
                    keyboardType={'url'} 
                />
            </View>
            <View style={styles.footer}>
                <Pressable onPress={working ? null : onSubmit} style={styles.button}>
                    {working ? <ActivityIndicator color={!isIOS ? Colors.whiteWithOpacity(1) : undefined} /> : <Text style={styles.buttonlabel}>{userDetails?.author ? 'Update' : 'Done'}</Text>}
                </Pressable>
            </View>
        </KeyboardAwareScrollView>
    </Header>
}

const useStyles = () => {
    const { Colors } = useTheme()
    
    return useMemo(() => StyleSheet.create({
        root: {
            width: '100%',
            paddingHorizontal: 10,
        },
        info: {
            paddingHorizontal: 20,
            width: '100%',
        },
        footer: {
            width: '100%',
            alignItems: 'center',
            paddingVertical: 15,
            marginTop: Dimensions.get('window').height / 100
        },
        input: {
            width: '100%',
            height: 40,
            marginTop: 5,
            marginBottom: 15,
            backgroundColor: Colors.textinput,
            color: Colors.text,
            borderRadius: 10,
            paddingHorizontal: 10,
            fontFamily: 'Primary'
        },
        button: {
            width: '90%',
            backgroundColor: Colors.askLogo,
            height: 50,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonlabel: {
            color: Colors.whiteWithOpacity(1),
            fontFamily: 'Primary-Bold',
            fontSize: 14
        },
    }), [Colors])
}

export default BioEditor