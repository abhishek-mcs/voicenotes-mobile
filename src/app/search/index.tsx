import SearchComponent from "components/search-component"
import { SafeAreaView } from "react-native"

export default ()=>{
  return (
    <SafeAreaView style={{backgroundColor:'#fff'}}>
      <SearchComponent from={'widget'}/>
    </SafeAreaView>
  )
}