import { Stack } from "expo-router";
import HomePage from ".";
import { HeaderTitle } from "@react-navigation/elements";

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerTitle: "Home"}} />
      <Stack.Screen name="pages/about" options={{headerTitle: "About"}} />
      <Stack.Screen name="pages/mainpage" options={{headerTitle: "Main Page"}} />
    </Stack>
  );
};

export default RootLayout;