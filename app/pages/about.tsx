import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const About = () => {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>About Page</Text>
            <Text style={styles.text1}>This project was made in React Native + Expo</Text>
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
        fontSize: 28,
        margin: 8,
        fontWeight: 'bold',
    },
    text1: {
        color: 'white',
        fontSize: 18,
        margin: 8,
        fontWeight: 'bold',
        maxWidth: '80%',
    },
});

export default About;