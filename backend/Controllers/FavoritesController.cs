
// Controllers/FavoritesController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using BookApi.Data;
using BookApi.Models.DTOs;
using BookApi.Models.Entities;
using AutoMapper;
using System.Security.Claims;

namespace BookApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly BookApiContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<FavoritesController> _logger;

        public FavoritesController(BookApiContext context, IMapper mapper, ILogger<FavoritesController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return Guid.Parse(userIdClaim);
        }

        // GET: api/favorites
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FavoriteDto>>> GetFavorites(
            [FromQuery] string? genre = null,
            [FromQuery] string? search = null,
            [FromQuery] string sortBy = "createdAt",
            [FromQuery] bool descending = true,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var query = _context.Favorites
                    .Include(f => f.Book)
                    .Where(f => f.UserId == userId && f.IsActive && !f.Book!.IsDeleted)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrWhiteSpace(genre))
                {
                    query = query.Where(f => f.Book!.Genre.ToLower().Contains(genre.ToLower()));
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(f => 
                        f.Book!.Title.ToLower().Contains(search.ToLower()) ||
                        f.Book!.Author.ToLower().Contains(search.ToLower()) ||
                        (f.Notes != null && f.Notes.ToLower().Contains(search.ToLower())));
                }

                // Apply sorting
                query = sortBy.ToLower() switch
                {
                    "title" => descending 
                        ? query.OrderByDescending(f => f.Book!.Title) 
                        : query.OrderBy(f => f.Book!.Title),
                    "author" => descending 
                        ? query.OrderByDescending(f => f.Book!.Author) 
                        : query.OrderBy(f => f.Book!.Author),
                    "rating" => descending 
                        ? query.OrderByDescending(f => f.Book!.Rating) 
                        : query.OrderBy(f => f.Book!.Rating),
                    "updatedat" => descending 
                        ? query.OrderByDescending(f => f.UpdatedAt) 
                        : query.OrderBy(f => f.UpdatedAt),
                    _ => descending 
                        ? query.OrderByDescending(f => f.CreatedAt) 
                        : query.OrderBy(f => f.CreatedAt)
                };

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply pagination
                var favorites = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(f => new FavoriteDto
                    {
                        Id = f.Id,
                        BookId = f.BookId,
                        Book = _mapper.Map<BookDto>(f.Book),
                        Notes = f.Notes,
                        CreatedAt = f.CreatedAt,
                        UpdatedAt = f.UpdatedAt
                    })
                    .ToListAsync();

                // Add pagination headers
                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());
                Response.Headers.Append("X-Total-Pages", Math.Ceiling((double)totalCount / pageSize).ToString());

                return Ok(favorites);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving favorites");
                return StatusCode(500, new { message = "An error occurred while retrieving favorites" });
            }
        }

        // POST: api/favorites
        [HttpPost]
        public async Task<ActionResult<FavoriteDto>> AddFavorite([FromBody] AddFavoriteDto addFavoriteDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                
                // Check if book exists and belongs to user
                var book = await _context.Books
                    .FirstOrDefaultAsync(b => b.Id == addFavoriteDto.BookId && 
                                             b.UserId == userId && 
                                             !b.IsDeleted);
                
                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                // Check if already favorited
                var existingFavorite = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userId && 
                                             f.BookId == addFavoriteDto.BookId);

                if (existingFavorite != null)
                {
                    if (existingFavorite.IsActive)
                    {
                        return Conflict(new { message = "Book is already in favorites" });
                    }
                    
                    // Reactivate existing favorite
                    existingFavorite.IsActive = true;
                    existingFavorite.Notes = addFavoriteDto.Notes;
                    existingFavorite.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Create new favorite
                    var favorite = new Favorite
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        BookId = addFavoriteDto.BookId,
                        Notes = addFavoriteDto.Notes,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsActive = true
                    };
                    
                    _context.Favorites.Add(favorite);
                    existingFavorite = favorite;
                }

                await _context.SaveChangesAsync();

                // Load the book for response
                await _context.Entry(existingFavorite)
                    .Reference(f => f.Book)
                    .LoadAsync();

                var favoriteDto = new FavoriteDto
                {
                    Id = existingFavorite.Id,
                    BookId = existingFavorite.BookId,
                    Book = _mapper.Map<BookDto>(existingFavorite.Book),
                    Notes = existingFavorite.Notes,
                    CreatedAt = existingFavorite.CreatedAt,
                    UpdatedAt = existingFavorite.UpdatedAt
                };

                _logger.LogInformation($"Book {addFavoriteDto.BookId} added to favorites by user {userId}");
                return CreatedAtAction(nameof(GetFavorites), favoriteDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding favorite");
                return StatusCode(500, new { message = "An error occurred while adding favorite" });
            }
        }

        // DELETE: api/favorites/{bookId}
        [HttpDelete("{bookId}")]
        public async Task<IActionResult> RemoveFavorite(Guid bookId)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var favorite = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userId && 
                                             f.BookId == bookId && 
                                             f.IsActive);

                if (favorite == null)
                {
                    return NotFound(new { message = "Favorite not found" });
                }

                // Soft delete
                favorite.IsActive = false;
                favorite.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Book {bookId} removed from favorites by user {userId}");
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing favorite {bookId}");
                return StatusCode(500, new { message = "An error occurred while removing favorite" });
            }
        }

        // PUT: api/favorites/{bookId}/notes
        [HttpPut("{bookId}/notes")]
        public async Task<ActionResult<FavoriteDto>> UpdateFavoriteNotes(
            Guid bookId, 
            [FromBody] UpdateFavoriteNotesDto updateNotesDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                
                var favorite = await _context.Favorites
                    .Include(f => f.Book)
                    .FirstOrDefaultAsync(f => f.UserId == userId && 
                                             f.BookId == bookId && 
                                             f.IsActive);

                if (favorite == null)
                {
                    return NotFound(new { message = "Favorite not found" });
                }

                favorite.Notes = updateNotesDto.Notes;
                favorite.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                var favoriteDto = new FavoriteDto
                {
                    Id = favorite.Id,
                    BookId = favorite.BookId,
                    Book = _mapper.Map<BookDto>(favorite.Book),
                    Notes = favorite.Notes,
                    CreatedAt = favorite.CreatedAt,
                    UpdatedAt = favorite.UpdatedAt
                };

                _logger.LogInformation($"Notes updated for favorite book {bookId} by user {userId}");
                return Ok(favoriteDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating notes for favorite {bookId}");
                return StatusCode(500, new { message = "An error occurred while updating notes" });
            }
        }

        // GET: api/favorites/popular
        [HttpGet("popular")]
        public async Task<ActionResult<IEnumerable<PopularBookDto>>> GetPopularBooks(
            [FromQuery] int limit = 10,
            [FromQuery] string? genre = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Get books that belong to the current user
                var userBooksQuery = _context.Books
                    .Where(b => b.UserId == userId && !b.IsDeleted);

                if (!string.IsNullOrWhiteSpace(genre))
                {
                    userBooksQuery = userBooksQuery.Where(b => b.Genre.ToLower() == genre.ToLower());
                }

                // Join with favorites to count how many times each book is favorited
                var popularBooks = await userBooksQuery
                    .GroupJoin(
                        _context.Favorites.Where(f => f.IsActive),
                        book => book.Id,
                        favorite => favorite.BookId,
                        (book, favorites) => new
                        {
                            Book = book,
                            FavoriteCount = favorites.Count(),
                            IsFavoritedByCurrentUser = favorites.Any(f => f.UserId == userId)
                        })
                    .OrderByDescending(x => x.FavoriteCount)
                    .ThenByDescending(x => x.Book.Rating)
                    .Take(limit)
                    .Select(x => new PopularBookDto
                    {
                        BookId = x.Book.Id,
                        Title = x.Book.Title,
                        Author = x.Book.Author,
                        Genre = x.Book.Genre,
                        FavoriteCount = x.FavoriteCount,
                        AverageRating = x.Book.Rating,
                        IsFavoritedByCurrentUser = x.IsFavoritedByCurrentUser
                    })
                    .ToListAsync();

                return Ok(popularBooks);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular books");
                return StatusCode(500, new { message = "An error occurred while retrieving popular books" });
            }
        }

        // GET: api/favorites/check/{bookId}
        [HttpGet("check/{bookId}")]
        public async Task<ActionResult<object>> CheckIfFavorite(Guid bookId)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var isFavorite = await _context.Favorites
                    .AnyAsync(f => f.UserId == userId && 
                                  f.BookId == bookId && 
                                  f.IsActive);

                return Ok(new { isFavorite });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking favorite status for book {bookId}");
                return StatusCode(500, new { message = "An error occurred while checking favorite status" });
            }
        }
    }
}
