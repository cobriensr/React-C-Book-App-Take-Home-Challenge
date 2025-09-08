// Program.cs

using BookApi.Data;
using BookApi.Mappings;
using BookApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add console logging for better debugging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Book API", Version = "v1" });
    
    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter JWT with Bearer into field",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add Entity Framework
builder.Services.AddDbContext<BookApiContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// Add JWT Service
builder.Services.AddSingleton<JwtService>();

// Configure JWT Authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "YourSuperSecretKeyThatShouldBeAtLeast32CharactersLong!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "BookApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "BookApiUsers";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    
    // Removed Production policy as it's not being used and causes conflicts
    // For production, you would specify actual origins like:
    // policy.WithOrigins("https://your-frontend.com")
});

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<BookApiContext>();

// Configure URLs explicitly for Azure Container Apps
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(80);
});

var app = builder.Build();

// Log startup information
app.Logger.LogInformation("Book API is starting up...");
app.Logger.LogInformation($"Environment: {app.Environment.EnvironmentName}");
app.Logger.LogInformation($"Content Root: {builder.Environment.ContentRootPath}");

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Book API V1");
    c.RoutePrefix = "swagger";
});

// Important: Use routing before CORS
app.UseRouting();

// Apply CORS
app.UseCors("AllowAll");

// Add OPTIONS handling for preflight requests
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        context.Response.Headers.Append("Access-Control-Allow-Headers", "*");
        context.Response.Headers.Append("Access-Control-Allow-Methods", "*");
        context.Response.StatusCode = 200;
        await context.Response.CompleteAsync();
        return;
    }
    await next.Invoke();
});

// Don't use HTTPS redirection in container (handled by Azure Container Apps)
// app.UseHttpsRedirection();

// Add authentication before authorization
app.UseAuthentication();
app.UseAuthorization();

// Add a root endpoint to prevent Azure default page
app.MapGet("/", () => Results.Ok(new 
{ 
    message = "Book API is running",
    version = "v1",
    status = "healthy",
    timestamp = DateTime.UtcNow,
    endpoints = new 
    {
        swagger = "/swagger",
        health = "/health",
        auth = new[] 
        {
            "POST /api/auth/register",
            "POST /api/auth/login",
            "GET /api/auth/verify"
        }
    }
})).AllowAnonymous();

// Map controllers - this is critical for your API endpoints to work
app.MapControllers();

// Map health check endpoint
app.MapHealthChecks("/health");

// Add fallback for unmatched routes (returns JSON instead of HTML)
app.MapFallback(() => Results.NotFound(new 
{ 
    error = "Endpoint not found",
    message = "The requested endpoint does not exist. Check /swagger for available endpoints.",
    timestamp = DateTime.UtcNow
}));

// Log available endpoints
app.Logger.LogInformation("Configured endpoints:");
app.Logger.LogInformation("- GET /");
app.Logger.LogInformation("- GET /health");
app.Logger.LogInformation("- GET /swagger");
app.Logger.LogInformation("- POST /api/auth/register");
app.Logger.LogInformation("- POST /api/auth/login");
app.Logger.LogInformation("- GET /api/auth/verify");

// Database initialization and seeding (skip in Testing environment)
if (!app.Environment.IsEnvironment("Testing"))
{
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<BookApiContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
            
            try
            {
                // Check if we can connect to the database
                var canConnect = await context.Database.CanConnectAsync();
                
                if (canConnect)
                {
                    logger.LogInformation("Successfully connected to database");
                    
                    // Check if database has any data
                    var hasData = await context.Users.AnyAsync();
                    
                    if (!hasData)
                    {
                        logger.LogInformation("Database is empty, seeding test data...");
                        await DatabaseSeeder.SeedAsync(context);
                        logger.LogInformation("Test data seeded successfully");
                    }
                    else
                    {
                        logger.LogInformation("Database already contains data");
                    }
                }
                else
                {
                    // Database doesn't exist, create it
                    logger.LogInformation("Database doesn't exist, creating...");
                    await context.Database.EnsureCreatedAsync();
                    logger.LogInformation("Database created successfully");
                    
                    // Seed initial data
                    logger.LogInformation("Seeding test data...");
                    await DatabaseSeeder.SeedAsync(context);
                    logger.LogInformation("Test data seeded successfully");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while initializing the database");
                // Don't throw - let the app start even if seeding fails
            }
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Failed to initialize database scope");
    }
}

app.Logger.LogInformation("Book API is ready to serve requests on port 80");
app.Logger.LogInformation($"Listening on: {string.Join(", ", app.Urls)}");

// Run the application
await app.RunAsync();

public partial class Program { }