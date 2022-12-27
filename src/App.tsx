import { useCallback, useMemo, useState } from "react";
import "./App.css";
import _allData from "./data.json";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import ClassHashSearch from "./ClashHashSearch";
import { DEFAULT_DISPLAY_HEX, SettingsContext } from "./settingsContext";
import { Link, useRoute } from "wouter";
import HashCalculator from "./HashCalculator";

const STICKY_HEADER_ROW = {
  classRef: "STICKY_HEADER_ROW",
  lowerClassRef: "",
  flippedLowerClassRef: "",
  stride: -1,
};

const allData = _allData.map((v) => {
  const lowerClassRef = v.classRef.toLowerCase();
  return {
    ...v,
    lowerClassRef,
    flippedLowerClassRef: (lowerClassRef.match(/.{1,2}/g) ?? [])
      .reverse()
      .join(""),
  };
});

function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (newValue: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const lsRawValue = localStorage.getItem(key);
    if (!lsRawValue) {
      return defaultValue;
    }

    return JSON.parse(lsRawValue).value;
  });

  const setLsValue = useCallback(
    (value: T) => {
      setValue(value);
      localStorage.setItem(key, JSON.stringify({ value }));
    },
    [key]
  );

  return [value, setLsValue];
}

function swap32(val: number) {
  return (
    ((val & 0xff) << 24) |
    ((val & 0xff00) << 8) |
    ((val >> 8) & 0xff00) |
    ((val >> 24) & 0xff)
  );
}

function App() {
  const [matchHashCalculator] = useRoute("/hash-calculator");

  const [searchValue, setSearchValue] = useLocalStorageState("searchValue", "");
  const [displayHex, setDisplayHex] = useLocalStorageState(
    "displayHex",
    DEFAULT_DISPLAY_HEX
  );

  const settings = useMemo(() => ({ displayHex }), [displayHex]);

  const handleDisplayHexChange = (event: any, newValue: boolean) => {
    setDisplayHex(newValue);
  };

  const results = useMemo(() => {
    if (!searchValue || searchValue.length === 0) {
      return [STICKY_HEADER_ROW, ...allData];
    }

    const cleanedInput = searchValue.replace(/\s/g, "").toLowerCase();

    const inputIsPartialBeHex = cleanedInput;
    const inputIsInt = swap32(parseInt(cleanedInput, 10)).toString(16);
    const inputIsLeHex = swap32(parseInt(cleanedInput, 16)).toString(16);

    const res = allData.filter((v) => {
      const { lowerClassRef, flippedLowerClassRef } = v;

      if (
        lowerClassRef === inputIsInt ||
        lowerClassRef === inputIsPartialBeHex ||
        lowerClassRef === inputIsLeHex
      ) {
        return true;
      }

      return (
        lowerClassRef.includes(inputIsPartialBeHex) ||
        flippedLowerClassRef.includes(inputIsPartialBeHex)
      );
    });

    res.unshift(STICKY_HEADER_ROW);

    return res;
  }, [searchValue]);

  const theme = createTheme({
    typography: {
      fontFamily: ["Roboto Mono", "monospace"].join(","),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <SettingsContext.Provider value={settings}>
        <div className="App">
          {matchHashCalculator ? (
            <HashCalculator />
          ) : (
            <ClassHashSearch
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              results={results}
            />
          )}

          <div className="Settings">
            <ul className="Nav">
              <li className="NavItem">
                <Link
                  className={matchHashCalculator ? "NavLink" : "ActiveNavLink"}
                  href="/"
                >
                  Class search
                </Link>
              </li>
              <li className="NavItem">
                <Link
                  className={matchHashCalculator ? "ActiveNavLink" : "NavLink"}
                  href="/hash-calculator"
                >
                  Hash calculator
                </Link>
              </li>
            </ul>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={displayHex}
                    onChange={handleDisplayHexChange}
                  />
                }
                label="Display hex numbers"
              />
            </FormGroup>
          </div>
        </div>
      </SettingsContext.Provider>
    </ThemeProvider>
  );
}

export default App;
