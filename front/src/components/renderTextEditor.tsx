import type { RenderEditCellProps } from "react-data-grid";

type Row = Record<string, string | number>;

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

const renderTextEditor = ({ row, column, onRowChange, onClose }: RenderEditCellProps<Row>) => {
  return (
    <input
      ref={autoFocusAndSelect}
      value={row[column.key] ?? ""}
      onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
      onBlur={() => onClose(true)}
    />
  );
};

export default renderTextEditor;
