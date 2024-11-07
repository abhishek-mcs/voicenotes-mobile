import SearchComponent from "components/search-component"
import { useTheme } from "context"
import { SafeAreaView } from "react-native"
import { isIOS } from "utils/common"

export default ()=>{
  const { Colors } = useTheme()
  return (
    <SafeAreaView style={{backgroundColor:Colors.whiteWithOpacity(1),paddingTop:isIOS?0:50}}>
      <SearchComponent from={'widget'}/>
    </SafeAreaView>
  )
}