import Colors from "assets/Colors";
import { home } from "assets/svg/home";
import MoreOptions from "components/common/more-options";
import Touchable from "components/common/Touchable";
import { StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { formatDate } from "utils/format-date";
import { Menu, MenuItem, MenuDivider } from "react-native-material-menu";

export default ({
  note={},
  visible = false,
  setVisible = (v: boolean) => {},
  editNote = {
    title: "",
    txt: "",
    tags: [],
    tag:""
  },
  setEditNote=(v:any)=>{},
  index = 0
}) => {
  const hideMenu = () => setVisible(false);

  const showMenu = () => setVisible(true);

  const onSaveEdit=()=> setEditNote( {
    title: "",
    txt: "",
    tags: [],
    tag:""
  })
  const onCancelEdit=()=> setEditNote( {
    title: "",
    txt: "",
    tags: [],
    tag:""
  })

  const onEdit=()=>{
    setEditNote({
      title: "voicenotes is a new way to take notes",
      txt: `Record your thoughts freely, get them transcribed using state of the art AI, and then search or simply ask about every word you spoke. It feels as magical as it sounds. Go ahead, record your first voice note (no sign-up required).`,
      tags: [],
      tag:''
    })
  }
  const onStarred=()=>{}
  const onGenerate=()=>{}
  const onCopy=()=>{hideMenu()}
  const onDelete=()=>{hideMenu()}

  if (!!editNote?.title)
    return (
      <View
        style={styles.editContainer}
      >
        <TextInput 
          style={styles.titleInput}
          value={editNote.title}
          onChangeText={txt=>setEditNote((n:any)=>{return {...n,title:txt}})} />
        <View style={styles.divider1} />
        <TextInput 
          style={styles.textInput}
          multiline
          value={editNote.txt} 
          onChangeText={txt=>setEditNote((n:any)=>{return {...n,txt:txt}})} />
        <View style={[styles.divider1, { width: "100%" }]} />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 12,
            paddingTop: 16,
            flexDirection: "row",
            justifyContent:'space-between',
          }}
        >
          <View style={styles.row}>
          <TextInput
            style={styles.tagInput}
            placeholder="#Add tags"
            placeholderTextColor={Colors.greyWithOpacity(0.82)}
            value={editNote.tag}
            onChangeText={txt=>setEditNote((n:any)=>{return {...n,title:txt}})} />
          </View>
          <View style={styles.row}>
          <Touchable 
            style={{marginRight:12,paddingVertical:8,paddingHorizontal:16}}
            onPress={onCancelEdit}>
            <Text style={{color:'#9b9b9b',fontFamily:'Primary',fontSize:14}}>Cancel</Text>
          </Touchable>
          <TouchableHighlight
           style={{paddingVertical:8,paddingHorizontal:16,backgroundColor:Colors.primary,borderRadius:100}}
           underlayColor={Colors.primaryWithOpacity(0.7)}
           onPress={onSaveEdit}
           >
            <Text style={{color:'#fff',fontFamily:'Primary',fontSize:14}}>Save</Text>
          </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  return (
    <View style={styles.container}>
      <View style={[styles.btw, styles.row]}>
        <View style={styles.row}>
          <Touchable>
            <SvgXml xml={home.play} />
          </Touchable>
          <Text
            style={{
              color: Colors.grey,
              fontFamily: "Primary",
              fontSize: 14,
              marginLeft: 16,
            }}
          >
            {formatDate()}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <View style={styles.timeLine} />
        <View style={{ marginLeft: 25 }}>
          <Text style={styles.title}>
            voicenotes is a new way to take notes
          </Text>
          <Text style={styles.text}>
            Record your thoughts freely, get them transcribed using
            state-of-the-art AI, and then search or simply ask about every word
            you spoke. It feels as magical as it sounds. Go ahead, record your
            first voice note (no sign-up required).
          </Text>
          <Text style={styles.tag}>#dailytask</Text>
        </View>
      </View>

      <View style={[styles.row,{marginLeft:34,marginTop:16}]}>
      <Touchable>
        <SvgXml xml={home.star}/>
      </Touchable>
      <Touchable style={{marginLeft:16}} onPress={onEdit}>
        <SvgXml xml={home.edit}/>
      </Touchable>
      <Touchable style={{marginLeft:16}} >
        <SvgXml xml={home.create1}/>
      </Touchable>
      <Menu
          visible={visible}
          anchor={
            <Touchable style={styles.menuPress} onPress={showMenu}>
              <SvgXml xml={home.more} />
            </Touchable>
          }
          onRequestClose={hideMenu}
          style={styles.menu}
        >
          <MenuItem style={styles.menuItem} onPress={onGenerate}>
            <View style={[styles.row,{width:180}]}>
              <SvgXml xml={home.generate} />
              <Text style={styles.menuItemTxt}>Generate another title</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={onCopy}>
            <View style={styles.row}>
              <SvgXml xml={home.copy} />
              <Text style={styles.menuItemTxt}>Copy note</Text>
            </View>
          </MenuItem>
          <MenuItem style={styles.menuItem} onPress={onDelete}>
            <View style={styles.row}>
              <SvgXml xml={home.delete} />
              <Text style={styles.menuItemTxt}>Delete</Text>
            </View>
          </MenuItem>
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  row: { flexDirection: "row", alignItems: "center" },
  btw: { justifyContent: "space-between" },
  timeLine: {
    width: 1,
    height: "100%",
    backgroundColor: Colors.primaryWithOpacity(0.1),
    marginLeft: 9,
  },
  title: {
    fontWeight: "500",
    fontFamily: "Primary-Medium",
    fontSize: 20,
    color: "#222",
    lineHeight: 26,
  },
  text: {
    fontFamily: "Primary",
    fontSize: 16,
    color: "rgba(34, 34, 34, 0.9)",
    lineHeight: 23,
    marginTop: 8,
  },
  titleInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 10,
    fontFamily: "Primary-Medium",
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "500",
  },
  textInput: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom:10,
    minHeight: 100,
    fontFamily: "Primary",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    textAlignVertical: "top",
    textAlign:'left',
  },
  divider1: {
    height: 1,
    width: "93%",
    backgroundColor: Colors.primaryWithOpacity(0.1),
    alignSelf: "center",
  },
  menu: {
    borderRadius: 12,
    marginTop:25,
    marginLeft:10
  },
  menuPress: {
    height: 20,
    width: 30,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  menuItem: { paddingHorizontal: 16, borderRadius: 12, overflow: "hidden" },
  menuItemTxt: {
    fontFamily: "Primary",
    fontSize: 14,
    color: "#222",
    lineHeight: 24,
    marginLeft: 12,
  },
  tagInput: { color: Colors.darkWithOpacity(0.9), fontFamily: "Primary" },
  editContainer:{
    borderWidth: 1,
    borderColor: Colors.primaryWithOpacity(0.1),
    borderRadius: 12,
    marginBottom: 24,
    paddingVertical: 12,
  },
  tag:{
    fontSize:16,
    lineHeight:21.1,
    fontFamily:'Primary',
    color:'#717171',
    marginTop:4
  }
});
