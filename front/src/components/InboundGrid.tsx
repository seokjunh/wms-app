"use client";

import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import {
  type CellCopyArgs,
  type CellPasteArgs,
  DataGrid,
  type DataGridHandle,
  type FillEvent,
  renderTextEditor,
  SelectColumn,
} from "react-data-grid";
import { flushSync } from "react-dom";
import { exportToCsv } from "@/lib/grid";
import { Button } from "./ui/button";

type Row = Record<string, number | string>;

const columns = [
  SelectColumn,
  ...Array.from({ length: 26 }, (_, i) => {
    const key = String.fromCharCode(65 + i);

    return { key, name: key, renderEditCell: renderTextEditor };
  }),
];

const initRows = Array.from({ length: 50 }, (_, idx) => {
  const row: Row = { id: idx };

  columns.forEach((col) => {
    row[col.key] = "";
  });

  return row;
});

const InboundGrid = () => {
  const [rows, setRows] = useState(initRows);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number | string>>(new Set());
  const [isExporting, setIsExporting] = useState(true);
  const gridRef = useRef<DataGridHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCellCopy = ({ row, column }: CellCopyArgs<Row>, e: React.ClipboardEvent) => {
    const value = row[column.key];

    e.clipboardData.setData("text/plain", String(value));
    e.preventDefault();
  };

  const handleCellPaste = ({ row, column }: CellPasteArgs<Row>, e: React.ClipboardEvent): Row => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData("text/plain");
    const startColCode = column.key.charCodeAt(0);
    const startRowId = row.id as number;

    const data = pastedText
      .trim()
      .split(/\r?\n/)
      .map((line) => line.split("\t"));

    setRows((prevRows) =>
      prevRows.map((prev, _) => {
        const currentRowId = prev.id as number;

        if (currentRowId >= startRowId && currentRowId < startRowId + data.length) {
          const rIdx = currentRowId - startRowId;
          const rowData = data[rIdx];

          let updated = { ...prev };

          rowData.forEach((value, j) => {
            const targetColKey = String.fromCharCode(startColCode + j);

            updated = { ...updated, [targetColKey]: value };
          });

          return updated;
        }

        return prev;
      }),
    );

    return row;
  };

  const handleFill = ({ sourceRow, targetRow, columnKey }: FillEvent<Row>): Row => {
    return { ...targetRow, [columnKey]: sourceRow[columnKey] };
  };

  const handleExportToCsv = () => {
    const gridElement = gridRef.current?.element;
    if (!gridElement) return;

    flushSync(() => {
      setIsExporting(false);
    });

    const date = new Date().toISOString().split("T")[0];

    exportToCsv(gridElement, `test_${date}.csv`);

    flushSync(() => {
      setIsExporting(true);
    });
  };

  const handleImportToCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.trim().split(/\r?\n/);

      const newRows = lines.map((line, idx) => {
        const values = line.split(",");
        const row: Row = { id: idx };

        values.forEach((value, i) => {
          const colKey = String.fromCharCode(65 + i);
          row[colKey] = value;
        });

        return row;
      });

      setRows(newRows);

      e.target.value = "";
    };

    reader.readAsText(file, "uft-8");
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload /> CSV로 가져오기
        </Button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportToCsv}
          accept=".csv"
          className="hidden"
        />

        <Button variant="outline" onClick={handleExportToCsv}>
          <Download /> CSV로 내보내기
        </Button>
      </div>

      <DataGrid
        ref={gridRef}
        rowKeyGetter={(row) => row.id}
        rowHeight={30}
        columns={columns}
        rows={rows}
        selectedRows={selectedRows}
        onRowsChange={setRows}
        onSelectedRowsChange={setSelectedRows}
        onCellCopy={handleCellCopy}
        onCellPaste={handleCellPaste}
        onFill={handleFill}
        defaultColumnOptions={{
          minWidth: 100,
          resizable: true,
        }}
        enableVirtualization={isExporting}
      />
    </>
  );
};
export default InboundGrid;
