import Colors from "assets/Colors"
import SearchComponent from "components/search-component"
import { SafeAreaView } from "react-native"

export default ()=>{
  return (
    <SafeAreaView style={{backgroundColor:Colors.whiteWithOpacity(1)}}>
      <SearchComponent from={'widget'}/>
    </SafeAreaView>
  )
}