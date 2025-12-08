"use client";

import * as React from "react";
import { IconDownload, IconFileSpreadsheet, IconFileText, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ExportFormat = "csv" | "excel" | "json";

interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: unknown, row: T) => string | number;
}

interface ExportButtonProps<T> {
  data: T[];
  columns: ExportColumn<T>[];
  filename?: string;
  formats?: ExportFormat[];
  disabled?: boolean;
  onExportStart?: () => void;
  onExportComplete?: (format: ExportFormat) => void;
  onExportError?: (error: Error) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

// Helper to get nested property value
function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

// Convert data to CSV format
function dataToCSV<T>(data: T[], columns: ExportColumn<T>[]): string {
  const headers = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');

  const rows = data.map(row => {
    return columns.map(col => {
      const rawValue = getNestedValue(row, col.key as string);
      const value = col.formatter ? col.formatter(rawValue, row) : rawValue;

      if (value === null || value === undefined) {
        return '""';
      }

      const stringValue = String(value);
      // Escape quotes and wrap in quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

// Convert data to Excel-compatible XML format (simple approach without external libs)
function dataToExcelXML<T>(data: T[], columns: ExportColumn<T>[], filename: string): string {
  const worksheetName = filename.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 31);

  const headerCells = columns.map(col =>
    `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXML(col.header)}</Data></Cell>`
  ).join('');

  const dataRows = data.map(row => {
    const cells = columns.map(col => {
      const rawValue = getNestedValue(row, col.key as string);
      const value = col.formatter ? col.formatter(rawValue, row) : rawValue;

      if (value === null || value === undefined) {
        return '<Cell><Data ss:Type="String"></Data></Cell>';
      }

      const isNumber = typeof value === 'number' && !isNaN(value);
      const type = isNumber ? 'Number' : 'String';
      const stringValue = String(value);

      return `<Cell><Data ss:Type="${type}">${escapeXML(stringValue)}</Data></Cell>`;
    }).join('');

    return `<Row>${cells}</Row>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#CCCCCC" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${worksheetName}">
    <Table>
      <Row>${headerCells}</Row>
      ${dataRows}
    </Table>
  </Worksheet>
</Workbook>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportButton<T>({
  data,
  columns,
  filename = "export",
  formats = ["csv", "excel"],
  disabled = false,
  onExportStart,
  onExportComplete,
  onExportError,
  className,
  variant = "outline",
  size = "default",
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (data.length === 0) {
      onExportError?.(new Error("No data to export"));
      return;
    }

    setIsExporting(true);
    onExportStart?.();

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `${filename}_${timestamp}`;

      switch (format) {
        case "csv": {
          const csvContent = dataToCSV(data, columns);
          downloadFile(csvContent, `${baseFilename}.csv`, "text/csv;charset=utf-8");
          break;
        }
        case "excel": {
          const excelContent = dataToExcelXML(data, columns, filename);
          downloadFile(excelContent, `${baseFilename}.xls`, "application/vnd.ms-excel");
          break;
        }
        case "json": {
          const jsonData = data.map(row => {
            const obj: Record<string, unknown> = {};
            columns.forEach(col => {
              const rawValue = getNestedValue(row, col.key as string);
              obj[col.header] = col.formatter ? col.formatter(rawValue, row) : rawValue;
            });
            return obj;
          });
          const jsonContent = JSON.stringify(jsonData, null, 2);
          downloadFile(jsonContent, `${baseFilename}.json`, "application/json");
          break;
        }
      }

      onExportComplete?.(format);
    } catch (error) {
      onExportError?.(error instanceof Error ? error : new Error("Export failed"));
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    csv: <IconFileText className="mr-2 h-4 w-4" />,
    excel: <IconFileSpreadsheet className="mr-2 h-4 w-4" />,
    json: <IconFileText className="mr-2 h-4 w-4" />,
  };

  const formatLabels: Record<ExportFormat, string> = {
    csv: "Export as CSV",
    excel: "Export as Excel",
    json: "Export as JSON",
  };

  // If only one format, show a simple button
  if (formats.length === 1) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || isExporting || data.length === 0}
        onClick={() => handleExport(formats[0])}
      >
        {isExporting ? (
          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <IconDownload className="mr-2 h-4 w-4" />
        )}
        {formatLabels[formats[0]]}
      </Button>
    );
  }

  // Multiple formats - show dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={disabled || isExporting || data.length === 0}
        >
          {isExporting ? (
            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <IconDownload className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
          >
            {formatIcons[format]}
            {formatLabels[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export types for external use
export type { ExportColumn, ExportFormat };
