import Header from "components/settings/header"
import { Pressable, ScrollView, StyleSheet, View, Text, TextInput, Keyboard, KeyboardEvent, ActivityIndicator, Alert } from "react-native"
import { useTheme } from "context/theme-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useMemo, useRef, useState } from "react"
import ImagePicker from "components/settings/ImagePicker"
import { isIOS } from "utils/common"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "redux/store/store"
import { checkSlug, createPublication, editPublication } from "queries/settings"
import { debounce } from "lodash"
import { setUserDetail } from "redux/reducers/userDetails"

function PublicationEditor() {
    const router = useRouter()
    const styles = useStyles()
    const { Colors } = useTheme()
    const scrollViewRef = useRef<ScrollView>(null)
    const [keyboardSpace, setKeyboardSpace] = useState(0)
    const {userDetails}:any = useSelector((state: RootState) => state.userDetails);
    const dispatch = useDispatch()

    const { id } = useLocalSearchParams()
    const publication = userDetails?.publications.find((p: any) => p.id === Number(id))

    // input fields
    const urlRef = useRef<TextInput>(null)
    const aboutRef = useRef<TextInput>(null)

    const [name, setName] = useState<string>(publication?.title || '')
    const [url, setUrl] = useState<string>(publication?.slug || '')
    const [about, setAbout] = useState<string>(publication?.description || '')
    const [avatar, setAvatar] = useState<string | undefined>(publication?.avatar)

    const [checkingSlug, setCheckingSlug] = useState<boolean>(false)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [working, setWorking] = useState<boolean>(false)
    const slugApproved = useRef<boolean>(true)

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

    const onSubmit = async () => {
        setWorking(true)
        Keyboard.dismiss();
        if(!avatar) {
            Alert.alert(
                'No photo!',
                'Please choose an image to continue...',
                [{ text: 'OK' }]
            )
            setWorking(false)
            return;
        }

        if(!name) {
            Alert.alert(
                '',
                'Please enter a title for your publication.',
                [{ text: 'OK' }]
            )
            setWorking(false)
            return;
        }

        if(!about) {
            Alert.alert(
                '',
                'Please describe your publication.',
                [{ text: 'OK' }]
            )
            setWorking(false)
            return;
        }

        if(!url || url.length < 3) {
            Alert.alert(
                '',
                'Please choose a public URL for your publication.',
                [{ text: 'OK' }]
            )
            setWorking(false)
            return;
        }

        try {
            const response = publication ? await editPublication(about, true, url, name, avatar !== publication?.avatar ? avatar : undefined) : await createPublication(avatar, about, true, url, name)
    
            let publications = userDetails?.publications.length > 0 ? userDetails?.publications.map((item: any) => item?.id === publication?.id ? response : item) : [response];
            dispatch(setUserDetail({
                ...userDetails,
                publications
            }))
    
            router.back();
        } catch(error) {
            console.warn(error)
            Alert.alert(
                'Oops!',
                `Failed to ${publication ? 'update' : 'create'} your publication. Please try again later.`,
                [{ text: 'OK' }]
            )
        } finally { setWorking(false) }
    }

    const debouncedCheckSlug = useMemo(
        () => debounce(async (text: string) => {
            setSuggestions([])
            setCheckingSlug(true)
            const slugCheck = await checkSlug(text)
            if (slugCheck && !slugCheck.available) {
                setSuggestions(slugCheck.suggestions || [])
                slugApproved.current = slugCheck.available;
            }
            setCheckingSlug(false)
        }, 500),
        []
    )

    const checkSlugAvailability = async (text: string) => {
        const newURL = text.toLowerCase().trim().replace(/\s+/g, '');
        setUrl(newURL)
        if(newURL.length > 2) debouncedCheckSlug(text)
    }
    
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
            <ImagePicker caption="Photo or artwork" initialURL={publication?.avatar} onChange={url => setAvatar(url)} isAuthor={false} />
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>Name</Text>
                <TextInput value={name} placeholder="Give your page a name" placeholderTextColor={Colors.placeholderText} onChangeText={text => setName(text)} style={styles.input} returnKeyLabel="next" onSubmitEditing={() => urlRef?.current?.focus()} />
            </View>
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>Publication URL</Text>
                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: suggestions.length > 0 ? 2 : 15 }]} >
                    <TextInput value={url} keyboardType="url" autoCapitalize="none" placeholderTextColor={Colors.placeholderText} autoCorrect={false} onChangeText={text => checkSlugAvailability(text)} ref={urlRef} returnKeyLabel="next" onSubmitEditing={() => aboutRef?.current?.focus()} style={{ width: '50%', fontFamily: 'Primary', color: Colors.text }} />
                    <Text style={{ fontFamily: 'Primary', color: Colors.text}}>.voicenotes.com</Text>
                    {checkingSlug && <ActivityIndicator />}
                </View>
                {suggestions.length > 0 && <Text style={styles.error}>Sorry that's taken. Please try {suggestions.join(', ')}</Text>}
            </View>
            <View style={styles.info}>
                <Text style={{ color: Colors.text }}>About</Text>
                <TextInput value={about} placeholder="Describe yourself for your audience?" placeholderTextColor={Colors.placeholderText} onChangeText={text => setAbout(text)} ref={aboutRef} multiline returnKeyLabel="done" style={[styles.input, { height: 80, paddingTop: 12, paddingBottom: 12, textAlignVertical: 'top' }]} onSubmitEditing={() => Keyboard.dismiss()} />
            </View>
            {keyboardSpace > 0 && <View style={{ height: keyboardSpace }} />}
        </ScrollView>
        <View style={styles.footer}>
            <Pressable onPress={working ? null : onSubmit} style={styles.button}>
                {working ? <ActivityIndicator /> : <Text style={styles.buttonlabel}>Done</Text>}
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
            color: Colors.text,
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
        error: {
            marginBottom: 10,
            fontFamily: 'Primary',
            color: Colors.redWithOpacity(0.8)
        }
    }), [Colors])
}

export default PublicationEditor