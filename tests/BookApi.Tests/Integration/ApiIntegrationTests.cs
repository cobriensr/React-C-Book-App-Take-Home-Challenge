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
                Username = $"user_{Guid.NewGuid().ToString().Substring(0, 8)}",  // Ensure username is short enough
                Password = "Password123!"
            };

            var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerDto);
            
            // Log response if it fails
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

            // Get books
            var getBooksResponse = await _client.GetAsync("/api/books");
            getBooksResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            var books = await getBooksResponse.Content.ReadFromJsonAsync<List<BookDto>>();
            books.Should().NotBeNull();
            books!.Should().HaveCount(1);
            books![0].Title.Should().Be("Integration Test Book");
        }

        [Fact]
        public async Task AccessingProtectedEndpoint_WithoutToken_ReturnsUnauthorized()
        {
            var response = await _client.GetAsync("/api/books");
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}