// Worker for JSON -> CSV conversion (large files)
self.onmessage = (event: MessageEvent) => {
  const { jsonData } = event.data;
  try {
    const parsed = JSON.parse(jsonData);
    if (!Array.isArray(parsed)) {
      throw new Error("JSON must be an array of objects");
    }
    const headers = Object.keys(parsed[0] || {});
    const csvRows = parsed.map((row: any) =>
      headers
        .map((field) => {
          const val = (row[field] ?? "").toString();
          // Escaping: wrap in quotes if contains comma, newline, or double quote
          if (val.includes(",") || val.includes("\n") || val.includes('"')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(","),
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    self.postMessage({ success: true, csv });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
