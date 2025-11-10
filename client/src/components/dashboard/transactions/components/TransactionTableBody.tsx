"use client";

import { Table, flexRender } from "@tanstack/react-table";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/types/transactions";

interface TransactionTableBodyProps {
  table: Table<Transaction>;
  emptyMessage: string;
}

export function TransactionTableBody({
  table,
  emptyMessage,
}: TransactionTableBodyProps) {
  const rows = table.getRowModel().rows;

  if (!rows.length) {
    return (
      <div className="rounded-lg border">
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <TableUI>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{
                    width:
                      header.getSize() !== 150
                        ? header.getSize()
                        : undefined,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableUI>
    </div>
  );
}
