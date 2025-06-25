import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const About = () => {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>About Page</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222', // Dark background for contrast
    },
    text: {
        color: 'white',
        fontSize: 18,
        margin: 8,
    },
});

export default About;