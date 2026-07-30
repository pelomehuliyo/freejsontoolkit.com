/**
 * Download — Browser file download utilities
 *
 * Triggers file downloads entirely client-side using Blob URLs.
 */

/**
 * Trigger a browser file download from a string of content.
 *
 * @param content  — The file content as a string
 * @param filename — The desired filename (e.g. "data.csv")
 * @param mimeType — The MIME type (e.g. "text/csv;charset=utf-8;")
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/plain;charset=utf-8;",
): void {
  if (!content) return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
