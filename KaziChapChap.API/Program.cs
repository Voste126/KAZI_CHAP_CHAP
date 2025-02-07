using System.Text;
using KaziChapChap.Core.Services; // Ensure this is the correct namespace for IAuthService
using KaziChapChap.Data; // Ensure this is the correct namespace for AuthService and KaziDbContext
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddConsole();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();

// Configure KaziDbContext with a connection string
builder.Services.AddDbContext<KaziDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register AuthService
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
        // Read the JWT secret from configuration (e.g., appsettings.json)
        var secret = builder.Configuration["Jwt:Secret"];
        if (string.IsNullOrEmpty(secret))
        {
            throw new InvalidOperationException("JWT Secret is not configured.");
        }

        // Decode the secret from Base64
        byte[] keyBytes;
        try
        {
            keyBytes = Convert.FromBase64String(secret);
        }
        catch (FormatException ex)
        {
            throw new InvalidOperationException("JWT Secret is not a valid Base64 string.", ex);
        }

        // Ensure the key length is at least 32 bytes (256 bits)
        if (keyBytes.Length < 32)
        {
            throw new InvalidOperationException("JWT Secret must be at least 256 bits (32 bytes) long.");
        }

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,      // For simplicity; in production, consider validating issuer
            ValidateAudience = false,    // For simplicity; in production, consider validating audience
            ClockSkew = TimeSpan.Zero
        };
    });

// Configure HTTPS Redirection (if needed)
builder.Services.AddHttpsRedirection(options =>
{
    options.HttpsPort = 443; // Set the HTTPS port explicitly
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/", () => "Welcome to the KaziChapChap API!");

// IMPORTANT: Use CORS before HTTPS Redirection if your preflight request is hitting the wrong scheme.
app.UseCors("DevelopmentCorsPolicy");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection(); // Only enable HTTPS redirection in production
}

// Add Authentication middleware BEFORE Authorization
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<RequestResponseLoggingMiddleware>();

app.MapControllers();
app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();

