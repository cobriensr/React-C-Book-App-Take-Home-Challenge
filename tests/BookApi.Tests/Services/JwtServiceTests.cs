// Services/JwtServiceTests.cs

using Xunit;
using Microsoft.Extensions.Configuration;
using BookApi.Services;
using BookApi.Models.Entities;
using FluentAssertions;
using System.IdentityModel.Tokens.Jwt;

namespace BookApi.Tests.Services
{
    public class JwtServiceTests
    {
        private readonly JwtService _jwtService;

        public JwtServiceTests()
        {
            var inMemorySettings = new Dictionary<string, string>
            {
                {"Jwt:SecretKey", "TestSecretKeyThatIsAtLeast32CharactersLong!!!"},
                {"Jwt:Issuer", "TestIssuer"},
                {"Jwt:Audience", "TestAudience"},
                {"Jwt:ExpirationMinutes", "60"}
            };

            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemorySettings!)
                .Build();

            _jwtService = new JwtService(configuration);
        }

        [Fact]
        public void GenerateToken_WithValidUser_ReturnsValidJwt()
        {
            // Arrange
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                Username = "testuser"
            };

            // Act
            var token = _jwtService.GenerateToken(user);

            // Assert
            token.Should().NotBeNullOrEmpty();
            
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            
            jwt.Should().NotBeNull();
            jwt.Claims.Should().Contain(c => c.Type == "nameid" && c.Value == user.Id.ToString());
            jwt.Claims.Should().Contain(c => c.Type == "unique_name" && c.Value == user.Username);
            jwt.Claims.Should().Contain(c => c.Type == "email" && c.Value == user.Email);
        }

        [Fact]
        public void GenerateRefreshToken_ReturnsUniqueTokens()
        {
            // Act
            var token1 = JwtService.GenerateRefreshToken();
            var token2 = JwtService.GenerateRefreshToken();

            // Assert
            token1.Should().NotBeNullOrEmpty();
            token2.Should().NotBeNullOrEmpty();
            token1.Should().NotBe(token2);
        }
    }
}