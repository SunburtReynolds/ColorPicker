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
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Item} from 'react-navigation-header-buttons';

import {HeaderButtons} from './HeaderButtons';
import {Coordinates, Hsv, RootStackParamList} from './types';
import {deriveCoordsFromHsv, hsvToHsl, onMove} from './utils';

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

  const transformStyle = useAnimatedStyle(() => {
    const {x, y} = puckCoords.value;
    return {
      transform: [{translateX: x}, {translateY: y}],
    };
  });

  const [wheelRadius, setWheelRadius] = useState(100);
  const [color, setColor] = useState(hsvToHsl(initialColor));

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
  }, [navigation, saveColor, color]);

  const onEndGesture = (c: string) => setColor(c);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {start: Coordinates}
  >(
    {
      onStart: (_, ctx) => {
        ctx.start = puckCoords.value;
      },
      onActive: (event, ctx) => {
        const {newCoords, hsv} = onMove(
          ctx.start,
          {x: event.translationX, y: event.translationY},
          wheelRadius,
        );

        saturation.value = hsv.s;
        hue.value = hsv.h;
        puckCoords.value = newCoords;
      },
      onEnd: () => {
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
        <View
          style={[
            styles.wheelOuterCircle,
            {
              borderRadius: 10000,
              transform: [{scale: 1}],
            },
          ]}>
          <View
            style={[
              styles.wheelInnerCircle,
              {
                borderRadius: 10000,
                transform: [{scale: 1}],
              },
            ]}>
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
                style={[styles.puck, transformStyle, {backgroundColor: color}]}
              />
            </PanGestureHandler>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'flex-start'},
  wheelContainer: {
    marginTop: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    aspectRatio: 1,
  },
  wheelOuterCircle: {
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    width: '100%',
    height: '100%',
  },
  wheelInnerCircle: {
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    width: '100%',
    height: '100%',
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
