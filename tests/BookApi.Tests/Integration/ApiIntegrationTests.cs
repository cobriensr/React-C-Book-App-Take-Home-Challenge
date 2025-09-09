// tests/BookApi.Tests/Integration/ApiIntegrationTests.cs

using Xunit;
using System.Net.Http.Json;
using BookApi.Models.DTOs;
using FluentAssertions;
using System.Net;
using BookApi.Tests.Helpers;

namespace BookApi.Tests.Integration
{
    [Trait("Category", "Integration")]
    public class ApiIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly CustomWebApplicationFactory<Program> _factory;

        public ApiIntegrationTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task Register_Login_And_AccessProtectedEndpoint_WorksEndToEnd()
        {
            // Register
            var registerDto = new RegisterDto
            {
                Email = $"test_{Guid.NewGuid()}@example.com",
                Username = $"user_{Guid.NewGuid().ToString().Substring(0, 8)}",
                Password = "Password123!"
            };

            var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerDto);
            
            if (registerResponse.StatusCode != HttpStatusCode.Created)
            {
                var errorContent = await registerResponse.Content.ReadAsStringAsync();
                throw new Exception($"Registration failed with status {registerResponse.StatusCode}: {errorContent}");
            }

            registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            var authResponse = await registerResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
            authResponse.Should().NotBeNull();
            authResponse!.Token.Should().NotBeNullOrEmpty();

            // Use token to access protected endpoint
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResponse.Token);

            // Create a book
            var createBookDto = new CreateBookDto
            {
                Title = "Integration Test Book",
                Author = "Test Author",
                Genre = "Test Genre",
                PublishedDate = DateTime.UtcNow,
                Rating = 5
            };

            var bookResponse = await _client.PostAsJsonAsync("/api/books", createBookDto);
            bookResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            // UPDATED: Read as BookWithStatsDto instead of BookDto
            var createdBook = await bookResponse.Content.ReadFromJsonAsync<BookWithStatsDto>();
            createdBook.Should().NotBeNull();
            createdBook!.Title.Should().Be("Integration Test Book");
            createdBook.FavoriteCount.Should().Be(0);  // New book should have 0 favorites
            createdBook.IsFavoritedByCurrentUser.Should().BeFalse();  // User hasn't favorited it yet

            // Get books - UPDATED to use BookWithStatsDto
            var getBooksResponse = await _client.GetAsync("/api/books");
            getBooksResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            
            var books = await getBooksResponse.Content.ReadFromJsonAsync<List<BookWithStatsDto>>();
            books.Should().NotBeNull();
            books!.Should().HaveCount(1);
            books![0].Title.Should().Be("Integration Test Book");
            books![0].FavoriteCount.Should().Be(0);
            books![0].IsFavoritedByCurrentUser.Should().BeFalse();
        }

        [Fact]
        public async Task AccessingProtectedEndpoint_WithoutToken_ReturnsUnauthorized()
        {
            var response = await _client.GetAsync("/api/books");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task CreateBook_ReturnsBookWithStatsDto_WithCorrectDefaults()
        {
            // Register and login first
            var registerDto = new RegisterDto
            {
                Email = $"test_{Guid.NewGuid()}@example.com",
                Username = $"user_{Guid.NewGuid().ToString().Substring(0, 8)}",
                Password = "Password123!"
            };

            var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerDto);
            var authResponse = await registerResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
            
            _client.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", authResponse!.Token);

            // Create a book
            var createBookDto = new CreateBookDto
            {
                Title = "New Book",
                Author = "Author",
                Genre = "Fiction",
                PublishedDate = DateTime.UtcNow,
                Rating = 4
            };

            var bookResponse = await _client.PostAsJsonAsync("/api/books", createBookDto);
            bookResponse.StatusCode.Should().Be(HttpStatusCode.Created);

            var book = await bookResponse.Content.ReadFromJsonAsync<BookWithStatsDto>();
            
            // Verify the new fields
            book.Should().NotBeNull();
            book!.FavoriteCount.Should().Be(0);
            book.IsFavoritedByCurrentUser.Should().BeFalse();
            book.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
            book.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(10));
        }
    }
}