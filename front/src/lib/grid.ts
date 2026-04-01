export function exportToCsv(gridEl: HTMLDivElement, fileName: string) {
  const data = Array.from(
    gridEl.querySelectorAll<HTMLDivElement>(".rdg-row:not(.rdg-summary-row)"),
  ).map((gridRow) =>
    Array.from(gridRow.querySelectorAll<HTMLDivElement>(".rdg-cell:not([aria-colindex='1'])")).map(
      (gridCell) => gridCell.innerText,
    ),
  );

  const content = data.map((cells) => cells.map(serialiseCellValue).join(",")).join("\n");

  downloadFile(fileName, new Blob([content], { type: "text/csv;charset=utf-8;" }));
}

function serialiseCellValue(value: unknown) {
  if (typeof value === "string") {
    const formattedValue = value.replace(/"/g, '""');
    return formattedValue.includes(",") ? `"${formattedValue}"` : formattedValue;
  }
  return value;
}

function downloadFile(fileName: string, data: Blob) {
  const downloadLink = document.createElement("a");
  downloadLink.download = fileName;
  const url = URL.createObjectURL(data);
  downloadLink.href = url;
  downloadLink.click();
  URL.revokeObjectURL(url);
}
