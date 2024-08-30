import Premium from "components/premium"
import useFBEventTracking from "hooks/fbsdk/useFBEventTracking"

export default (props:any) => {
  useFBEventTracking()
  return (<Premium/>)
}