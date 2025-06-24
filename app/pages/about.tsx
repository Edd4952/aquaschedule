import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const about = () => {

    const { id } = useLocalSearchParams();
    
    return (
        <View>
            <Text>About Page</Text>
        </View>
    );
}
export default about;