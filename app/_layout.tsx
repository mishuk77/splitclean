import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import { initDatabase } from '../src/db/database';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { useGroupStore } from '../src/store/useGroupStore';
import { Colors } from '../src/constants/colors';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [dbReady, setDbReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadGroups = useGroupStore((s) => s.loadGroups);
  const theme = useSettingsStore((s) => s.settings.theme);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        await loadSettings();
        await loadGroups();
        setDbReady(true);
      } catch (e) {
        console.error('Failed to initialize database:', e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  if (!loaded || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background }}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const systemTheme = require('react-native').useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
  const colors = isDark ? Colors.dark : Colors.light;

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.card,
          primary: colors.accent,
          text: colors.textPrimary,
          border: colors.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.card,
          primary: colors.accent,
          text: colors.textPrimary,
          border: colors.border,
        },
      };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="group/[id]"
          options={{
            headerShown: true,
            headerBackTitle: 'Groups',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="expense/add"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Add Expense',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="expense/itemized"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Itemized Split',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.textPrimary,
          }}
        />
        <Stack.Screen
          name="pro"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'SplitClean Pro',
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.textPrimary,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
