/** @format */

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { KeyboardController } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export interface KeyboardDismissAreaProps {
  readonly children: ReactNode;
}

const dismissKeyboard = () => {
  void KeyboardController.dismiss();
};

export function KeyboardDismissArea({ children }: KeyboardDismissAreaProps) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const wasActive = useSharedValue(false);

  const pan = usePanGesture({
    activeOffsetY: [-10, 10],
    enabled: isKeyboardVisible,
    onBegin: () => {
      wasActive.set(false);
    },
    onUpdate: () => {
      wasActive.set(true);
    },
    onDeactivate: () => {
      if (wasActive.get()) {
        scheduleOnRN(dismissKeyboard);
      }
    },
  });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}
