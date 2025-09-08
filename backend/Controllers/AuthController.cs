// Controllers/AuthController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookApi.Data;
using BookApi.Models.DTOs;
using BookApi.Models.Entities;
using BookApi.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using BC = BCrypt.Net.BCrypt;

namespace BookApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly BookApiContext _context;
        private readonly JwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(BookApiContext context, JwtService jwtService, ILogger<AuthController> logger)
        {
            _context = context;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == registerDto.Email || u.Username == registerDto.Username);
                
                if (existingUser != null)
                {
                    return BadRequest(new { message = "User with this email or username already exists" });
                }

                // Create new user
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = registerDto.Email,
                    Username = registerDto.Username,
                    PasswordHash = BC.HashPassword(registerDto.Password),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Generate tokens
                var token = _jwtService.GenerateToken(user);
                var refreshToken = JwtService.GenerateRefreshToken();

                var response = new AuthResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt
                    }
                };

                _logger.LogInformation($"User registered successfully: {user.Email}");
                return CreatedAtAction(nameof(Verify), response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Find user by email or username
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.EmailOrUsername || 
                                             u.Username == loginDto.EmailOrUsername);
                
                if (user == null || !BC.Verify(loginDto.Password, user.PasswordHash))
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                if (!user.IsActive)
                {
                    return Unauthorized(new { message = "Account is inactive" });
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Generate tokens
                var token = _jwtService.GenerateToken(user);
                var refreshToken = JwtService.GenerateRefreshToken();

                var response = new AuthResponseDto
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt
                    }
                };

                _logger.LogInformation($"User logged in successfully: {user.Email}");
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return StatusCode(500, new { message = "An error occurred during login" });
            }
        }

        [HttpGet("verify")]
        [Authorize]
        public async Task<ActionResult<VerifyTokenResponseDto>> Verify()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new VerifyTokenResponseDto 
                    { 
                        IsValid = false, 
                        Message = "Invalid token" 
                    });
                }

                var user = await _context.Users.FindAsync(Guid.Parse(userId));
                
                if (user == null || !user.IsActive)
                {
                    return Unauthorized(new VerifyTokenResponseDto 
                    { 
                        IsValid = false, 
                        Message = "User not found or inactive" 
                    });
                }

                return Ok(new VerifyTokenResponseDto
                {
                    IsValid = true,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Email = user.Email,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token verification");
                return StatusCode(500, new VerifyTokenResponseDto 
                { 
                    IsValid = false, 
                    Message = "An error occurred during verification" 
                });
            }
        }
    }
}