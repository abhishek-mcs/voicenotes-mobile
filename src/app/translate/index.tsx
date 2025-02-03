import { View, Text, Pressable, StyleSheet, DeviceEventEmitter, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { languagesList, Language } from 'utils/constants/languages';
import { useTheme } from 'context';
import { useMemo, useState, useRef, useEffect } from 'react';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { settingsSvg } from 'assets/svg/settingsSvg';
import Touchable from "components/common/Touchable";
import { SearchBarIOS } from '@rneui/base/dist/SearchBar/SearchBar-ios';
import { commonSvg } from 'assets/svg/commonSvg';
import { isIOS } from 'utils/common';
import { getRecentLanguages, addRecentLanguage } from 'utils/recentLanguages';

export default function TranslateScreen() {
  const { Colors } = useTheme();
  const styles = useStyles();
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Language[]>([]);
  const [focused, setFocused] = useState(false);
  const languages = languagesList;
  const [recentLanguages, setRecentLanguages] = useState<Language[]>([]);

  // Load recent languages on mount
  useEffect(() => {
    const loadRecentLanguages = async () => {
      const recent = await getRecentLanguages();
      setRecentLanguages(recent);
    };
    loadRecentLanguages();
  }, []);

  const groupedLanguages = useMemo(() => {
    // Filter out the "Detect language" option and group by first letter
    const grouped = languages
      .filter(lang => lang.code !== '')
      .reduce((acc, lang) => {
        const firstLetter = String(lang.name)[0].toUpperCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(lang);
        return acc;
      }, {} as Record<string, Language[]>);

    // Sort languages within each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    });

    return grouped;
  }, [languages]);

  const onSearch = (text: string) => {
    setQuery(text);
    setResults(text ? languages.filter(item => 
      String(item.name).toLowerCase().includes(text.toLowerCase())
    ) : []);
  }

  // Get all available letters for the selector
  const availableLetters = useMemo(() => {
    return Object.keys(groupedLanguages).sort();
  }, [groupedLanguages]);

  // Reference for ScrollView
  const scrollViewRef = useRef<ScrollView>(null);
  // Store letter positions
  const letterPositions = useRef<Record<string, number>>({});

  const scrollToLetter = (letter: string) => {
    const position = letterPositions.current[letter];
    if (position !== undefined) {
      scrollViewRef.current?.scrollTo({ y: position, animated: true });
    } else {
      // Find next available letter
      const nextLetter = availableLetters.find(l => l > letter && letterPositions.current[l] !== undefined);
      if (nextLetter) {
        scrollViewRef.current?.scrollTo({ y: letterPositions.current[nextLetter], animated: true });
      }
    }
  };

  const LetterHeader = ({ letter, isTop = false }: { letter: string, isTop?: boolean }) => (
    <View style={[styles.letterHeader, {marginTop: isTop ? 0 : 10}]}>
      <Text style={{ color: Colors.grey6, fontFamily: 'Primary-SemiBold', fontSize: 12 }}>{letter}</Text>
    </View>
  );

  const onSelectLanguage = async (code: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    
    // Find the selected language object
    const selectedLanguage = languages.find(lang => lang.code === code);
    if (selectedLanguage) {
      await addRecentLanguage(selectedLanguage);
    }

    DeviceEventEmitter.emit('translateNote', {
      code: code,
      noteId
    });
    router.back();
  };

  const LanguageComponent = ({name, onPress, isTop = false, isBottom = false}: {name: string, onPress: () => void, isTop?: boolean, isBottom?: boolean}) => {
    return <Pressable onPress={onPress} style={[
            styles.language, 
            { borderBottomStartRadius: isBottom ? 12 : 0, borderBottomEndRadius: isBottom ? 12 : 0, borderTopStartRadius: isTop ? 12 : 0, borderTopEndRadius: isTop ? 12 : 0}
    ]}>
        <View style={[styles.languageInner, {borderBottomWidth: isBottom ? 0 : 0.3}]} >
            <Text style={{color: Colors.text, fontFamily: 'Primary-Medium', fontSize: 14}}>{name}</Text>
        </View>
    </Pressable>
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.top}>
                <View style={{flex: 2}} />
                <View style={{ flex: 10, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color:Colors.primaryDark,fontFamily:'Primary-Medium',fontSize:17}}>Translate to</Text>
                </View>
                <View style={{flex: 2, justifyContent: 'center', alignItems: 'center'}} >
                    <Touchable onPress={() => router.back()} style={{ marginRight: 2, padding: 12 }} activeOpacity={0.6}>
                        <SvgXml xml={settingsSvg.close?.replace("#0D0D0D",Colors.black2)} width={28} height={25} />
                    </Touchable>
                </View>
            </View>
            <View style={styles.bottom}>
                <SearchBarIOS
                  searchIcon={<SvgXml xml={commonSvg.search} />}
                  clearIcon={<View style={{width:0,height:0}}/>}
                  placeholder="Search"
                  placeholderTextColor={Colors.grey6}
                  contextMenuHidden={true}
                  autoComplete="off"
                  autoCorrect={true}
                  autoCapitalize={"none"}
                  containerStyle={{backgroundColor:'transparent'}}
                  inputContainerStyle={{backgroundColor:Colors.inputBg2,borderRadius:12,height:40}}
                  inputStyle={{color:Colors.text}}
                  value={query}
                  onChangeText={onSearch}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
            </View>
        </View>
        <View style={styles.body}>
            <View style={{flex: 0.5}} />
            <View style={{flex: 12}} >
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    style={{flex: 1, width: '100%'}}
                    contentContainerStyle={{width: '100%', paddingVertical: 25, paddingHorizontal: 10}}
                >
                    {!(results.length > 0) && <View>
                        {recentLanguages.length > 0 && <LetterHeader isTop letter="RECENTLY USED" />}
                        {recentLanguages.map((item, index) => {
                            return <LanguageComponent
                                key={item.code}
                                name={String(item.name)}
                                onPress={() => onSelectLanguage(item.code)}
                                isTop={index === 0}
                                isBottom={index === recentLanguages.length - 1}
                            />
                        })}
                        </View>}
                    {results.length > 0 ? results.map((item, index) => (
                        <LanguageComponent
                            key={item.code}
                            name={String(item.name)}
                            onPress={() => onSelectLanguage(item.code)}
                            isTop={index === 0}
                            isBottom={index === results.length - 1}
                        />
                    )) : availableLetters.map((letter) => (
                        <View
                            key={letter}
                            onLayout={(event) => {
                                letterPositions.current[letter] = event.nativeEvent.layout.y;
                            }}
                        >
                            <LetterHeader letter={letter} />
                            {groupedLanguages[letter].map((item, index) => (
                                <LanguageComponent
                                    key={item.code}
                                    name={String(item.name)}
                                    onPress={() => onSelectLanguage(item.code)}
                                    isTop={index === 0}
                                    isBottom={index === groupedLanguages[letter].length - 1}
                                />
                            ))}
                        </View>
                    ))}
                </ScrollView>
            </View>
            {focused ? <View style={{flex: 1}} /> : (
                <View style={styles.selector}>
                    {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                        <Touchable
                            key={letter}
                            onPress={() => scrollToLetter(letter)}
                            style={styles.letterSelector}
                        >
                            <Text style={{
                                color: availableLetters.includes(letter) ? Colors.text : Colors.grey6,
                                fontFamily: 'Primary-Medium',
                                fontSize: 10
                            }}>
                                {letter}
                            </Text>
                        </Touchable>
                    ))}
                </View>
            )}
        </View>
    </View>
  );
}

const useStyles = () => {
  const { Colors } = useTheme();
  return useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.bgColor,
      paddingTop: isIOS ? 0 : 30
    },
    header: {
        height: '15%'
    },
    top: {
        flex: 1.3,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flexDirection: 'row',
    },
    bottom: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    body: {
        height: '85%',
        backgroundColor: Colors.inputBg2,
        borderRadius: isIOS ? 12 : 0,
        flexDirection: 'row',
    },
    selector: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    language: {
        height: 45,
        width: '100%',
        backgroundColor: Colors.bgColor,
        justifyContent: 'center',
        alignItems: 'center',
    },
    languageInner: {
        width: '95%',
        height: '100%',
        justifyContent: 'center',
        borderBottomColor: Colors.grey6,
        paddingHorizontal: 10
    },
    letterHeader: {
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    letterSelector: {
        padding: 4,
    }
  }), [Colors]);
};
