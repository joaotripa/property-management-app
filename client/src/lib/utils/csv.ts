import { formatDateForInput } from "@/lib/utils/timezone";

interface TransactionExportData {
  transactionDate: Date;
  amount: number;
  type: string;
  description?: string;
  category: {
    name: string;
    type: string;
  };
  property: {
    name: string;
    address: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

function escapeCSV(value: string | number | undefined | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function generateTransactionCSV(transactions: TransactionExportData[]): string {
  const headers = [
    'Date',
    'Amount',
    'Currency',
    'Type',
    'Category',
    'Category Type',
    'Description',
    'Property Name',
    'Property Address',
    'City',
    'State',
    'Zip Code',
    'Country'
  ];

  const rows = transactions.map(transaction => {
    const date = new Date(transaction.transactionDate);
    const formattedDate = formatDateForInput(date);
    const formattedAmount = transaction.amount.toFixed(2);

    return [
      escapeCSV(formattedDate),
      escapeCSV(formattedAmount),
      escapeCSV('EUR'),
      escapeCSV(transaction.type),
      escapeCSV(transaction.category.name),
      escapeCSV(transaction.category.type),
      escapeCSV(transaction.description || ''),
      escapeCSV(transaction.property.name),
      escapeCSV(transaction.property.address),
      escapeCSV(transaction.property.city || ''),
      escapeCSV(transaction.property.state || ''),
      escapeCSV(transaction.property.zipCode || ''),
      escapeCSV(transaction.property.country || '')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}