import HsvColorCircle from '@assets/hsv-color-circle';
import {StackNavigationProp} from '@react-navigation/stack';
import * as React from 'react';
import {useLayoutEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Item} from 'react-navigation-header-buttons';

import {HeaderButtons} from './HeaderButtons';
import {Coordinates, Hsl, Hsv, RootStackParamList} from './types';
import {deriveCoordsFromHsv, hslToHslaString, hsvToHsl, onMove} from './utils';

type ColorPickerScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ColorPicker'
>;

type Props = {
  navigation: ColorPickerScreenNavigationProp;
};

const initialColor: Hsv = {h: 340, s: 0.83, v: 1};

// TODO initialize to selected value from params if exist

export const ColorPicker: React.FC<Props> = ({navigation}) => {
  // coordinates of center of puck
  const puckCoords = useSharedValue<Coordinates>({x: 0, y: 0});
  // range 0 to 360 deg
  const hue = useSharedValue(0);
  // range 0 to 1
  const saturation = useSharedValue(0);
  // range 0 to 1
  const value = useSharedValue(1);
  // range 0.9 to 1
  const ringScale = useSharedValue(1);

  const transformStyle = useAnimatedStyle(() => {
    const {x, y} = puckCoords.value;
    return {
      transform: [{translateX: x}, {translateY: y}],
    };
  });

  const ringStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: ringScale.value}],
    };
  });

  const [wheelRadius, setWheelRadius] = useState(100);
  const [hsl, setHsl] = useState<Hsl>(hsvToHsl(initialColor));

  // once wheelRadius has been measured, set coords
  useLayoutEffect(() => {
    const coords = deriveCoordsFromHsv(initialColor, wheelRadius);
    puckCoords.value = coords;
  }, [wheelRadius]);

  const saveColor = React.useCallback(() => {
    // TODO
    navigation.pop();
  }, [navigation]);

  useLayoutEffect(() => {
    const color = hslToHslaString(hsl);
    navigation.setOptions({
      headerTintColor: color,
      headerRight: () => (
        <HeaderButtons>
          <Item
            title="Save"
            iconName="content-save"
            color={color}
            onPress={saveColor}
          />
        </HeaderButtons>
      ),
    });
  }, [navigation, saveColor, hsl]);

  const onEndGesture = (hsl: Hsl) => setHsl(hsl);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {start: Coordinates}
  >(
    {
      onStart: (_, ctx) => {
        ctx.start = puckCoords.value;
      },
      onActive: (event, ctx) => {
        const {translationX, translationY} = event;
        // animate rings
        const distanceMoved = Math.sqrt(
          Math.pow(translationX, 2) + Math.pow(translationY, 2),
        );
        const scale = interpolate(
          distanceMoved,
          [0, wheelRadius * 2],
          [1, 0.9],
        );
        console.log('scale', distanceMoved, scale);
        ringScale.value = scale;

        // update puck and color
        const {newCoords, hsv} = onMove(
          ctx.start,
          {x: translationX, y: translationY},
          wheelRadius,
        );

        saturation.value = hsv.s;
        hue.value = hsv.h;
        puckCoords.value = newCoords;
      },
      onEnd: () => {
        ringScale.value = withSpring(1, {
          stiffness: 300,
          damping: 12,
          restSpeedThreshold: 0.02,
        });

        const hsl = hsvToHsl({
          h: hue.value,
          s: saturation.value,
          v: value.value,
        });

        runOnJS(onEndGesture)(hsl);
      },
    },
    [wheelRadius],
  );

  return (
    <View style={styles.container}>
      <View style={styles.wheelContainer}>
        <Animated.View
          style={[
            styles.outerRing,
            ringStyle,
            {backgroundColor: hslToHslaString(hsl, 0.25)},
          ]}>
          <Animated.View
            style={[
              styles.innerRing,
              ringStyle,
              {backgroundColor: hslToHslaString(hsl, 0.9)},
            ]}
          />
        </Animated.View>
        <View style={styles.wheelWrapper}>
          <HsvColorCircle
            width="100%"
            height="100%"
            style={styles.wheel}
            onLayout={({
              nativeEvent: {
                layout: {width},
              },
            }) => setWheelRadius(Math.round(width / 2))}
          />
          <PanGestureHandler onGestureEvent={gestureHandler} minDist={1}>
            <Animated.View
              style={[
                styles.puck,
                transformStyle,
                {backgroundColor: hslToHslaString(hsl)},
              ]}
            />
          </PanGestureHandler>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'flex-start'},
  wheelContainer: {
    position: 'relative',
    marginTop: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    aspectRatio: 1,
  },
  outerRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    width: '100%',
    height: '100%',
    borderRadius: 10000,
    opacity: 0.25,
  },
  innerRing: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 10000,
    opacity: 0.5,
  },
  wheelWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    aspectRatio: 1,
    padding: 32,
  },
  wheel: {transform: [{scaleX: -1}]},
  puck: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: 'white',
  },
});
