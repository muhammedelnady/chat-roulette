/** @format */
/**
 * React Native Keyboard Controller
 */

import type { ReactNode } from "react";
import { View } from "react-native";

export const KeyboardProvider = ({ children }: { children?: ReactNode }) => children;
export const KeyboardAvoidingView = View;
export const KeyboardAwareScrollView = View;
export const KeyboardController = {
  setInputMode: jest.fn(),
  setDefaultMode: jest.fn(),
  dismiss: jest.fn().mockResolvedValue(undefined),
};
export const useKeyboardHandler = jest.fn();
