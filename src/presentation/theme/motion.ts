/** @format */

import {
  cubicBezier,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  Keyframe,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";

export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
export const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);

export const CSS_EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);
export const CSS_EASE_IN_OUT = cubicBezier(0.77, 0, 0.175, 1);

export const MOTION_DURATION = {
  press: 120,
  micro: 150,
  fast: 180,
  normal: 220,
  enter: 240,
  exit: 190,
  reveal: 280,
} as const;

export const MOTION_SPRING = {
  settle: {
    duration: 400,
    dampingRatio: 1,
    reduceMotion: ReduceMotion.System,
  },
  snapBack: {
    duration: 350,
    dampingRatio: 0.85,
    reduceMotion: ReduceMotion.System,
  },
  sheet: {
    duration: 300,
    dampingRatio: 0.85,
    reduceMotion: ReduceMotion.System,
  },
  dismiss: {
    duration: 280,
    dampingRatio: 1,
    overshootClamping: true,
    reduceMotion: ReduceMotion.System,
  },
  pop: {
    duration: 280,
    dampingRatio: 0.78,
    reduceMotion: ReduceMotion.System,
  },
} as const;

export function projectVelocity(velocity: number, decelerationRate = 0.998): number {
  "worklet";
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  "worklet";
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export const FADE_ENTER = FadeIn.duration(MOTION_DURATION.normal)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const FADE_EXIT = FadeOut.duration(170).easing(EASE_OUT).reduceMotion(ReduceMotion.System);

export const FADE_UP_ENTER = FadeInUp.duration(200)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const FADE_UP_EXIT = FadeOutUp.duration(160)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const FADE_DOWN_ENTER = FadeInDown.duration(190)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const FADE_DOWN_EXIT = FadeOutDown.duration(150)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const SOFT_POP_ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.92 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: EASE_OUT },
})
  .duration(160)
  .reduceMotion(ReduceMotion.System);

export const SOFT_POP_EXIT = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 0.92 }], easing: EASE_OUT },
})
  .duration(130)
  .reduceMotion(ReduceMotion.System);

export const REACTION_CAPSULE_ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 6 }, { scale: 0.92 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }], easing: EASE_OUT },
})
  .duration(MOTION_DURATION.fast)
  .reduceMotion(ReduceMotion.System);

export const REACTION_CAPSULE_EXIT = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
  100: { opacity: 0, transform: [{ translateY: 4 }, { scale: 0.94 }], easing: EASE_OUT },
})
  .duration(140)
  .reduceMotion(ReduceMotion.System);

export const MATCH_REVEAL_ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 14 }, { scale: 0.96 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }], easing: EASE_OUT },
})
  .duration(MOTION_DURATION.reveal)
  .reduceMotion(ReduceMotion.System);

export const MATCH_REVEAL_EXIT = new Keyframe({
  0: { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
  100: { opacity: 0, transform: [{ translateY: 10 }, { scale: 0.96 }], easing: EASE_OUT },
})
  .duration(200)
  .reduceMotion(ReduceMotion.System);

export const MATCH_STAGGER_1 = FadeInDown.duration(MOTION_DURATION.normal)
  .delay(40)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const MATCH_STAGGER_2 = FadeInDown.duration(MOTION_DURATION.normal)
  .delay(80)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const MATCH_STAGGER_3 = FadeInDown.duration(MOTION_DURATION.normal)
  .delay(120)
  .easing(EASE_OUT)
  .reduceMotion(ReduceMotion.System);

export const LIST_ITEM_REFLOW = LinearTransition.duration(MOTION_DURATION.fast)
  .easing(EASE_IN_OUT)
  .reduceMotion(ReduceMotion.System);
