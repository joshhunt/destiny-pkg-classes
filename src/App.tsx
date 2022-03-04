import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import "./App.css";
import allData from "./data.json";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";

const STICKY_HEADER_ROW = {
  classRef: "STICKY_HEADER_ROW",
  stride: -1,
};

const ITEM_SIZE = 48;
const HEADER_ITEM_SIZE = 41;

const Hex = ({ value }: { value: number }) => {
  const settings = useContext(SettingsContext);

  if (!settings.displayHex) {
    return <>{value}</>;
  }

  const flipped = settings.endianness === BIG_ENDIAN ? value : swap32(value);

  return (
    <span>
      <span className="HexPrefix">0x</span>
      {flipped.toString(16)}
    </span>
  );
};

const Row = ({ index, style, data }: any) => {
  if (index === 0) {
    return null;
  }

  const stride = data[index].stride;

  return (
    <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
      <div className="Row">
        <div className="ClassRef">{data[index].classRef}</div>
        <div className="Stride">
          <Hex value={stride} />
        </div>
      </div>
    </div>
  );
};

const StickyRow = ({ index, style }: any) => (
  <div className="sticky ResultsHeader Row" style={style}>
    <div className="ClassRef">Class ref</div>
    <div className="Stride">Stride</div>
  </div>
);

const innerElementType = forwardRef<HTMLDivElement>(
  ({ children, ...rest }, ref) => (
    <div ref={ref} {...rest}>
      <StickyRow
        index={0}
        key={0}
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: HEADER_ITEM_SIZE,
        }}
      />

      {children}
    </div>
  )
);

const LITTLE_ENDIAN = "le";
const BIG_ENDIAN = "be";

const DEFAULT_ENDIANNESS = BIG_ENDIAN;
const DEFAULT_DISPLAY_HEX = false;

const SettingsContext = createContext({
  endianness: DEFAULT_ENDIANNESS,
  displayHex: DEFAULT_DISPLAY_HEX,
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
  const [searchValue, setSearchValue] = useLocalStorageState("searchValue", "");
  const [endianness, setEndianness] = useLocalStorageState(
    "endianness",
    DEFAULT_ENDIANNESS
  );
  const [displayHex, setDisplayHex] = useLocalStorageState(
    "displayHex",
    DEFAULT_DISPLAY_HEX
  );

  const settings = useMemo(
    () => ({ endianness, displayHex }),
    [endianness, displayHex]
  );

  const handleEndiannessChange = (event: any, newValue: string) => {
    setEndianness(newValue);
  };

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

    const flippedString = (cleanedInput.match(/.{1,2}/g) ?? [])
      .reverse()
      .join("");

    console.log("flippedString", flippedString);

    const res = allData.filter((v) => {
      const classRef = v.classRef.toLowerCase();

      if (
        classRef === inputIsInt ||
        classRef === inputIsPartialBeHex ||
        classRef === inputIsLeHex
      ) {
        console.log({
          classRef,
          inputIsInt,
          inputIsPartialBeHex,
          inputIsLeHex,
        });
        return true;
      }

      return (
        classRef.includes(inputIsPartialBeHex) ||
        classRef.includes(flippedString)
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
          <div className="AppMain">
            <div className="Header">
              <input
                className="SearchInput"
                type="text"
                value={searchValue}
                onChange={(ev) => setSearchValue(ev.target.value)}
                placeholder="Search by class ref"
              />
            </div>

            <div className="Results">
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    className="List"
                    height={height}
                    innerElementType={innerElementType}
                    itemCount={results.length}
                    itemSize={(index) =>
                      index === 0 ? HEADER_ITEM_SIZE : ITEM_SIZE
                    }
                    estimatedItemSize={ITEM_SIZE}
                    width={width}
                    itemData={results}
                    itemKey={(index, itemData) => itemData[index].classRef}
                    overscanCount={100}
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </div>
          </div>

          <div className="Settings">
            <FormGroup>
              <ToggleButtonGroup
                value={endianness}
                exclusive
                onChange={handleEndiannessChange}
                size="small"
              >
                <ToggleButton
                  disableRipple
                  value={BIG_ENDIAN}
                  style={{ textTransform: "unset" }}
                >
                  Big endian
                </ToggleButton>

                <ToggleButton
                  disableRipple
                  value={LITTLE_ENDIAN}
                  style={{ textTransform: "unset" }}
                >
                  Little endian
                </ToggleButton>
              </ToggleButtonGroup>
            </FormGroup>

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
