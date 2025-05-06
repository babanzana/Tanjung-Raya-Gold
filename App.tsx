// // App.tsx
// import { StatusBar } from "expo-status-bar";
// import { useEffect, useState } from "react";
// import * as SplashScreen from "expo-splash-screen";
// import { Provider as PaperProvider } from "react-native-paper";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { LoginContainer } from "./src/features/login/login.container";
// import { RegisterContainer } from "./src/features/register/register.container";
// import { BottomTabNavigator } from "./src/navigation/bottom-tab-navigator";
// import { AdminTabNavigator } from "./src/navigation/admin-tab-navigator";
// import { ErrorBoundary } from "./src/component/error-boundary/error-boundary.component";
// import { Auth, getAuth, onAuthStateChanged } from "firebase/auth";

// const auth: Auth = getAuth();
// const Stack = createStackNavigator();

// SplashScreen.preventAutoHideAsync();

// export default function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [appIsReady, setAppIsReady] = useState(false);
//   const [initializing, setInitializing] = useState(true);

//   // Handle auth state changes
//   useEffect(() => {
//     const authSubscriber = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setIsLoggedIn(true);
//         setIsAdmin(user.email === "kejax80@gmail.com");
//       } else {
//         setIsLoggedIn(false);
//         setIsAdmin(false);
//       }

//       // Hapus pengecekan initializing di sini
//       if (initializing) setInitializing(false);
//     });

//     // Unsubscribe saat komponen unmount
//     return () => authSubscriber();
//   }, [initializing]); // Hanya menjalankan efek saat initializing berubah

//   // Prepare app (splash screen)
//   useEffect(() => {
//     const prepare = async () => {
//       try {
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//       } finally {
//         setAppIsReady(true);
//         await SplashScreen.hideAsync();
//       }
//     };

//     prepare();
//   }, []);

//   if (!appIsReady || initializing) {
//     return null;
//   }

//   return (
//     <PaperProvider>
//       <ErrorBoundary>
//         <NavigationContainer>
//           <Stack.Navigator>
//             {isLoggedIn ? (
//               isAdmin ? (
//                 <Stack.Screen
//                   name="AdminApp"
//                   component={AdminTabNavigator}
//                   options={{ headerShown: false }}
//                 />
//               ) : (
//                 <Stack.Screen
//                   name="MainApp"
//                   component={BottomTabNavigator}
//                   options={{ headerShown: false }}
//                 />
//               )
//             ) : (
//               <>
//                 <Stack.Screen
//                   name="Login"
//                   component={LoginContainer}
//                   options={{
//                     title: "Tanjung Raya Gold",
//                     headerLeft: () => null, // Menghilangkan back button
//                     gestureEnabled: false, // Menonaktifkan swipe back
//                   }}
//                 />
//                 <Stack.Screen
//                   name="Register"
//                   component={RegisterContainer}
//                   options={{ title: "Register" }}
//                 />
//               </>
//             )}
//           </Stack.Navigator>
//         </NavigationContainer>
//         <StatusBar style="auto" />
//       </ErrorBoundary>
//     </PaperProvider>
//   );
// }

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
import { AdminTabNavigator } from "./src/navigation/admin-tab-navigator";
import { ErrorBoundary } from "./src/component/error-boundary/error-boundary.component";
import { auth } from "./firebase"; // Pastikan auth sudah diimpor dengan benar
import { onAuthStateChanged } from "firebase/auth"; // Menggunakan Firebase auth

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  // Handle auth state changes
  useEffect(() => {
    const authSubscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setIsAdmin(user.email === "kejax80@gmail.com");
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }

      setAppIsReady(true); // Update status saat auth selesai diperiksa
    });

    // Unsubscribe saat komponen unmount
    return () => authSubscriber();
  }, []); // Efek hanya berjalan sekali ketika komponen dimounting

  // Prepare app (splash screen)
  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } finally {
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!appIsReady) {
    return null; // Show splash screen until app is ready
  }

  return (
    <PaperProvider>
      <ErrorBoundary>
        <NavigationContainer>
          <Stack.Navigator>
            {isLoggedIn ? (
              isAdmin ? (
                <Stack.Screen
                  name="AdminApp"
                  component={AdminTabNavigator}
                  options={{ headerShown: false }}
                />
              ) : (
                <Stack.Screen
                  name="MainApp"
                  component={BottomTabNavigator}
                  options={{ headerShown: false }}
                />
              )
            ) : (
              <>
                <Stack.Screen
                  name="Login"
                  component={LoginContainer}
                  options={{
                    title: "Tanjung Raya Gold",
                    headerLeft: () => null, // Menghilangkan back button
                    gestureEnabled: false, // Menonaktifkan swipe back
                  }}
                />
                <Stack.Screen
                  name="Register"
                  component={RegisterContainer}
                  options={{ title: "Register" }}
                />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </ErrorBoundary>
    </PaperProvider>
  );
}
