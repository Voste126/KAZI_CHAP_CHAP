using KaziChapChap.Core.Services; // Ensure this is the correct namespace for IAuthService
using KaziChapChap.Data; // Ensure this is the correct namespace for AuthService and KaziDbContext
using Microsoft.EntityFrameworkCore;
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
    options.AddPolicy("DevelopmentCorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:5173", "https://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
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

app.UseAuthorization();
app.MapControllers();
app.UseDefaultFiles();
app.UseStaticFiles();

app.Run();