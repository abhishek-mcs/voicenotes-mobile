import { Animated, SafeAreaView, View } from 'react-native'
import Landing from './landing'
import Discovery from './discovery'
import Language from './language'
import Age from './age'
import Watch from './watch'
import Frequency from './frequency'
import Topics from './topics'
import Meetings from './meetings'
import Revisit from './revisit'
import PastNotes from './past-notes'
import Reviews from './reviews'
import Reminder from './reminder'
import Notification from './notification'
import FreeTrial from './free-trial'
import Email from './email'
import Name from './name'
import Password from './password'
import Pricing from './pricing'
import TrialReminder from './trial-reminder'
import { useTheme } from 'context'
import AnimatedProgressBar from './AnimatedProgressBar'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'redux/store/store'
import { useGetPreferenceEnums } from 'queries/auth'
import { useEffect, useState } from 'react'
import { setPreferenceEnums } from 'redux/reducers/onboardingData'

const Onboarding = () => {
  const {Colors}=useTheme()
  const dispatch = useDispatch();
  const { selectedScreen, preferenceEnums } = useSelector((state: RootState) => state.onboardingData);
  const { data, refetch, isFetching } = useGetPreferenceEnums()
  const [enums, setEnums] = useState(preferenceEnums ? preferenceEnums : data)
  const [referrer, setReferrer] = useState([])
  const [ageGroup, setAgeGroup] = useState([])
  const [frequency, setFrequency] = useState([])
  const [revisit, setRevisit] = useState([])
  const [noteTypes, setNoteTypes] = useState([])
  

  useEffect(() => {
    console.log(data);
    if (data == undefined && !isFetching) {
      refetch();
    } else if (data) {
      setEnums(data)
      setReferrer(data?.referrer)
      setAgeGroup(data?.age_group)
      setFrequency(data?.note_taking_frequency)
      setRevisit(data?.revisit_frequency)
      setNoteTypes(data?.note_types)
      dispatch(setPreferenceEnums(data))
    }
  }, [data, isFetching]);

  useEffect(() => {
    if(enums) {
      setReferrer(enums?.referrer)
      setAgeGroup(enums?.age_group)
      setFrequency(enums?.note_taking_frequency)
      setRevisit(enums?.revisit_frequency)
      setNoteTypes(enums?.note_types)
    }
  },[enums])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteWithOpacity(1) }}>
       {selectedScreen !== 1 && selectedScreen !== 18 && <View>
          <AnimatedProgressBar step={selectedScreen} totalSteps={18} />
        </View>}
      <Animated.View style={{ flex: 1 }}>
      { selectedScreen == 1 ? <Landing /> 
        : selectedScreen == 2 ? <Discovery data={referrer} /> 
        : selectedScreen == 3 ? <Language /> 
        : selectedScreen == 4 ? <Age data={ageGroup} /> 
        : selectedScreen == 5 ? <Watch /> 
        : selectedScreen == 6 ? <Frequency data={frequency} /> 
        : selectedScreen == 7 ? <Topics data={noteTypes} /> 
        : selectedScreen == 8 ? <Meetings /> 
        : selectedScreen == 9 ? <Revisit data={revisit} /> 
        : selectedScreen == 10 ? <PastNotes /> 
        : selectedScreen == 11 ? <Reviews /> 
        : selectedScreen == 12 ? <Notification /> 
        : selectedScreen == 13 ? <Reminder /> 
        : selectedScreen == 14 ? <FreeTrial /> 
        : selectedScreen == 15 ? <Email /> 
        : selectedScreen == 16 ? <Name /> 
        : selectedScreen == 17 ? <Password /> 
        : selectedScreen == 18 ? <Pricing /> 
        : selectedScreen == 19 ? <TrialReminder /> 
        : <Landing />}
      </Animated.View>
    </SafeAreaView>
  )
}

export default Onboarding