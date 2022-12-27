import { useState } from "react";
import Hex from "./Hex";

function fnv132(str: string) {
  let hash = 0x811c9dc5,
    i;

  for (i = 0; i < str.length; i++) {
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    hash ^= str.charCodeAt(i);
  }

  hash = hash >>> 0;

  return hash;
}

export default function HashCalculator() {
  const [input, setInput] = useState("");

  var hash = fnv132(input);

  return (
    <div className="AppMain">
      <div className="Header">
        <input
          className="SearchInput"
          type="text"
          value={input}
          onChange={(ev) => setInput(ev.target.value)}
          placeholder="String to hash"
        />
      </div>

      <div className="CalculatorOutput">
        <div>
          <h3 className="HashTypeHeading">FNV1-32</h3>
          <Hex value={hash} seperateBytes />
        </div>
      </div>
    </div>
  );
}
