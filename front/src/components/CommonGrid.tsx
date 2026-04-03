"use client";

import { DataGrid } from "react-data-grid";
import { useGrid } from "@/hooks/useGrid";
import type { Props } from "@/types/grid";

const CommonGrid = (props: Props) => {
  const { headerRight } = props;
  const {
    columns,
    rows,
    setRows,
    selectedRows,
    setSelectedRows,
    isExporting,
    gridRef,
    handleCellCopy,
    handleCellPaste,
    handleFill,
  } = useGrid();

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          {selectedRows.size > 0 && (
            <p className="flex items-center gap-1.5">
              <span className="text-muted-foreground">전체 {rows.length}행 중</span>
              <span className="font-bold text-primary">{selectedRows.size}행</span>
              <span className="text-muted-foreground">선택됨</span>
            </p>
          )}
        </div>
        {headerRight}
      </div>

      <DataGrid
        ref={gridRef}
        rowKeyGetter={(row) => row.id}
        rowHeight={25}
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
export default CommonGrid;
