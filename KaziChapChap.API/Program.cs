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

        // Add Swagger for all environments
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Configure KaziDbContext with your connection string
        builder.Services.AddDbContext<KaziDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // Register your authentication service
        builder.Services.AddScoped<IAuthService, AuthService>();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("DevelopmentCorsPolicy", policyBuilder =>
            {
                policyBuilder.WithOrigins(
                        "http://localhost:5173", 
                        "https://localhost:5173",
                        "http://localhost:8081",
                        "https://kazi-chap-chap-sa-3118-dev.apps.rm2.thpm.p1.openshiftapps.com",
                        "https://kazi-chap-chap-sa-3118-dev.apps.rm2.thpm.p1.openshiftapps.com",
                        "https://kazi-chap-chap-app-sa-3118-dev.apps.rm2.thpm.p1.openshiftapps.com")
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
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };
            });

        // Optional: Configure HTTPS redirection (comment out if it causes loops in OpenShift Edge)
        // builder.Services.AddHttpsRedirection(options =>
        // {
        //     options.HttpsPort = 443;
        // });

        var app = builder.Build();

        // Always enable Swagger
        app.UseSwagger();
        app.UseSwaggerUI();

        // Redirect "/" to "/swagger" (no trailing slash)
        app.MapGet("/", context =>
        {
            context.Response.Redirect("/swagger");
            return Task.CompletedTask;
        });

        // Use CORS
        app.UseCors("DevelopmentCorsPolicy");

        // If you're using Edge-terminated TLS in OpenShift and seeing redirect loops,
        // comment out or remove this block:
        // if (!app.Environment.IsDevelopment())
        // {
        //     app.UseHttpsRedirection();
        // }

        if (app.Environment.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        else
        {
            app.UseExceptionHandler(errorApp =>
            {
                errorApp.Run(async context =>
                {
                    context.Response.StatusCode = 500;
                    context.Response.ContentType = "application/json";
                    // Log the error details internally here
                    await context.Response.WriteAsync("{\"message\":\"An unexpected error occurred. Please try again later.\"}");
                });
            });
        }

        // Enable Authentication/Authorization
        app.UseAuthentication();
        app.UseAuthorization();

        // If you have a custom logging middleware, use it here (optional)
        // app.UseMiddleware<RequestResponseLoggingMiddleware>();

        // Map controllers and static files
        app.MapControllers();
        app.UseDefaultFiles();
        app.UseStaticFiles();

        // ----------------------------------------------------
        // RUN EF MIGRATIONS ON STARTUP
        // ----------------------------------------------------
        // migrations
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<KaziDbContext>();
            db.Database.Migrate();
        }

        // Finally, run the application
        app.Run();
    }
}





