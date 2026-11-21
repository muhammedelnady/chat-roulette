/** @format */
/**
 * Infrastructure Connectivity Adapter
 */

import type { IConnectivityChecker } from "@/src/domain/repositories";

export class ConnectivityAdapter implements IConnectivityChecker {
  constructor(
    private readonly getIsConnected: () => boolean = () => true,
    private readonly subscribeConnectivity?: (cb: (isConnected: boolean) => void) => () => void
  ) {}

  isConnected(): boolean {
    return this.getIsConnected();
  }

  observeConnectivity(callback: (isConnected: boolean) => void): () => void {
    if (!this.subscribeConnectivity) return () => {};
    return this.subscribeConnectivity(callback);
  }
}
