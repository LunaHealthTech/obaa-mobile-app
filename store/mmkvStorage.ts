import { MMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

// @ts-ignore
export const storage = new MMKV({ id: "obaa-store" });

export const zustandMMKVStorage: StateStorage = {
  getItem: (key) => storage.getString(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
