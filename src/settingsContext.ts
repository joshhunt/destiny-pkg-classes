import { createContext, useContext } from "react";

export const DEFAULT_DISPLAY_HEX = false;

export function useSettings() {
  return useContext(SettingsContext);
}

export const SettingsContext = createContext({
  displayHex: DEFAULT_DISPLAY_HEX,
});
