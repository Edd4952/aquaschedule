import { Tabs } from "expo-router";
import { HeaderTitle } from "@react-navigation/elements";

const RootLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{headerTitle: "Home"}} />
      <Tabs.Screen name="pages/mainpage" options={{headerTitle: "Main Page"}} />
      <Tabs.Screen name="pages/about" options={{headerTitle: "About"}} />
    </Tabs>
  );
};

export default RootLayout;