import { Pressable, Text, View } from 'react-native';
import { Link, router } from 'expo-router';

const HomePage = () => {
    return (
        <View>
            <Text>Home Page</Text>
            <Link href={{ pathname: "/pages/mainpage", params: { id: "1" } }}>Go to Main Page</Link>
            <Pressable onPress={() => router.push({ pathname: "/pages/about", params: { id: "2" } })}>
                <Text>Go to About Page</Text>
            </Pressable>
            {/* <Link href="/pages/3" asChild>
                <Pressable>
                    <Text>Go to User 3</Text>
                </Pressable>
            </Link> */}
        </View>
    );
}
export default HomePage;