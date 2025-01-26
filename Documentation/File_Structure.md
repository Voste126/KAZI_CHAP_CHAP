# Kazi Chap Chap - File Structure

## 1. KaziChapChap.API/Models/

- **Expense.cs**: Defines the Expense model.
- **Budget.cs**: Defines the Budget model.
- **Notification.cs**: Defines the Notification model.

## 2. KaziChapChap.API/Controllers/

- **ExpensesController.cs**: Handles CRUD operations for expenses.
- **BudgetsController.cs**: Handles CRUD operations for budgets.
- **NotificationsController.cs**: Handles CRUD operations for notifications.

## 3. KaziChapChap.Data/

- **KaziDbContext.cs**: The database context class that manages entity relationships and database operations.
- **Migrations/**: Contains EF Core migration files.
- **Repositories/** (optional): Contains repository classes for business logic separation.

## 4. KaziChapChap.Core/

- **User.cs**: Already implemented for user authentication.
- **IAuthService.cs**: Interface for authentication service (if not already present).
- **Interfaces/** (optional): Contains additional interfaces like IExpenseService, IBudgetService, etc.

## 5. KaziChapChap.Tests/

- **ExpensesControllerTests.cs**: Unit tests for the ExpensesController.
- **BudgetsControllerTests.cs**: Unit tests for the BudgetsController.
- **NotificationsControllerTests.cs**: Unit tests for the NotificationsController.
