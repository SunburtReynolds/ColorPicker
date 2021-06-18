import * as React from 'react';
import {useMemo} from 'react';
import {Dimensions, StyleSheet, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Hsl} from './types';
import {hslToHslaString} from './utils';

const ovalInitWidthPercent = 70;

const hueShift = 360 / 5;
const width = Dimensions.get('window').width;
const ovalHeight = (width * ovalInitWidthPercent) / 100;
const ovalShift = ovalHeight / 5;
const dotWidth = width / 8;
const dotStyle = {
  width: dotWidth,
  aspectRatio: 1,
  borderRadius: dotWidth / 2,
};

const Dot: React.FC<{hsl: Hsl; onPress: (hue: number) => void}> = ({
  hsl,
  onPress,
}) => {
  const color = hslToHslaString(hsl);
  return (
    <TouchableOpacity
      onPress={() => onPress(hsl.h)}
      style={[styles.dot, dotStyle, {backgroundColor: color}]}
    />
  );
};

export const ComplementaryColors: React.FC<{
  currentHsl: Hsl;
  onPressColor: (newHue: number) => void;
}> = ({currentHsl, onPressColor}) => {
  const color = hslToHslaString(currentHsl, 0.25);

  const colorScheme: Hsl[] = useMemo(() => {
    const array = new Array(5).fill(undefined);
    return array.map<Hsl>((_, i) => ({
      ...currentHsl,
      h: currentHsl.h + i * hueShift,
    }));
  }, [currentHsl]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View
          style={[styles.oval, {top: -ovalShift, backgroundColor: color}]}
        />
        <View style={styles.dotRow}>
          {colorScheme.map((hsl, i) => (
            <Dot hsl={hsl} key={i} onPress={onPressColor} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    marginTop: 96,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 120,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oval: {
    position: 'absolute',
    width: `${ovalInitWidthPercent}%`,
    aspectRatio: 1,
    borderRadius: 10000,
    transform: [{scaleX: 3}],
    backgroundColor: 'red',
  },
  dotRow: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 64,
    height: 64,
    shadowColor: 'black',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
