import { Tabs } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";

const RootLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{headerTitle: "Home", }} />
      <Tabs.Screen name="mainpage" options={{headerTitle: "back", headerShown: false}} />
      <Tabs.Screen name="about" options={{headerTitle: "About", headerShown: false}} />
      <Tabs.Screen name="saved" options={{headerTitle: "Saved", headerShown: false}} />
    </Tabs>
  );
};

export default RootLayout;