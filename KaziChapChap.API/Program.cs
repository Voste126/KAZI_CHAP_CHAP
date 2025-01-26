// using KaziChapChap.Core; // Ensure this is the correct namespace for IAuthService
// using KaziChapChap.Data; // Ensure this is the correct namespace for AuthService and KaziDbContext
// using Microsoft.EntityFrameworkCore;

// var builder = WebApplication.CreateBuilder(args);

// // Add services to the container.
// builder.Services.AddControllers();
// builder.Services.AddSwaggerGen();

// // Configure KaziDbContext with a connection string
// builder.Services.AddDbContext<KaziDbContext>(options =>
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// // Register AuthService
// builder.Services.AddScoped<IAuthService, AuthService>();

// var app = builder.Build();

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }



// // Later in the middleware pipeline
// app.UseHttpsRedirection();

// app.UseAuthorization();

// app.MapControllers();

// app.Run();

using KaziChapChap.Core; // Ensure this is the correct namespace for IAuthService
using KaziChapChap.Data; // Ensure this is the correct namespace for AuthService and KaziDbContext
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// Configure KaziDbContext with a connection string
builder.Services.AddDbContext<KaziDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register AuthService
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure HTTPS Redirection
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

app.UseHttpsRedirection(); // Enable HTTPS redirection
app.UseAuthorization();
app.MapControllers();

app.Run();