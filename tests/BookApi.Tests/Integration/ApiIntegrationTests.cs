// Integration/ApiIntegrationTests.cs

using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using BookApi.Models.DTOs;
using FluentAssertions;
using System.Net;

namespace BookApi.Tests.Integration
{
    public class ApiIntegrationTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client = factory.CreateClient();

        [Fact]
        public async Task Register_Login_And_AccessProtectedEndpoint_WorksEndToEnd()
        {
            // Register
            var registerDto = new RegisterDto
            {
                Email = $"test_{Guid.NewGuid()}@example.com",
                Username = $"user_{Guid.NewGuid()}",
                Password = "Password123!"
            };

            var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", registerDto);
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