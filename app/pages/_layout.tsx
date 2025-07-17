import { Tabs } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";
import { Ionicons } from '@expo/vector-icons';

const RootLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{
        headerTitle: "Home",
        headerShown: false,
       }} />
      <Tabs.Screen name="mainpage" options={{
        headerTitle: "back",
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
      }} />
      <Tabs.Screen name="saved" options={{
        headerTitle: "Saved",
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" color={color} size={size} />
          ),
      }} />
      <Tabs.Screen name="about" options={{
        headerTitle: "About",
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" color={color} size={size} />
          ),
      }} />
    </Tabs>
  );
};

export default RootLayout;