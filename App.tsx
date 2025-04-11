// App.tsx
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginContainer } from "./src/features/login/login.container";
import { RegisterContainer } from "./src/features/register/register.container";
import { BottomTabNavigator } from "./src/navigation/bottom-tab-navigator";
import { View, Text } from "react-native";
import { AdminTabNavigator } from "./src/navigation/admin-tab-navigator";

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

function ErrorBoundary({ children }: { children: React.ReactNode }) {
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <PaperProvider>
      <ErrorBoundary>
        <NavigationContainer>
          <Stack.Navigator>
            {isLoggedIn ? (
              // <Stack.Screen
              //   name="MainApp"
              //   component={BottomTabNavigator}
              //   options={{ headerShown: false }}
              // />
              <Stack.Screen
                name="MainApp"
                component={AdminTabNavigator}
                options={{ headerShown: false }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginContainer}
                  options={{ title: "Tanjung Raya Gold" }}
                />
                <Stack.Screen name="Register" component={RegisterContainer} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </ErrorBoundary>
    </PaperProvider>
  );
}
