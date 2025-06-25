import { Tabs } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";

const RootLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{headerTitle: "Home"}} />
      <Tabs.Screen name="about" options={{headerTitle: "About", headerShown: false}} />
      <Tabs.Screen name="mainpage" options={{headerTitle: "Main Page", headerShown: false}} />
    </Tabs>
  );
};

export default RootLayout;