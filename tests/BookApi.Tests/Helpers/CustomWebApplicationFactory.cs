// tests/BookApi.Tests/Helpers/CustomWebApplicationFactory.cs

using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using BookApi.Data;
using Microsoft.Extensions.Logging;

namespace BookApi.Tests.Helpers
{
    public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            
            builder.ConfigureServices(services =>
            {
                // Remove the app's BookApiContext registration
                services.RemoveAll(typeof(DbContextOptions<BookApiContext>));
                services.RemoveAll(typeof(BookApiContext));
                
                // Add in-memory database
                var serviceProvider = new ServiceCollection()
                    .AddEntityFrameworkInMemoryDatabase()
                    .BuildServiceProvider();

                services.AddDbContext<BookApiContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                    options.UseInternalServiceProvider(serviceProvider);
                });

                // Build service provider
                var sp = services.BuildServiceProvider();

                // Create a scope to ensure the database is created
                using (var scope = sp.CreateScope())
                {
                    var scopedServices = scope.ServiceProvider;
                    var db = scopedServices.GetRequiredService<BookApiContext>();
                    
                    // Ensure database is created
                    db.Database.EnsureCreated();
                }
            });
        }
    }
}