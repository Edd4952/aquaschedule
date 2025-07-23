import { Stack } from "expo-router";
import HomePage from ".";
import { HeaderTitle } from "@react-navigation/elements";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '../hooks/useColorScheme';
import { useFonts } from 'expo-font';



const RootLayout = () => {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{headerTitle: "AquaSchedule"}} />
      </Stack>
    </ThemeProvider>
  );
};

export default RootLayout;