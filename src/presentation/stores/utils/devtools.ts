/** @format */

export function devtoolsConfig(name: string) {
  return { name, enabled: __DEV__ } as const;
}
