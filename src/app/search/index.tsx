import SearchComponent from "components/search-component"
import { SafeAreaView } from "react-native"
import { isIOS } from "utils/common"

export default ()=>{
  return (
    <SafeAreaView style={{backgroundColor:'#fff',paddingTop:isIOS?0:50}}>
      <SearchComponent from={'widget'}/>
    </SafeAreaView>
  )
}