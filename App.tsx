/**
 * React Native Color Picker
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * Author: Jon Reynolds
 */

import 'react-native-gesture-handler';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {ColorPicker} from './src/ColorPicker';
import {HomeScreen} from './src/Home';

const Stack = createStackNavigator();

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{title: 'Home'}}
          />
          <Stack.Screen
            name="ColorPicker"
            component={ColorPicker}
            options={{title: 'Color Picker'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
