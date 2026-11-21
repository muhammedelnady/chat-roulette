/** @format */

import type { IConnectivityChecker } from "@/src/domain/repositories";
import { ConnectivityAdapter } from "@/src/infrastructure/adapters/ConnectivityAdapter";
import { selectIsOnline, useConnectivityStore } from "@stores/useConnectivityStore";

const connectivityChecker: IConnectivityChecker = new ConnectivityAdapter(
  () => selectIsOnline(useConnectivityStore.getState()),
  (callback) => {
    let prev = selectIsOnline(useConnectivityStore.getState());
    return useConnectivityStore.subscribe((state) => {
      const next = selectIsOnline(state);
      if (next !== prev) {
        prev = next;
        callback(next);
      }
    });
  }
);

export const connectivityModule = {
  getConnectivityChecker: (): IConnectivityChecker => connectivityChecker,
};
