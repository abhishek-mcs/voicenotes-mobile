import SearchComponent from "components/search-component"
import { useTheme } from "context"
import { SafeAreaView } from "react-native"

export default ()=>{
  const { Colors } = useTheme()
  return (
    <SafeAreaView style={{backgroundColor:Colors.whiteWithOpacity(1)}}>
      <SearchComponent from={'widget'}/>
    </SafeAreaView>
  )
}