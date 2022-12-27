import { useSettings } from "./settingsContext";

const Hex = ({
  value,
  seperateBytes,
}: {
  value: number;
  seperateBytes?: boolean;
}) => {
  const settings = useSettings();

  if (!settings.displayHex) {
    return <>{value}</>;
  }

  const hex = value.toString(16).toUpperCase();
  const hexChunks = [];

  if (seperateBytes) {
    const chunkSize = 2;
    for (let i = 0; i < hex.length; i += chunkSize) {
      const chunk = hex.slice(i, i + chunkSize);
      hexChunks.push(chunk);
    }
  }

  return (
    <span>
      <span className="HexPrefix">0x</span>
      {seperateBytes
        ? hexChunks.map((v, index) => (
            <span className="HexChunk" key={index}>
              {v}
            </span>
          ))
        : hex}
    </span>
  );
};

export default Hex;
