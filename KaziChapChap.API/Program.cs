// using System.Text;
// using System.Text.Json.Serialization;
// using KaziChapChap.Core.Services; // Ensure this is the correct namespace for IAuthService
// using KaziChapChap.Data;          // Ensure this is the correct namespace for AuthService and KaziDbContext
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Authentication.JwtBearer;
// using Microsoft.IdentityModel.Tokens;

// public partial class Program
// {
//     public static void Main(string[] args)
//     {
//         var builder = WebApplication.CreateBuilder(args);

//         builder.Logging.AddConsole();

//         // Add services to the container.
//         builder.Services.AddControllers()
//             .AddJsonOptions(options =>
//             {
//                 options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
//             });
//         builder.Services.AddSwaggerGen();
//         builder.Services.AddEndpointsApiExplorer();

//         // Configure KaziDbContext with your connection string (using Npgsql in this example)
//         builder.Services.AddDbContext<KaziDbContext>(options =>
//             options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

//         // Register your authentication service.
//         builder.Services.AddScoped<IAuthService, AuthService>();

//         // Configure CORS policy (adjust the allowed origins as needed).
//         builder.Services.AddCors(options =>
//         {
//             options.AddPolicy("DevelopmentCorsPolicy", policyBuilder =>
//             {
//                 policyBuilder.WithOrigins("http://localhost:5173", "https://localhost:5173")
//                              .AllowAnyHeader()
//                              .AllowAnyMethod()
//                              .AllowCredentials();
//             });
//         });

//         // Configure JWT Authentication
//         builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//             .AddJwtBearer(options =>
//             {
//                 var secret = builder.Configuration["Jwt:Secret"];
//                 if (string.IsNullOrEmpty(secret))
//                 {
//                     throw new InvalidOperationException("JWT Secret is not configured.");
//                 }

//                 byte[] keyBytes;
//                 try
//                 {
//                     keyBytes = Convert.FromBase64String(secret);
//                 }
//                 catch (FormatException ex)
//                 {
//                     throw new InvalidOperationException("JWT Secret is not a valid Base64 string.", ex);
//                 }

//                 if (keyBytes.Length < 32)
//                 {
//                     throw new InvalidOperationException("JWT Secret must be at least 256 bits (32 bytes) long.");
//                 }

//                 options.TokenValidationParameters = new TokenValidationParameters
//                 {
//                     ValidateIssuerSigningKey = true,
//                     IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
//                     ValidateIssuer = false,      // For simplicity
//                     ValidateAudience = false,    // For simplicity
//                     ClockSkew = TimeSpan.Zero
//                 };
//             });

//         // Optionally configure HTTPS redirection
//         builder.Services.AddHttpsRedirection(options =>
//         {
//             options.HttpsPort = 443;
//         });

//         var app = builder.Build();

//         if (app.Environment.IsDevelopment())
//         {
//             app.UseSwagger();
//             app.UseSwaggerUI();
//         }

//         app.MapGet("/", context =>
//         {
//             context.Response.Redirect("http://localhost:5181/swagger/index.html");
//             return Task.CompletedTask;
//         });

//         // Use CORS before HTTPS redirection if needed.
//         app.UseCors("DevelopmentCorsPolicy");

//         if (!app.Environment.IsDevelopment())
//         {
//             app.UseHttpsRedirection();
//         }

//         app.UseAuthentication();
//         app.UseAuthorization();

//         // (Optional) Request/response logging middleware – if you have one registered.
//         app.UseMiddleware<RequestResponseLoggingMiddleware>();

//         app.MapControllers();
//         app.UseDefaultFiles();
//         app.UseStaticFiles();

//         app.Run();
//     }
// }
using System.Text;
using System.Text.Json.Serialization;
using KaziChapChap.Core.Services; // Adjust if needed
using KaziChapChap.Data;          // Adjust if needed
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

public partial class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Logging.AddConsole();

        // Add services to the container.
        builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                // If you need circular reference preservation
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
            });

        // Add Swagger for all environments (not just dev)
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Configure KaziDbContext with your connection string (using Npgsql in this example)
        builder.Services.AddDbContext<KaziDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Register your authentication service
        builder.Services.AddScoped<IAuthService, AuthService>();

        // Configure CORS policy
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("DevelopmentCorsPolicy", policyBuilder =>
            {
                policyBuilder.WithOrigins("http://localhost:5173", "https://localhost:5173")
                             .AllowAnyHeader()
                             .AllowAnyMethod()
                             .AllowCredentials();
            });
        });

        // Configure JWT Authentication
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var secret = builder.Configuration["Jwt:Secret"];
                if (string.IsNullOrEmpty(secret))
                {
                    throw new InvalidOperationException("JWT Secret is not configured.");
                }

                byte[] keyBytes;
                try
                {
                    keyBytes = Convert.FromBase64String(secret);
                }
                catch (FormatException ex)
                {
                    throw new InvalidOperationException("JWT Secret is not a valid Base64 string.", ex);
                }

                if (keyBytes.Length < 32)
                {
                    throw new InvalidOperationException("JWT Secret must be at least 256 bits (32 bytes) long.");
                }

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    ValidateIssuer = false,      // For simplicity
                    ValidateAudience = false,    // For simplicity
                    ClockSkew = TimeSpan.Zero
                };
            });

        // Optionally configure HTTPS redirection
        builder.Services.AddHttpsRedirection(options =>
        {
            options.HttpsPort = 443;
        });

        var app = builder.Build();

        // Always enable Swagger UI (both dev and production)
        app.UseSwagger();
        app.UseSwaggerUI();

        // Root path redirect to Swagger
        app.MapGet("/", context =>
        {
            // Instead of redirecting to http://localhost:5181, just redirect to /swagger
            context.Response.Redirect("/swagger");
            return Task.CompletedTask;
        });

        // Use CORS
        app.UseCors("DevelopmentCorsPolicy");

        // Only redirect to HTTPS in non-development
        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        // Enable Authentication/Authorization
        app.UseAuthentication();
        app.UseAuthorization();

        // If you have a custom logging middleware, use it here
        app.UseMiddleware<RequestResponseLoggingMiddleware>();

        // Map controllers and static files
        app.MapControllers();
        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.Run();
    }
}





