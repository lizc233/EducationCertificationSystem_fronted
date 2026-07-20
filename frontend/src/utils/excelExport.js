function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function resolveCellType(value, type) {
  if (type === 'number' && Number.isFinite(Number(value))) {
    return 'Number';
  }
  return 'String';
}

function normalizeCellValue(value, type) {
  if (type === 'number' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return value ?? '';
}

function buildCell(value, options = {}) {
  const normalized = normalizeCellValue(value, options.type);
  const cellType = resolveCellType(normalized, options.type);
  const styleId = options.styleId ? ` ss:StyleID="${options.styleId}"` : '';
  const mergeAcross = Number.isInteger(options.mergeAcross) && options.mergeAcross > 0
    ? ` ss:MergeAcross="${options.mergeAcross}"`
    : '';

  return `<Cell${styleId}${mergeAcross}><Data ss:Type="${cellType}">${escapeXml(normalized)}</Data></Cell>`;
}

function buildWorkbookXml({ sheetName, title, filters = [], columns = [], rows = [] }) {
  const safeSheetName = String(sheetName || 'Sheet1').slice(0, 31);
  const headerCells = columns.map((column) => buildCell(column.label, { styleId: 'header' })).join('');
  const dataRows = rows.map((row) => {
    const cells = columns.map((column) => {
      const rawValue = typeof column.resolve === 'function' ? column.resolve(row) : row?.[column.key];
      return buildCell(rawValue, { type: column.type });
    }).join('');
    return `<Row>${cells}</Row>`;
  }).join('');

  const titleRow = `<Row>${buildCell(title, { styleId: 'title', mergeAcross: Math.max(columns.length - 1, 0) })}</Row>`;
  const exportTimeRow = `<Row>${buildCell(`导出时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`, {
    styleId: 'meta',
    mergeAcross: Math.max(columns.length - 1, 0)
  })}</Row>`;
  const filterRows = filters
    .filter(Boolean)
    .map((filter) => `<Row>${buildCell(filter, { styleId: 'meta', mergeAcross: Math.max(columns.length - 1, 0) })}</Row>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook
  xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Microsoft YaHei UI" ss:Size="10"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="title">
      <Font ss:FontName="Microsoft YaHei UI" ss:Size="14" ss:Bold="1"/>
    </Style>
    <Style ss:ID="meta">
      <Font ss:FontName="Microsoft YaHei UI" ss:Size="10" ss:Color="#6B5B4D"/>
    </Style>
    <Style ss:ID="header">
      <Font ss:FontName="Microsoft YaHei UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#4F6D7A" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${escapeXml(safeSheetName)}">
    <Table>
      ${titleRow}
      ${exportTimeRow}
      ${filterRows}
      <Row/>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>
  </Worksheet>
</Workbook>`;
}

async function saveBlobWithPicker(blob, fileName) {
  if (typeof window.showSaveFilePicker !== 'function') {
    return 'download';
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [
        {
          description: 'Excel 工作簿',
          accept: {
            'application/vnd.ms-excel': ['.xls']
          }
        }
      ]
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return 'picker';
  } catch (error) {
    if (error?.name === 'AbortError') {
      return 'cancelled';
    }
    return 'download';
  }
}

function triggerBrowserDownload(blob, fileName) {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}

export async function exportRowsToExcel(options) {
  const xml = buildWorkbookXml(options);
  const blob = new Blob([xml], {
    type: 'application/vnd.ms-excel;charset=utf-8'
  });
  const saveMode = await saveBlobWithPicker(blob, options.fileName || 'export.xls');

  if (saveMode === 'download') {
    triggerBrowserDownload(blob, options.fileName || 'export.xls');
  }

  return saveMode;
}
