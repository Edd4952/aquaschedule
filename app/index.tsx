import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const HomePage = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Home Page</Text>
            <Link href={{ pathname: "/pages/mainpage", params: { id: "1" } }}>
                <Text style={styles.text}>Go to Main Page</Text>
            </Link>
            <Pressable onPress={() => router.push({ pathname: "/pages/about", params: { id: "2" } })}>
                <Text style={styles.text}>Go to About Page</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#222', // Optional: dark background for contrast
    },
    text: {
        color: 'white',
        fontSize: 18,
        margin: 8,
    },
});

export default HomePage;