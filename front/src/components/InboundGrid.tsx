"use client";

import { DataGrid } from "react-data-grid";

const columns = [
  { key: "idx", name: "", width: 50, minWidth: 50 },
  ...Array.from({ length: 26 }, (_, i) => {
    const key = String.fromCharCode(65 + i);
    return { key, name: key };
  }),
];

const rows = Array.from({ length: 1000 }, (_, i) => {
  const row: Record<string, string | number> = {
    idx: i + 1,
  };

  columns.forEach((col) => {
    if (col.key !== "idx") row[col.key] = "";
  });

  return row;
});

const InboundGrid = () => {
  return (
    <DataGrid
      columns={columns}
      rows={rows}
      defaultColumnOptions={{
        minWidth: 100,
        resizable: true,
        sortable: true,
        draggable: true,
      }}
    />
  );
};
export default InboundGrid;
