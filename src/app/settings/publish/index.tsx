import { settingsSvg } from "assets/svg/settingsSvg";
import GetStarted from "components/settings/GetStarted";
import Header from "components/settings/header";
import { useTheme } from "context/theme-context";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated, Image, ScrollView } from "react-native";
import Svg, { SvgXml } from "react-native-svg";
import { isIOS } from "utils/common";

function Publish() {
    const router = useRouter();
    const styles = useStyles();
    const { Colors } = useTheme()

    const [authorSetup, setAuthorSetup] = useState<boolean>(true)

    const screenSlide = new Animated.Value(0);

    // Screen transition animation
    useEffect(() => {
        Animated.timing(screenSlide, {
            toValue: authorSetup ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [authorSetup]);

    const EditButton = (): JSX.Element => {
        return <Pressable style={styles.editbutton}>
            <SvgXml xml={settingsSvg.edit.replace("black", Colors.text)} />
            <Text style={{ color: Colors.text }}>Edit</Text>
        </Pressable>
    }

    const PromptCard = ({ index, title, body, onPress, disabled } : { index: number, title: string, body: string, onPress: () => void, disabled?: boolean }): JSX.Element => {
        return <View style={[styles.prompt, { opacity: disabled ? 0.5 : 1 }]}>
            <View style={styles.promptindex}>
                <View style={styles.promptindexno}>
                    <Text style={{ color: Colors.text }}>{index}</Text>
                </View>
                <View style={styles.dotsContainer}>
                    {[...Array(10)].map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                { opacity: i < 5 ? 1 : 1 - ((i - 4) * 0.2) }
                            ]}
                        />
                    ))}
                </View>
            </View>
            <View style={styles.prompttext}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.promptheader}>{title}</Text>
                <Text style={styles.promptbody}>{body}</Text>
                <Pressable onPress={disabled ? null : onPress} style={styles.addinfobutton}>
                    <Text style={{ color: Colors.whiteWithOpacity(1), fontFamily: 'Primary-Medium' }}>Add Your Info</Text>
                </Pressable>
            </View>
        </View>
    }

    const Author = (): JSX.Element => {
        return <View style={styles.author}>
            <PromptCard
                index={1}
                title={'Set up your profile'}
                body="Let listeners know who's behind the mic -- add a name, photo and short bio"
                onPress={() => router.push('/settings/publish/bio')}
            />
        </View>
    }

    // const Author = (): JSX.Element => {
    //     return <View style={styles.author}>
    //         <Text style={styles.heading}>About</Text>
    //         <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
    //             <View style={styles.card}>
    //                 <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
    //                     <Image
    //                         source={require('../../../assets/images/pastnotes3-dark.png')}
    //                         style={{ width: 100, height: 100 }}
    //                         resizeMode="contain"
    //                     />
    //                 </View>
    //                 <View style={{ flex: 4, justifyContent: 'center', gap: 2, paddingRight: 15 }}>
    //                     <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    //                         <Text style={styles.authorname}>Leonardio di Caprio</Text>
    //                         <EditButton />
    //                     </View>
    //                     <Text numberOfLines={3} ellipsizeMode="tail" style={styles.authorbio}>Artist. Inventor. Visionary.Leonardo da Vinci’s VoiceNotes echo with timeless curiosity — from natu...</Text>
    //                 </View>
    //             </View>
    //         </View>
    //     </View>
    // }

    // const Publications = () => {
    //     return <View style={styles.publications}>
    //         <PromptCard
    //             index={2}
    //             disabled
    //             title={'Start your publication'}
    //             body="A place to share your best voice notes -- from lessons and ideas to stories and reflections"
    //         />
    //     </View>
    // }

    const Publications = (): JSX.Element => {

        const Publication = ({ title, url, onEdit }: { title: string, url: string, onEdit: () => void }): JSX.Element => {
            return <View style={styles.card}>
                <View style={{ flex: 4, paddingHorizontal: 20, paddingVertical: 10, gap: 5 }}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.publication}>{title}</Text>
                    <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.url}>{url}</Text>
                        <SvgXml xml={settingsSvg.url} />
                    </Pressable>
                </View>
                <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <EditButton />
                </View>
            </View>
        }

        return <View style={styles.publications}>
            <Text style={styles.heading}>Publications</Text>
            <View style={styles.publicationsContainer}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Publication title="Design & Beyond" url="amal.voicenotes.com" onEdit={() => {}} />
                    <Publication title="BoxClub" url="box.voicenotes.com" onEdit={() => {}} />
                    {/* Add more publications here */}
                </ScrollView>
                
                <View style={styles.footerContainer}>
                    <Pressable onPress={() => router.push('/settings/publish/publication')} style={styles.createbutton}>
                        <SvgXml xml={settingsSvg.add.replace("black", Colors.whiteWithOpacity(1))} />
                        <Text style={styles.createlabel}>Create</Text>
                    </Pressable>
                    <View style={styles.captionContainer}>
                        <SvgXml xml={settingsSvg.send.replace("black", Colors.blackWithOpacity(0.5))} />
                        <Text style={styles.caption}>
                            You're live! Record a voice note, tap Share, choose a publication and hit Publish!
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    }

    return <Header
        onCancel={() => router.back()}
        label={authorSetup?"Publish":""}
        cancelLabel="Back"
        working={false}
    >
        {!authorSetup ? 
            <GetStarted
                onGetStarted={() => setAuthorSetup(true)}
                screenSlide={screenSlide}
            /> :
            <Animated.View 
                style={[
                    styles.root,
                    {
                        transform: [{
                            translateX: screenSlide.interpolate({
                                inputRange: [0, 1],
                                outputRange: [400, 0]
                            })
                        }]
                    }
                ]}
            >
                <Author />
                <Publications />
            </Animated.View>}
    </Header>
}

