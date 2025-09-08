// Helpers/TestDataHelper.cs

using BookApi.Data;
using BookApi.Models.Entities;
using BC = BCrypt.Net.BCrypt;

namespace BookApi.Tests.Helpers
{
    public static class TestDataHelper
    {
        public static User CreateTestUser(string email = "test@example.com", string username = "testuser")
        {
            return new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                Username = username,
                PasswordHash = BC.HashPassword("Password123!"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
        }

        public static Book CreateTestBook(Guid userId, string title = "Test Book", string genre = "Fiction")
        {
            return new Book
            {
                Id = Guid.NewGuid(),
                Title = title,
                Author = "Test Author",
                Genre = genre,
                PublishedDate = DateTime.UtcNow.AddYears(-1),
                Rating = 4,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
        }

        public static void SeedDatabase(BookApiContext context, Guid userId, int bookCount = 5)
        {
            var books = new List<Book>();
            for (int i = 1; i <= bookCount; i++)
            {
                books.Add(CreateTestBook(userId, $"Book {i}", i % 2 == 0 ? "Fiction" : "Science"));
            }
            
            context.Books.AddRange(books);
            context.SaveChanges();
        }
    }
}