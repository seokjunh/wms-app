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
    frozen: true,
  },
  ...Array.from({ length: 26 }, (_, i) => {
    const key = String.fromCharCode(65 + i);
    return { key, name: key, renderEditCell: renderTextEditor };
  }),
];

const initRows = Array.from({ length: 100 }, (_, i) => {
  const row: Row = {};

  columns.forEach((col) => {
    if (col.key === "idx") {
      row.idx = i + 1;
    } else {
      row[col.key] = "";
    }
  });

  return row;
});

const InboundGrid = () => {
  const [rows, setRows] = useState(initRows);

  const _onCellClick = (args: CellMouseArgs<Row>, event: CellMouseEvent) => {
    event.preventGridDefault();
    console.log(args.row.idx, args.column.key);
  };

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      rowHeight={30}
      onRowsChange={setRows}
      defaultColumnOptions={{
        minWidth: 100,
        resizable: true,
      }}
    />
  );
};
export default InboundGrid;
