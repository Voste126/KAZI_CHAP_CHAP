# Kazi Chap Chap - Database Schema

## Users Table

Stores user account information for authentication.

| Column Name       | Data Type      | Constraints                          | Description                                 |
|-------------------|---------------|--------------------------------------|---------------------------------------------|
| UserID           | INT           | PRIMARY KEY, AUTO_INCREMENT         | Unique identifier for each user.           |
| Email            | VARCHAR(255)  | UNIQUE, NOT NULL                    | User's email address (used for login).     |
| PasswordHash     | VARCHAR(255)  | NOT NULL                             | Hashed password (using AES-256 encryption).|
| ResetToken       | VARCHAR(255)  | NULL                                 | Token for password reset (optional).       |
| ResetTokenExpiry | DATETIME      | NULL                                 | Expiry time for the reset token.           |
| CreatedAt        | DATETIME      | DEFAULT CURRENT_TIMESTAMP           | Timestamp when the user was created.       |

## Expenses Table

Stores user expenses.

| Column Name  | Data Type      | Constraints                      | Description                                  |
|-------------|---------------|----------------------------------|----------------------------------------------|
| ExpenseID  | INT           | PRIMARY KEY, AUTO_INCREMENT     | Unique identifier for each expense.         |
| UserID     | INT           | FOREIGN KEY (Users.UserID)      | Links the expense to a user.                |
| Amount     | DECIMAL(10,2) | NOT NULL                         | Amount of the expense.                      |
| Category   | VARCHAR(50)   | NOT NULL                         | Category of the expense (e.g., Food, Transport). |
| Date       | DATE          | NOT NULL                         | Date of the expense.                        |
| Description| TEXT          | NULL                             | Optional description of the expense.        |
| CreatedAt  | DATETIME      | DEFAULT CURRENT_TIMESTAMP       | Timestamp when the expense was added.       |

## Budgets Table

Stores user-defined budgets for specific categories.

| Column Name  | Data Type      | Constraints                      | Description                                  |
|-------------|---------------|----------------------------------|----------------------------------------------|
| BudgetID   | INT           | PRIMARY KEY, AUTO_INCREMENT     | Unique identifier for each budget.         |
| UserID     | INT           | FOREIGN KEY (Users.UserID)      | Links the budget to a user.                |
| Category   | VARCHAR(50)   | NOT NULL                         | Category for the budget (e.g., Food, Transport). |
| Amount     | DECIMAL(10,2) | NOT NULL                         | Budget amount for the category.            |
| MonthYear  | DATE          | NOT NULL                         | Month and year for the budget (e.g., 2023-10-01 for October 2023). |
| CreatedAt  | DATETIME      | DEFAULT CURRENT_TIMESTAMP       | Timestamp when the budget was added.       |

## Notifications Table

Stores notifications for users when they exceed their budget.

| Column Name   | Data Type  | Constraints                      | Description                                  |
|--------------|-----------|----------------------------------|----------------------------------------------|
| NotificationID | INT     | PRIMARY KEY, AUTO_INCREMENT     | Unique identifier for each notification.   |
| UserID        | INT     | FOREIGN KEY (Users.UserID)      | Links the notification to a user.          |
| Message       | TEXT    | NOT NULL                         | Notification message (e.g., "You have exceeded your Food budget."). |
| IsRead        | BOOLEAN | DEFAULT FALSE                    | Indicates whether the notification has been read. |
| CreatedAt     | DATETIME | DEFAULT CURRENT_TIMESTAMP       | Timestamp when the notification was created. |

## Relationships

### One-to-Many

- A User can have many Expenses.
- A User can have many Budgets.
- A User can have many Notifications.

### Foreign Keys

- `Expenses.UserID` references `Users.UserID`.
- `Budgets.UserID` references `Users.UserID`.
- `Notifications.UserID` references `Users.UserID`
