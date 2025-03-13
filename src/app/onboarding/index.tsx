import { SafeAreaView, View } from 'react-native'
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
import { useSelector } from 'react-redux'
import { RootState } from 'redux/store/store'
import { useGetPreferenceEnums } from 'queries/auth'
import { useEffect, useState } from 'react'

const Onboarding = () => {
  const {Colors}=useTheme()
  const { selectedScreen } = useSelector((state: RootState) => state.onboardingData);
  const { data, refetch, isFetching } = useGetPreferenceEnums()
  const [referrer, setReferrer] = useState([])
  const [ageGroup, setAgeGroup] = useState([])
  const [frequency, setFrequency] = useState([])
  const [revisit, setRevisit] = useState([])
  const [noteTypes, setNoteTypes] = useState([])

  useEffect(() => {
    if (!data && !isFetching) {
      refetch();
    }
  }, [data, isFetching, refetch]);

  useEffect(() => {
    const enums:any = data?.data
    console.log(data);
    if (enums) {
      setReferrer(enums?.referrer)
      setAgeGroup(enums?.age_group)
      setFrequency(enums?.note_taking_frequency)
      setRevisit(enums?.revisit_frequency)
      setNoteTypes(enums?.note_types)
    }
  },[data])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteWithOpacity(1) }}>
       {selectedScreen !== 1 && selectedScreen !== 18 && <View>
          <AnimatedProgressBar step={selectedScreen} totalSteps={18} />
        </View>}
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
    </SafeAreaView>
  )
}

export default Onboarding