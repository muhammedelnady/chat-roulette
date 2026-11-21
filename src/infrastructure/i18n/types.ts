/** @format */

import type en from "./langs/en.json";

export type TxKeyPath = RecursiveKeyOf<typeof en>;

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends (infer TItem)[]
    ? TItem extends object
      ? `${TKey}` | `${TKey}.${number}` | `${TKey}.${number}.${RecursiveKeyOf<TItem>}`
      : `${TKey}` | `${TKey}.${number}`
    : TObj[TKey] extends object
      ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
      : `${TKey}`;
}[keyof TObj & (string | number)];
