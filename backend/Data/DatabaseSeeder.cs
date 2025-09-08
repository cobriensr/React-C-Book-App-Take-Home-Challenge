// Data/DatabaseSeeder.cs (Optional - for seeding test data)

using BookApi.Models.Entities;
using Microsoft.EntityFrameworkCore;
using BC = BCrypt.Net.BCrypt;

namespace BookApi.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(BookApiContext context)
        {
            // Only seed if database is empty
            if (await context.Users.AnyAsync())
            {
                return;
            }

            // Create a test user
            var testUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                Username = "testuser",
                PasswordHash = BC.HashPassword("Test123!"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            context.Users.Add(testUser);

            // Create sample books for the test user
            var sampleBooks = new List<Book>
            {
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "The Pragmatic Programmer",
                    Author = "Andy Hunt, Dave Thomas",
                    Genre = "Software",
                    PublishedDate = new DateTime(1999, 10, 30, 0, 0, 0, DateTimeKind.Utc),
                    Rating = 5,
                    UserId = testUser.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Clean Code",
                    Author = "Robert C. Martin",
                    Genre = "Software",
                    PublishedDate = new DateTime(2008, 8, 1, 0, 0, 0, DateTimeKind.Utc),
                    Rating = 5,
                    UserId = testUser.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Design Patterns",
                    Author = "Gang of Four",
                    Genre = "Software",
                    PublishedDate = new DateTime(1994, 10, 31, 0, 0, 0, DateTimeKind.Utc),
                    Rating = 4,
                    UserId = testUser.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Books.AddRange(sampleBooks);
            await context.SaveChangesAsync();
        }
    }
}