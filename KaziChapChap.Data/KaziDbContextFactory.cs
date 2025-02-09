// using Microsoft.EntityFrameworkCore;
// using Microsoft.EntityFrameworkCore.Design;
// using Microsoft.Extensions.Configuration;

// namespace KaziChapChap.Data
// {
//     public class KaziDbContextFactory : IDesignTimeDbContextFactory<KaziDbContext>
//     {
//         public KaziDbContext CreateDbContext(string[] args)
//         {
//             // Get the base path of the KaziChapChap.API project
//             var basePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), @"../KaziChapChap.API"));

//             // Load configuration from appsettings.json in the KaziChapChap.API folder
//             var configuration = new ConfigurationBuilder()
//                 .SetBasePath(basePath) // Set the base path to the KaziChapChap.API folder
//                 .AddJsonFile("appsettings.json") // Load the appsettings.json file
//                 .Build();

//             // Get the connection string from the configuration
//             var connectionString = configuration.GetConnectionString("DefaultConnection");

//             if (string.IsNullOrEmpty(connectionString))
//             {
//                 throw new InvalidOperationException("Could not find the connection string 'DefaultConnection' in appsettings.json.");
//             }

//             // Configure the DbContext options
//             var optionsBuilder = new DbContextOptionsBuilder<KaziDbContext>();
//             optionsBuilder.UseSqlServer(connectionString);

//             // Create and return the DbContext
//             return new KaziDbContext(optionsBuilder.Options);
//         }
//     }
// }

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace KaziChapChap.Data
{
    public class KaziDbContextFactory : IDesignTimeDbContextFactory<KaziDbContext>
    {
        public KaziDbContext CreateDbContext(string[] args)
        {
            // Get the base path of the KaziChapChap.API project
            var basePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), @"../KaziChapChap.API"));

            // Load configuration from appsettings.json in the KaziChapChap.API folder
            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json")
                .Build();

            // Get the connection string from the configuration
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Could not find the connection string 'DefaultConnection' in appsettings.json.");
            }

            // Configure the DbContext options using Npgsql (PostgreSQL)
            var optionsBuilder = new DbContextOptionsBuilder<KaziDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            // Create and return the DbContext
            return new KaziDbContext(optionsBuilder.Options);
        }
    }
}
