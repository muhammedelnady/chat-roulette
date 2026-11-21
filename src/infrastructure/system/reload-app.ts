/** @format */

import { DevSettings } from "react-native";

export function reloadApp(): void {
  DevSettings.reload();
}
