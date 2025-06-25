import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const HomePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Velcome to mine app</Text>
      <Link href={{ pathname: "/pages/mainpage", params: { id: "1" } }}>
          <Text style={styles.text}>Make a schedule</Text>
      </Link>
      <Pressable style={styles.button} onPress={() => router.push({ pathname: "/pages/about" })}>                <Text style={styles.text}>Go to About Page</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
    gap: 8,
  },
  text: {
    color: 'white',
    fontSize: 28,
  },
  link: {
    color: '#007AFF',
    fontSize: 18,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  }
});

export default HomePage;