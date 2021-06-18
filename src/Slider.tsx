import * as React from 'react';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {Hsl} from './types';
import {clamp, hslToHslaString} from './utils';

export const Slider: React.FC<{
  currentHsl: Hsl;
  value: {value: number};
  onEndGesture: () => void;
}> = ({currentHsl, value, onEndGesture}) => {
  const [sliderLength, setSliderLength] = useState(100);

  const color = hslToHslaString(currentHsl);

  const transformStyle = useAnimatedStyle(() => {
    const tx = interpolate(
      value.value,
      [0, 1],
      [-sliderLength, 0],
      Extrapolate.CLAMP,
    );
    // account for slight overlap of tab
    return {
      transform: [{translateX: tx + 12}],
    };
  }, [sliderLength]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {startX: number}
  >(
    {
      onStart: (_, ctx) => {
        ctx.startX = value.value * sliderLength;
      },
      onActive: (event, ctx) => {
        const {translationX} = event;
        const newX = ctx.startX + translationX;
        const newValue = clamp(newX / sliderLength, 0, 1);
        value.value = newValue;
      },
      onEnd: () => {
        runOnJS(onEndGesture)();
      },
    },
    [sliderLength],
  );

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="lightbulb" color={color} size={18} />
      <View
        style={styles.neckContainer}
        onLayout={({
          nativeEvent: {
            layout: {width},
          },
        }) => setSliderLength(width)}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={['black', color]}
          style={styles.neck}
        />
        <PanGestureHandler onGestureEvent={gestureHandler} minDist={1}>
          <Animated.View
            style={[styles.tab, transformStyle, {backgroundColor: color}]}
          />
        </PanGestureHandler>
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
    marginHorizontal: 16,
  },
  neck: {
    flex: 1,
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
  },
});
