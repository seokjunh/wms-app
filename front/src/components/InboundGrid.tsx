"use client";

import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import { useGrid } from "@/hooks/useGrid";
import CommonGrid from "./CommonGrid";
import { Button } from "./ui/button";

const InboundGrid = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { handleImportToCsv, handleExportToCsv } = useGrid();

  return (
    <CommonGrid
      headerRight={
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload /> CSV 가져오기
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportToCsv}
            accept=".csv"
            className="hidden"
          />

          <Button variant="outline" onClick={handleExportToCsv}>
            <Download /> CSV 내보내기
          </Button>
        </div>
      }
    />
  );
};
export default InboundGrid;
