import {StackNavigationProp} from '@react-navigation/stack';
import * as React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {HeaderButtons} from './HeaderButtons';
import {RootStackParamList} from './types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export const HomeScreen: React.FC<Props> = ({navigation}) => {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderButtons>
          <Item
            title="Add"
            iconName="eyedropper-plus"
            onPress={() => navigation.push('ColorPicker')}
          />
        </HeaderButtons>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
