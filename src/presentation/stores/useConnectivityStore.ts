/** @format */

import { devtools } from "@csark0812/zustand-expo-devtools";
import type { NetInfoState } from "@react-native-community/netinfo";
import NetInfo, { NetInfoStateType } from "@react-native-community/netinfo";
import { create } from "zustand";

import { devtoolsConfig } from "./utils/devtools";

export interface ConnectivityState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: NetInfoStateType;
  details: NetInfoState["details"];
  demoOfflineOverride: boolean;

  updateConnectivity: (state: NetInfoState) => void;
  setDemoOfflineOverride: (offline: boolean) => void;
  subscribe: () => () => void;
}

export const useConnectivityStore = create<ConnectivityState>()(
  devtools(
    (set, get) => ({
      isConnected: true,
      isInternetReachable: true,
      connectionType: NetInfoStateType.wifi,
      details: null,
      demoOfflineOverride: false,

      updateConnectivity: (state: NetInfoState) => {
        set(
          {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
            connectionType: state.type,
            details: state.details,
          },
          false,
          "updateConnectivity"
        );
      },

      setDemoOfflineOverride: (offline: boolean) => {
        set({ demoOfflineOverride: offline }, false, "setDemoOfflineOverride");
        if (!offline) {
          void NetInfo.fetch()
            .then((state) => {
              if (!get().demoOfflineOverride) {
                get().updateConnectivity(state);
              }
            })
            .catch(() => {});
        }
      },

      subscribe: () => {
        void NetInfo.fetch()
          .then((state) => {
            if (get().demoOfflineOverride) return;
            get().updateConnectivity(state);
          })
          .catch(() => {});

        const unsubscribe = NetInfo.addEventListener((state) => {
          if (get().demoOfflineOverride) return;
          get().updateConnectivity(state);
        });

        return unsubscribe;
      },
    }),
    devtoolsConfig("ConnectivityStore")
  )
);

export const selectIsOnline = (state: ConnectivityState) =>
  !state.demoOfflineOverride && state.isConnected && state.isInternetReachable !== false;

export const selectConnectionType = (state: ConnectivityState) => state.connectionType;
export const useIsOnline = () => useConnectivityStore(selectIsOnline);
export const useConnectionType = () => useConnectivityStore(selectConnectionType);
