# KaziChapChap - Project Structure

## 📌 Overview

KaziChapChap is a .NET 7-based application following a **Clean Architecture** approach. This structure ensures scalability, maintainability, and separation of concerns, making development more organized and testable.

---

## 🏗️ Project Structure

```bash
KaziChapChap/
├── KaziChapChap.API     # API Layer (Handles HTTP Requests)
├── KaziChapChap.Core    # Core Layer (Business Logic, Models, Interfaces)
├── KaziChapChap.Data    # Data Layer (Database Access, EF Core, Migrations)
├── KaziChapChap.Tests   # Unit Tests and Integration Tests
├── KAZI_CHAP_CHAP.sln   # Solution File
└── README.md            # Project Documentation
```

---

## 📌 Layer Breakdown

### **1️⃣ API Layer (`KaziChapChap.API`)**

> **Purpose**: Acts as the entry point for the application, handling HTTP requests and responses.

- Uses **ASP.NET Core Web API** to expose RESTful endpoints.
- Contains **Controllers** that interact with the Core services.
- Implements **Dependency Injection** to call services from the Core layer.
- Reads configurations from `appsettings.json`.

**Example:**

```csharp

[ApiController]
[Route("api/jobs")]
public class JobController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs()
    {
        var jobs = await _jobService.GetAllJobsAsync();
        return Ok(jobs);
    }
}
```

---

### **2️⃣ Core Layer (`KaziChapChap.Core`)**

> **Purpose**: Contains the application's business logic, domain models, and interfaces.

- Defines **domain models** (e.g., `Job`, `User`, `Payment`).
- Includes **interfaces** for services and repositories (e.g., `IJobService`).
- Implements **business logic** without database concerns.

**Example:**

```csharp

public class Job
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
}

public interface IJobService
{
    Task<List<Job>> GetAllJobsAsync();
}
```

---

### **3️⃣ Data Layer (`KaziChapChap.Data`)**

> **Purpose**: Handles database interactions and data persistence.

- Uses **Entity Framework Core** for ORM (Object-Relational Mapping).
- Contains **Repositories** that interact with the database.
- Implements **Migrations** and `DbContext` for database access.

**Example:**

```csharp
public class KaziDbContext : DbContext
{
    public DbSet<Job> Jobs { get; set; }

    public KaziDbContext(DbContextOptions<KaziDbContext> options) : base(options)
    {
    }
}

public class JobRepository : IJobRepository
{
    private readonly KaziDbContext _context;

    public JobRepository(KaziDbContext context)
    {
        _context = context;
    }

    public async Task<List<Job>> GetAllJobsAsync()
    {
        return await _context.Jobs.ToListAsync();
    }
}
```

---

## 🚀 Running the Project

### **1️⃣ Build the Solution**

```sh
dotnet build
```

### **2️⃣ Run the API**

```sh
dotnet run --project KaziChapChap.API
```

### **3️⃣ Apply Database Migrations**

```sh
dotnet ef migrations add InitialCreate --project KaziChapChap.Data
```

```sh
dotnet ef database update --project KaziChapChap.Data
```

---

## 👥 Team Collaboration

- Follow this structure when adding new features.
- Keep business logic in **Core**, database access in **Data**, and controllers in **API**.
- Use **Dependency Injection** instead of direct dependencies.
- Write **unit tests** in `KaziChapChap.Tests`.

---

## ✅ Best Practices

✔ Follow **SOLID Principles**.  
✔ Use **DTOs** (Data Transfer Objects) for API responses.  
✔ Always **test** before pushing changes.  
✔ Keep configurations in `appsettings.json`.  
✔ Use **Git branching** (`feature/*`, `bugfix/*`).  

---

## 📝 License

This project is licensed under the MIT License. See `LICENSE` for details.
