import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ETL: Currency Cleaning
 * Removes currency symbols, commas, spaces and non-numeric chars except decimal points.
 */
export function cleanCurrency(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  
  if (typeof value === 'number') return value;
  
  // Use regex to strip all non-numeric characters except decimal points
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

export const MOCK_DATA = [
  { "Date": "2024-05-01", "Order ID": "ORD-001", "Product Name": "Quantum CPU", "Customer Name": "TechCorp", "Category": "Hardware", "Price": "$1,200.00", "Quantity": "2", "Status": "Completed" },
  { "Date": "2024-05-02", "Order ID": "ORD-002", "Product Name": "Neural GPU", "Customer Name": "DataScale", "Category": "Hardware", "Price": "$2,500.00", "Quantity": "1", "Status": "Pending" },
  { "Date": "2024-05-03", "Order ID": "ORD-003", "Product Name": "Cloud Sync Hub", "Customer Name": "BizCloud", "Category": "Networking", "Price": "$450.00", "Quantity": "5", "Status": "Completed" },
  { "Date": "2024-05-04", "Order ID": "ORD-004", "Product Name": "Fiber Link X", "Customer Name": "FastNet", "Category": "Networking", "Price": "$120.00", "Quantity": "10", "Status": "Shipped" },
  { "Date": "2024-05-05", "Order ID": "ORD-005", "Product Name": "Edge Router", "Customer Name": "LocalHost", "Category": "Networking", "Price": "$890.00", "Quantity": "1", "Status": "Completed" },
  { "Date": "2024-05-06", "Order ID": "ORD-006", "Product Name": "Pro Display 8K", "Customer Name": "CreativeHub", "Category": "Peripherals", "Price": "$3,500.00", "Quantity": "2", "Status": "Completed" },
  { "Date": "2024-05-07", "Order ID": "ORD-007", "Product Name": "Quantum CPU", "Customer Name": "AlphaLabs", "Category": "Hardware", "Price": "$1,200.00", "Quantity": "3", "Status": "Completed" },
  { "Date": "2024-05-08", "Order ID": "ORD-008", "Product Name": "Neural GPU", "Customer Name": "DeepAI", "Category": "Hardware", "Price": "$2,500.00", "Quantity": "1", "Status": "Processing" },
  { "Date": "2024-05-09", "Order ID": "ORD-009", "Product Name": "Secure Key", "Customer Name": "SafeVault", "Category": "Security", "Price": "$85.00", "Quantity": "50", "Status": "Completed" },
  { "Date": "2024-05-10", "Order ID": "ORD-010", "Product Name": "Edge Router", "Customer Name": "EnterpriseX", "Category": "Networking", "Price": "$890.00", "Quantity": "4", "Status": "Completed" },
  { "Date": "2024-03-15", "Order ID": "ORD-011", "Product Name": "Quantum CPU", "Customer Name": "MegaCorp", "Category": "Hardware", "Price": "$1,200.00", "Quantity": "1", "Status": "Completed" },
  { "Date": "2023-12-25", "Order ID": "ORD-012", "Product Name": "Holiday Kit", "Customer Name": "RetailerA", "Category": "Bundles", "Price": "$250.00", "Quantity": "20", "Status": "Completed" }
];