const useStyles = () => {
    const { Colors } = useTheme()
    
    return useMemo(() => StyleSheet.create({
        root: {
            flex: 1,
            width: '100%'
        },
        author: {
            width: '100%',
            paddingHorizontal: 20,
            marginBottom: 20
        },
        heading: {
            color: Colors.blackWithOpacity(0.75),
            fontFamily: 'Primary-Medium',
        },
        editbutton: {
            backgroundColor: Colors.bottomBarButtonBg1,
            padding: 5,
            paddingHorizontal: 10,
            borderRadius: 50,
            gap: 5,
            flexDirection: 'row',
            alignItems: 'center'
        },
        card: {
            width: '98%',
            marginTop: 20,
            paddingVertical: 10,
            borderRadius: 15,
            backgroundColor: Colors.whiteWithOpacity(1),
            flexDirection: 'row',
            ...(isIOS ? {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                margin: 5,
            } : {
                elevation: 4,
            }),
        },
        authorname: {
            fontFamily: 'Primary-Medium',
            color: Colors.text,
            fontSize: 17
        },
        authorbio: {
            fontFamily: 'Primary',
            color: Colors.text,
            fontSize: 14
        },
        publications: {
            width: '100%',
            paddingHorizontal: 20,
            flex: 1,
        },
        publicationsContainer: {
            flex: 1,
            marginTop: 10,
        },
        scrollView: {
            flex: 1,
        },
        scrollViewContent: {
            paddingTop: 10,
            paddingBottom: 20,
        },
        footerContainer: {
            width: '100%',
            paddingBottom: 20
        },
        captionContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            marginTop: 20,
            gap: 10,
            width: '95%'
        },
        publication: {
            fontFamily: 'Primary-Medium',
            fontSize: 18,
            color: Colors.text
        },
        url: {
            fontFamily: 'Primary',
            color: "#0073FF"
        },
        prompt: {
            marginBottom: 10,
            width: '95%',
            paddingVertical: 15,
            borderRadius: 20,
            backgroundColor: Colors.whiteWithOpacity(1),
            alignSelf: 'center',
            flexDirection: 'row',
            ...(isIOS ? {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                margin: 5,
            } : {
                elevation: 4,
            }),
        },
        promptindex: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        promptindexno: {
            borderWidth: 1,
            width: 25,
            height: 25,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 100,
            borderColor: Colors.blackWithOpacity(0.25),
        },
        prompttext: {
            flex: 5,
            justifyContent: 'center',
            gap: 5
        },
        promptheader: {
            fontFamily: 'Primary-Medium',
            color: Colors.text,
            fontSize: 15
        },
        promptbody: {
            color: Colors.blackWithOpacity(0.75)
        },
        addinfobutton: {
            width: '50%',
            marginTop: 5,
            paddingVertical: 10,
            backgroundColor: Colors.askLogo,
            borderRadius: 25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        dotsContainer: {
            marginTop: 8,
            alignItems: 'center',
            gap: 4,
        },
        dot: {
            width: 2,
            height: 2,
            borderRadius: 2,
            backgroundColor: Colors.blackWithOpacity(0.25),
        },
        createbutton: {
            width: '100%',
            backgroundColor: Colors.askLogo,
            height: 50,
            marginTop: 30,
            borderRadius: 25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
        },
        createlabel: {
            color: Colors.whiteWithOpacity(1),
            fontFamily: 'Primary-Bold',
            fontSize: 14
        },
        caption: {
            color: Colors.blackWithOpacity(0.5),
            fontFamily: 'Primary',
            fontSize: 13
        }
    }), [Colors])
}

export default Publish;
