"use client";

import { useState } from "react";
import {
  type CellMouseArgs,
  type CellMouseEvent,
  DataGrid,
  renderTextEditor,
} from "react-data-grid";

type Row = Record<string, string | number>;

const columns = [
  {
    key: "idx",
    name: "",
    width: 50,
    minWidth: 50,
    resizable: false,
  },
  ...Array.from({ length: 26 }, (_, i) => {
    const key = String.fromCharCode(65 + i);
    return { key, name: key, renderEditCell: renderTextEditor };
  }),
];

const initRows = Array.from({ length: 100 }, (_, i) => {
  const row: Record<string, string | number> = {
    idx: i + 1,
  };

  columns.forEach((col) => {
    if (col.key !== "idx") row[col.key] = "";
  });

  return row;
});

const InboundGrid = () => {
  const [rows, setRows] = useState(initRows);
  const [_selectedCells, _setSelectedCells] = useState<{ row: number; col: string }[]>([]);

  function onCellClick(args: CellMouseArgs<Row>, event: CellMouseEvent) {
    event.preventGridDefault();

    console.log(args.column.key, args.rowIdx);
  }

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      defaultColumnOptions={{
        minWidth: 100,
        resizable: true,
      }}
      onRowsChange={setRows}
      onCellClick={onCellClick}
    />
  );
};
export default InboundGrid;
