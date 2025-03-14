// src/components/types.ts
export interface Expense {
  expenseID: number;
  userID: number;
  budgetID: number; // Add this line
  amount: number;
  category: string;
  date: string;
  description: string;
  createdAt: string;
}

