import HsvColorCircle from '@assets/hsv-color-circle';
import {StackNavigationProp} from '@react-navigation/stack';
import * as React from 'react';
import {View} from 'react-native';
import {Item} from 'react-navigation-header-buttons';

import {HeaderButtons} from './HeaderButtons';
import {RootStackParamList} from './types';

type ColorPickerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ColorPicker'
>;

type Props = {
  navigation: ColorPickerScreenNavigationProp;
};

const tempColor = 'red';

export const ColorPicker: React.FC<Props> = ({navigation}) => {
  const saveColor = React.useCallback(() => {
    // TODO
    navigation.pop();
  }, [navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      // TODO - use picked color
      headerTintColor: tempColor,
      headerRight: () => (
        <HeaderButtons>
          <Item
            title="Save"
            iconName="content-save"
            color={tempColor}
            onPress={saveColor}
          />
        </HeaderButtons>
      ),
    });
  }, [navigation, saveColor]);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <HsvColorCircle width={100} height={100} />
    </View>
  );
};
