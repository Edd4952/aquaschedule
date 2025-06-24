import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const userPage = () => {
    
    const { id } = useLocalSearchParams();
    
    return (
        <View>
            <Text>User Page</Text>
        </View>
    );
}
export default userPage;