import { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  try {
    return <>{children}</>;
  } catch (error) {
    setHasError(true);
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Something went wrong</Text>
      </View>
    );
  }
}
