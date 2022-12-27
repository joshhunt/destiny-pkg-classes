import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import Hex from "./Hex";
import { forwardRef } from "react";

interface ClassHashSearchProps {
  searchValue: string;
  setSearchValue: (s: string) => void;
  results: {
    lowerClassRef: string;
    flippedLowerClassRef: string;
    classRef: string;
    stride: number;
  }[];
}

const ITEM_SIZE = 48;
const HEADER_ITEM_SIZE = 41;

export default function ClassHashSearch({
  searchValue,
  setSearchValue,
  results,
}: ClassHashSearchProps) {
  return (
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
              itemSize={(index) => (index === 0 ? HEADER_ITEM_SIZE : ITEM_SIZE)}
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
  );
}

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

const StickyRow = ({ index, style }: any) => (
  <div className="sticky ResultsHeader Row" style={style}>
    <div className="ClassRef">Class ref</div>
    <div className="Stride">Stride</div>
  </div>
);
