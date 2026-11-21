/** @format */
/**
 * React Native Keyboard Controller
 */

import { View } from "react-native";

export const KeyboardAvoidingView = View;
export const KeyboardAwareScrollView = View;
export const KeyboardController = {
  setInputMode: jest.fn(),
  setDefaultMode: jest.fn(),
};
export const useKeyboardHandler = jest.fn();
