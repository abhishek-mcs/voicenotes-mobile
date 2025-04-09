import { settingsSvg } from "assets/svg/settingsSvg";
import GetStarted from "components/settings/GetStarted";
import Header from "components/settings/header";
import * as Wb from 'expo-web-browser';
import { useTheme } from "context/theme-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated, ScrollView, ActivityIndicator } from "react-native";
import { Image } from 'expo-image'
import { SvgXml } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";
import { setUserDetail } from "redux/reducers/userDetails"
import { RootState } from "redux/store/store";
import { isIOS } from "utils/common";
import MoreOptions from "components/common/more-options";
import { home } from "assets/svg/home";
import { MenuOptionsType } from "components/common/more-options/menu-props";
import { togglePage } from "queries/settings";

function Publish() {
    const router = useRouter();
    const styles = useStyles();
    const { Colors, isLightMode } = useTheme()
    const dispatch = useDispatch()

    const {userDetails}:any = useSelector((state: RootState) => state.userDetails);
    const { hideGS } = useLocalSearchParams()
    const [authorSetup, setAuthorSetup] = useState<boolean>(userDetails?.author !== null || (hideGS === 'true'))
    
    const screenSlide = new Animated.Value(0);

    useEffect(() => {
        if(userDetails?.author === null && userDetails?.publications.length > 0) setAuthorSetup(true);
    }, [userDetails?.author]);
    
    // Screen transition animation
    useEffect(() => {
        Animated.timing(screenSlide, {
            toValue: authorSetup ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [authorSetup]);

    const EditButton = ({ onPress }: { onPress: () => void }): JSX.Element => {
        return <Pressable onPress={onPress} style={styles.editbutton}>
            <SvgXml xml={settingsSvg.edit.replace("black", Colors.text)} />
            <Text style={{ color: Colors.text }}>Edit</Text>
        </Pressable>
    }

    const PromptCard = ({ index, title, body, onPress, disabled, label } : { index: number, title: string, body: string, onPress: () => void, label: string, disabled?: boolean }): JSX.Element => {
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
                    <Text style={{ color: Colors.whiteWithOpacity(1), fontFamily: 'Primary-Medium' }}>{label}</Text>
                </Pressable>
            </View>
        </View>
    }

    const Author = (): JSX.Element => {
        const [imageLoading, setImageLoading] = useState(false);

        return authorSetup && userDetails?.author !== null ? <View style={styles.author}>
            <Text style={styles.heading}>About</Text>
            <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <View style={styles.card}>
                    <View style={{ flex: 1.6, justifyContent: 'center', paddingLeft: 10 }}>
                        {imageLoading && (
                            <View style={{ position: 'absolute', width: 80, height: 80, borderRadius: 15, backgroundColor: Colors.bottomBarButtonBg1, justifyContent: 'center', alignItems: 'center' }}>
                                <ActivityIndicator color={Colors.askLogo} />
                            </View>
                        )}
                        <Image
                            source={{ uri: userDetails?.author?.avatar || '' }}
                            style={{ width: 80, height: 80, borderRadius: 15 }}
                            contentFit="contain"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            priority={'high'}
                        />
                    </View>
                    <View style={{ flex: 4, gap: 2, paddingRight: 10 }}>
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.authorname}>{userDetails?.author?.name}</Text>
                            <EditButton onPress={() => router.push('/settings/publish/bio')} />
                        </View>
                        <Text numberOfLines={3} ellipsizeMode="tail" style={styles.authorbio}>{userDetails?.author?.about}</Text>
                    </View>
                </View>
            </View>
        </View> : <View style={styles.author}>
            <PromptCard
                index={1}
                title={'Set up your author page'}
                body="Let your audience know who's behind the mic—add your name, photo, a short bio, or a link to your website."
                label="Setup profile"
                onPress={() => router.push('/settings/publish/bio')}
            />
        </View>
    }

    const Publications = (): JSX.Element => {
        
        const openPublication = (slug: string) => Wb.openBrowserAsync(`https://${slug}.voicenotes.com`, { toolbarColor: isLightMode ? '#fff' : '#000' })

        const Publication = ({ title, slug, onEdit, is_public }: { title: string, slug: string, onEdit: () => void, is_public: boolean }): JSX.Element => {
            
            const [enabled, setEnabled] = useState<boolean>(is_public)

            const togglePublicity = async() => {
                try {
                    await togglePage(slug, !enabled)
                    setEnabled(prev => !prev)
                    
                    const updatedPublications = userDetails?.publications.map((pub: any) => 
                        pub.slug === slug 
                            ? { ...pub, is_public: !enabled }
                            : pub
                    );

                    dispatch(setUserDetail({
                        ...userDetails,
                        publications: updatedPublications
                    }));
                } catch(error) {
                    console.error(error)
                }
            }

            const moreOptionsRef = useRef<{ show: () => void; hide: () => void } | null>(null);
            const menuOptions: MenuOptionsType[] = [
                {
                    title: "Edit",
                    onPress: onEdit
                },
                {
                    title: enabled ? "Disable" : "Enable",
                    onPress: togglePublicity
                }
            ];

            return <View style={[styles.card, { marginTop: 5, marginBottom: 15 }]}>
                <View style={{ flex: 4, paddingHorizontal: 20, paddingVertical: 10, gap: 5 }}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.publication}>{title}</Text>
                    <Pressable onPress={() => openPublication(slug)} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.url}>{slug}.voicenotes.com</Text>
                        <SvgXml xml={settingsSvg.url} />
                    </Pressable>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <MoreOptions
                        ref={moreOptionsRef}
                        options={menuOptions}
                        isNative={isIOS}
                    >
                        <Pressable 
                            style={styles.more}
                            onPress={() => moreOptionsRef.current?.show()}
                        >
                            <SvgXml xml={home.moreNew?.replace('#0D0D0D',Colors.more)}/>
                        </Pressable>
                    </MoreOptions>
                </View>
            </View>
        }

        return userDetails?.publications.length > 0 ? <View style={styles.publications}>
            <Text style={styles.heading}>Pages</Text>
            <View style={styles.publicationsContainer}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {userDetails?.publications.map((item: any, index: number) => {
                        return <Publication key={index} title={item?.title} slug={item?.slug} is_public={item?.is_public} onEdit={() => router.push({pathname: '/settings/publish/publication', params: { id: item?.id }})} />
                    })}
                    {userDetails?.publications.length < 3 && <Pressable onPress={() => router.push('/settings/publish/publication')} style={styles.createbutton}>
                        <SvgXml xml={settingsSvg.add.replace("black", Colors.whiteWithOpacity(1))} />
                        <Text style={styles.createlabel}>Create</Text>
                    </Pressable>}
                </ScrollView>
                
                <View style={styles.footerContainer}>
                    <View style={styles.captionContainer}>
                        <SvgXml xml={settingsSvg.send.replace("black", Colors.blackWithOpacity(1))} />
                        <Text style={styles.caption}>Your Page is now live. Record a voice note, tap Share, choose the Page, and hit Publish!</Text>
                    </View>
                </View>
            </View>
        </View> : <View style={styles.publications}>
            <PromptCard
                index={2}
                disabled={userDetails?.author === null}
                onPress={() => router.push('/settings/publish/publication')}
                title={'Set up your Page(s)'}
                label="Create page"
                body="A place to share your best notes—lessons, ideas, stories, reflections, and everything in between."
            />
        </View>
    }

    return <Header
        onCancel={() => router.back()}
        label=""
        cancelLabel="Back"
        working={false}
    >
        {!authorSetup && userDetails?.publications.length === 0 ? 
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
            backgroundColor: Colors.greyWithOpacity(0.2),
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
            backgroundColor: Colors.card,
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
        },
        scrollView: {
            flex: 1,
        },
        scrollViewContent: {
            paddingTop: 10,
            paddingBottom: 20,
            alignItems: 'center'
        },
        footerContainer: {
            width: '100%',
            paddingBottom: 40,
            justifyContent: 'center',
            alignItems: 'center'
        },
        captionContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 30,
            paddingVertical: 16,
            borderRadius: 10,
            marginBottom: 10,
            gap: 10,
            width: '95%',
            backgroundColor: Colors.bgColor
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
            backgroundColor: Colors.card,
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
            gap: 5,
            paddingRight: 15
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
            width: '35%',
            backgroundColor: Colors.askLogo,
            height: 50,
            marginBottom: 10,
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
            color: Colors.blackWithOpacity(1),
            fontFamily: 'Primary',
            fontSize: 13,
            lineHeight: 18
        },
        more: {
            width: 25,
            height: 25,
            borderRadius: 100,
            justifyContent:'center',
            alignItems: 'center',
            backgroundColor: Colors.greyWithOpacity(0.2)
        },
    }), [Colors])
}

export default Publish;
