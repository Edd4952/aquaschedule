import { StyleSheet, Text, View } from 'react-native';

const userPage = () => {
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Page</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#222', // Changed to dark background
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 24,
        color: 'white', // White text
    },
    link: {
        color: '#007AFF',
        fontSize: 18,
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default userPage;