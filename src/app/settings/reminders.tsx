import Header from "components/settings/header";
import { router } from "expo-router";
import Reminders from "components/common/Reminders";

const ReminderScreen: React.FC = () => {
    return (
        <Header
            onCancel={() => router.back()}
            label="Notifications"
            cancelLabel="Back"
            working={false}
        >
            <Reminders />
        </Header>
    )
}

export default ReminderScreen;