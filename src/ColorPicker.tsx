import HsvColorCircle from '@assets/hsv-color-circle';
import {StackNavigationProp} from '@react-navigation/stack';
import * as React from 'react';
import {PanResponder, StyleSheet, View} from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
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
// TODO use onLayout to measure wheel width
const r = 124;

//const isEpsilon = (num: number): boolean => {
//'worklet';
//Math.abs(num) <= 1e-10;
//};

const clamp = (num: number, min: number, max: number): number => {
  'worklet';
  return Math.min(Math.max(num, min), max);
};

//https://github.com/irojs/iro-core/blob/typescript/src/color.ts#L265
const hsvToHsl = (hsv: {h: number; s: number; v: number}) => {
  'worklet';
  const l = (2 - hsv.s) * hsv.v;
  const divisor = l <= 1 ? l : 2 - l;
  // Avoid division by zero when lightness is close to zero
  const saturation = divisor < 1e-9 ? 0 : (hsv.s * hsv.v) / divisor;
  return {
    h: hsv.h,
    s: clamp(saturation, 0, 1),
    l: clamp(l * 0.5, 0, 1),
  };
};

export const ColorPicker: React.FC<Props> = ({navigation}) => {
  // TODO initialize to selected value from params if exist
  // coordinates of center of puck
  const puckCoords = useSharedValue({x: 0, y: 0});
  // range 0 to 360 deg
  const hue = useSharedValue(0);
  // range 0 to 1
  const saturation = useSharedValue(0);
  // range 0 to 1
  const value = useSharedValue(1);
  //// angle of puck coords
  //// flip y so that coodinate system is easier to grok
  //// TODO flip?
  ////const flippedY = -y;
  //// rotate angle by PI/2 rad so that red color lines up with 0 rad
  //// TODO rotate when calculating hue
  //console.log('theta', t);
  //return t;
  //});
  // x y coordinates of puck after accounting for wheel size
  //const clampedCoords = useDerivedValue(() => {
  //const t = theta.value;
  //const {x, y} = puckCoords.value;
  //const pr = puckR.value;

  //console.log('clamp', pr, r, x, y, t);
  //if (pr <= r) {
  //return {x, y};
  //}
  //const yPrime = r * Math.sin(t);
  //const xPrime = r * Math.cos(t);
  //return {x: xPrime, y: yPrime};
  //});

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {start: {x: number; y: number}}
  >({
    onStart: (_, ctx) => {
      ctx.start = puckCoords.value;
    },
    onActive: (event, ctx) => {
      let newX = ctx.start.x + event.translationX;
      let newY = ctx.start.y + event.translationY;

      // calculate distance from center of puck to center of wheel
      const puckR = Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2));
      // calculate angle in screen coordinate system (down is +y axis)
      const t = Math.atan2(newY, newX);
      // begin to calculate hue angle by flipping y axis first
      let h = Math.atan2(-newY, newX);
      // then rotate by a quarter so 0rad is top of screen
      h = h - Math.PI / 2;
      // keep it all positive (atan2 range in -PI to PI)
      if (h < 0) {
        h = h + 2 * Math.PI;
      }
      // to degrees
      h = (h * 180) / Math.PI;
      // clamp coordinates within wheel
      if (puckR > r) {
        newY = r * Math.sin(t);
        newX = r * Math.cos(t);
      }
      // saturation from 0 to 1
      const s = clamp(puckR / r, 0, 1);

      console.log('puckR', puckR);
      console.log('s', s);
      console.log('h', h);
      console.log('t', t);
      console.log('new', newX, newY);

      saturation.value = s;
      hue.value = h;
      puckCoords.value = {
        x: newX,
        y: newY,
      };
    },
    //onEnd: (event, _) => {
    //puckCoords.value = {x: event.x, y: event.y};
    //},
  });

  const puckStyle = useAnimatedStyle(() => {
    //const {x, y} = clampedCoords.value;
    const {x, y} = puckCoords.value;
    const rawHsl = hsvToHsl({
      h: hue.value,
      s: saturation.value,
      v: value.value,
    });
    console.log(rawHsl);
    console.log(
      'hsl',
      `hsl(${rawHsl.h}, ${rawHsl.s * 100}, ${rawHsl.l * 100})`,
    );

    return {
      backgroundColor: `hsl(${rawHsl.h}, ${rawHsl.s * 100}%, ${
        rawHsl.l * 100
      }%)`,
      transform: [{translateX: x}, {translateY: y}],
    };
  });

  //const pan = useRef(new Animated.ValueXY()).current;

  //const panResponder = useRef(
  //PanResponder.create({
  //onMoveShouldSetPanResponder: () => true,
  //onPanResponderGrant: () => {
  //console.log('responder granted');
  ////pan.setOffset({
  ////x: pan.x._value,
  ////y: pan.y._value,
  ////});
  //},
  //onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}], {
  //useNativeDriver: false,
  //}),
  //onPanResponderRelease: () => {
  //pan.extractOffset();
  //},
  //}),
  //).current;

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
              style={{transform: [{scaleX: -1}]}}
            />
            <PanGestureHandler onGestureEvent={gestureHandler} minDist={1}>
              <Animated.View style={[styles.puck, puckStyle]} />
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
  wheelWrapper: {},
  puck: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: 'white',
  },
});
