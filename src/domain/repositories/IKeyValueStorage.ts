/** @format */
/**
 * Domain Key Value Storage Interface
 */

export interface IKeyValueStorage {
  getString(key: string): string | undefined;
  setString(key: string, value: string): void;
  getNumber(key: string): number | undefined;
  setNumber(key: string, value: number): void;
  getBoolean(key: string): boolean | undefined;
  setBoolean(key: string, value: boolean): void;
  delete(key: string): void;
  clearAll(): void;
  getAllKeys(): string[];
  contains(key: string): boolean;
}
