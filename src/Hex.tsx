import { useSettings } from "./settingsContext";

const Hex = ({ value }: { value: number }) => {
  const settings = useSettings();

  if (!settings.displayHex) {
    return <>{value}</>;
  }

  return (
    <span>
      <span className="HexPrefix">0x</span>
      {value.toString(16).toUpperCase()}
    </span>
  );
};

export default Hex;
