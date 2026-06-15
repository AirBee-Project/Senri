import type React from "react";
import { useRef, useState } from "react";
import { useJsonLayerStore } from "../../../stores/jsonLayerStore";
import { jsonToSpatialIds } from "../../../utils/parser/jsonToSpatialIds";
import FooterAddButton from "../common-ui/FooterAddButton";
import CommonPanel from "../common-ui/Panel";
import JsonBox from "./JsonBox";

export default function JsonPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, opacity, setData, setOpacity, clearData } = useJsonLayerStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const parsedData = jsonToSpatialIds(jsonString);
        setData(parsedData);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage || "JSONのパースに失敗しました。");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.onerror = () => {
      setError("ファイルの読み込みに失敗しました。");
    };
    reader.readAsText(file);
  };

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <CommonPanel
      footerButton={
        <FooterAddButton onClick={handleAddClick} ariaLabel="JSONを追加" />
      }
    >
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />
      {error && (
        <div
          style={{
            color: "#dc2626",
            fontSize: "12px",
            marginTop: "8px",
            padding: "0 16px",
          }}
        >
          {error}
        </div>
      )}

      {data && (
        <JsonBox
          data={data}
          opacity={opacity}
          onOpacityChange={setOpacity}
          onDelete={clearData}
        />
      )}
    </CommonPanel>
  );
}
