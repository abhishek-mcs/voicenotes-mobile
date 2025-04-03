import Header from "components/settings/header"
import { Pressable, ScrollView, StyleSheet, View, Text, TextInput, Keyboard, KeyboardEvent } from "react-native"
import { useTheme } from "context/theme-context"
import { useRouter } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import ImagePicker from "components/settings/ImagePicker"
import { isIOS } from "utils/common"

function BioEditor() {
    const router = useRouter()
    const styles = useStyles()
    const { Colors } = useTheme()
    const scrollViewRef = useRef<ScrollView>(null)
    const [keyboardSpace, setKeyboardSpace] = useState(0)

    const aboutRef = useRef<TextInput>(null)

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            isIOS ? 'keyboardWillShow' : 'keyboardDidShow',
            (event: KeyboardEvent) => {
                setKeyboardSpace(event.endCoordinates.height-90)
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true })
                }, 100)
            }
        )

        const keyboardWillHide = Keyboard.addListener(
            isIOS ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardSpace(0)
            }
        )

        return () => {
            keyboardWillShow.remove()
            keyboardWillHide.remove()
        }
    }, [])
    
    return <Header
        cancelLabel="Back"
        label="Your Info"
        working={false}
        onCancel={() => router.back()}
    >
        <>
        <ScrollView
            ref={scrollViewRef}
            style={{ height: '100%', width: '100%' }}
            contentContainerStyle={styles.root}
        >
            <ImagePicker caption="Profile photo" />
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>Name</Text>
                <TextInput style={styles.input} returnKeyLabel="Next" onSubmitEditing={() => aboutRef?.current?.focus()} />
            </View>
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>About</Text>
                <TextInput ref={aboutRef} multiline style={[styles.input, { height: 80, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' }]} />
            </View>
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>Website</Text>
                <TextInput style={styles.input} keyboardType={'url'} />
            </View>
            {keyboardSpace > 0 && <View style={{ height: keyboardSpace }} />}
        </ScrollView>
        <View style={styles.footer}>
            <Pressable style={styles.button}>
                <Text style={styles.buttonlabel}>Done</Text>
            </Pressable>
        </View>
        </>
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
            height: '15%',
            width: '100%',
            alignItems: 'center'
        },
        input: {
            width: '100%',
            height: 40,
            marginTop: 5,
            marginBottom: 15,
            backgroundColor: Colors.textinput,
            borderRadius: 10,
            paddingHorizontal: 10,
            fontFamily: 'Primary'
        },
        button: {
            width: '90%',
            backgroundColor: Colors.askLogo,
            height: 50,
            marginTop: 30,
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