import React from 'react';
import { cn } from '../../utils/cn';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn('border-b border-slate-200 dark:border-[#383838] bg-slate-50/70 dark:bg-[#242424]', className)} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('border-b border-slate-100 dark:border-[#383838] transition-colors hover:bg-slate-50/60 dark:hover:bg-[#303030]', className)} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th
    className={cn(
      'h-10 px-4 text-left align-middle text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase',
      className
    )}
    {...props}
  />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('p-4 align-middle text-sm text-slate-700 dark:text-slate-200', className)} {...props} />
);
