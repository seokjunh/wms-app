"use client";

import { useState } from "react";
import {
  type CellCopyArgs,
  type CellPasteArgs,
  DataGrid,
  type FillEvent,
  renderTextEditor,
  SelectColumn,
} from "react-data-grid";

type Row = Record<string, number | string>;

const columns = [
  SelectColumn,
  ...Array.from({ length: 26 }, (_, i) => {
    const key = String.fromCharCode(65 + i);

    return { key, name: key, renderEditCell: renderTextEditor };
  }),
];

const initRows = Array.from({ length: 100 }, (_, i) => {
  const row: Row = { id: i };

  columns.forEach((col) => {
    row[col.key] = "";
  });

  return row;
});

const InboundGrid = () => {
  const [rows, setRows] = useState(initRows);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number | string>>(new Set());

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

  return (
    <DataGrid
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
      enableVirtualization={true}
    />
  );
};
export default InboundGrid;
