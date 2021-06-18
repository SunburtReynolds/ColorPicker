import * as React from 'react';
import {StyleSheet, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {Hsl} from './types';
import {hslToHslaString} from './utils';

export const Slider: React.FC<{
  currentHsl: Hsl;
  onEndGesture: (hsl: Hsl) => void;
}> = ({currentHsl, onEndGesture}) => {
  const color = hslToHslaString(currentHsl);
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="lightbulb" color={color} size={18} />
      <View style={styles.neckContainer}>
        <View style={[styles.neck, {backgroundColor: color}]} />
        <View style={[styles.tab, {backgroundColor: color}]} />
      </View>
      <MaterialCommunityIcons
        name="lightbulb-on-outline"
        color={color}
        size={24}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '60%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neckContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  neck: {
    flex: 1,
    marginHorizontal: 12,
    height: 4,
    backgroundColor: 'pink',
  },
  tab: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    backgroundColor: 'teal',
  },
});
