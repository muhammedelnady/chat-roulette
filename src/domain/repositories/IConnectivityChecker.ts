/** @format */
/**
 * Domain IConnectivity Checker
 */

export interface IConnectivityChecker {
  isConnected(): boolean;
  observeConnectivity?(callback: (isConnected: boolean) => void): () => void;
}
