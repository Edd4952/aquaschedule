import { Text, View, Image } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>test.</Text>
      <Image
        source={{
          uri: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F443446%2Fpexels-photo-443446.jpeg%3Fcs%3Dsrgb%26dl%3Ddaylight-forest-glossy-443446.jpg%26fm%3Djpg&f=1&ipt=277bd0f837b4737f2d0eff0600848fafaaa4969c15472590deb08b1eb7cfa813",
        }}
        style={{ width: 128, height: 128, marginTop: 20 }}
      />
    </View>
  );
}
