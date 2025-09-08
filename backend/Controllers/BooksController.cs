// Controllers/BooksController.cs

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
    [Authorize] // Require authentication for all endpoints
    public class BooksController : ControllerBase
    {
        private readonly BookApiContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<BooksController> _logger;

        public BooksController(BookApiContext context, IMapper mapper, ILogger<BooksController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        // Helper method to get current user ID from JWT claims
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }
            return Guid.Parse(userIdClaim);
        }

        // GET: api/books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookDto>>> GetBooks(
            [FromQuery] string? genre = null,
            [FromQuery] string? author = null,
            [FromQuery] string? search = null,
            [FromQuery] int? minRating = null,
            [FromQuery] int? maxRating = null,
            [FromQuery] DateTime? publishedAfter = null,
            [FromQuery] DateTime? publishedBefore = null,
            [FromQuery] string sortBy = "title",
            [FromQuery] bool descending = false,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                // Start with user's books only
                var query = _context.Books
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrWhiteSpace(genre))
                {
                    query = query.Where(b => b.Genre.ToLower().Contains(genre.ToLower()));
                }

                if (!string.IsNullOrWhiteSpace(author))
                {
                    query = query.Where(b => b.Author.ToLower().Contains(author.ToLower()));
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(b => 
                        b.Title.ToLower().Contains(search.ToLower()) ||
                        b.Author.ToLower().Contains(search.ToLower()) ||
                        b.Genre.ToLower().Contains(search.ToLower()));
                }

                if (minRating.HasValue)
                {
                    query = query.Where(b => b.Rating >= minRating.Value);
                }

                if (maxRating.HasValue)
                {
                    query = query.Where(b => b.Rating <= maxRating.Value);
                }

                if (publishedAfter.HasValue)
                {
                    query = query.Where(b => b.PublishedDate >= publishedAfter.Value);
                }

                if (publishedBefore.HasValue)
                {
                    query = query.Where(b => b.PublishedDate <= publishedBefore.Value);
                }

                // Apply sorting
                query = sortBy.ToLower() switch
                {
                    "author" => descending ? query.OrderByDescending(b => b.Author) : query.OrderBy(b => b.Author),
                    "genre" => descending ? query.OrderByDescending(b => b.Genre) : query.OrderBy(b => b.Genre),
                    "publisheddate" => descending ? query.OrderByDescending(b => b.PublishedDate) : query.OrderBy(b => b.PublishedDate),
                    "rating" => descending ? query.OrderByDescending(b => b.Rating) : query.OrderBy(b => b.Rating),
                    "createdat" => descending ? query.OrderByDescending(b => b.CreatedAt) : query.OrderBy(b => b.CreatedAt),
                    _ => descending ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title)
                };

                // Get total count before pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var books = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var bookDtos = _mapper.Map<List<BookDto>>(books);

                // Add pagination metadata to response headers
                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());
                Response.Headers.Append("X-Total-Pages", Math.Ceiling((double)totalCount / pageSize).ToString());

                return Ok(bookDtos);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt");
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving books");
                return StatusCode(500, new { message = "An error occurred while retrieving books" });
            }
        }

        // GET: api/books/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BookDto>> GetBook(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var book = await _context.Books
                    .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId && !b.IsDeleted);

                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                var bookDto = _mapper.Map<BookDto>(book);
                return Ok(bookDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving book {id}");
                return StatusCode(500, new { message = "An error occurred while retrieving the book" });
            }
        }

        // POST: api/books
        [HttpPost]
        public async Task<ActionResult<BookDto>> CreateBook([FromBody] CreateBookDto createBookDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                
                var book = _mapper.Map<Book>(createBookDto);
                book.UserId = userId; // Set the book owner
                book.Id = Guid.NewGuid();
                book.CreatedAt = DateTime.UtcNow;
                book.UpdatedAt = DateTime.UtcNow;

                _context.Books.Add(book);
                await _context.SaveChangesAsync();

                var bookDto = _mapper.Map<BookDto>(book);
                
                _logger.LogInformation($"Book created: {book.Id} by user: {userId}");
                return CreatedAtAction(nameof(GetBook), new { id = book.Id }, bookDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book");
                return StatusCode(500, new { message = "An error occurred while creating the book" });
            }
        }

        // PUT: api/books/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<BookDto>> UpdateBook(Guid id, [FromBody] UpdateBookDto updateBookDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                
                var book = await _context.Books
                    .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId && !b.IsDeleted);

                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                // Handle concurrency check
                if (updateBookDto.RowVersion != null && book.RowVersion != null && !book.RowVersion.SequenceEqual(updateBookDto.RowVersion))
                {
                    return Conflict(new { message = "The book has been modified by another user. Please refresh and try again." });
                }

                // Update book properties
                _mapper.Map(updateBookDto, book);
                book.UpdatedAt = DateTime.UtcNow;

                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Conflict(new { message = "The book has been modified by another user. Please refresh and try again." });
                }

                var bookDto = _mapper.Map<BookDto>(book);
                
                _logger.LogInformation($"Book updated: {book.Id} by user: {userId}");
                return Ok(bookDto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating book {id}");
                return StatusCode(500, new { message = "An error occurred while updating the book" });
            }
        }

        // DELETE: api/books/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var book = await _context.Books
                    .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId && !b.IsDeleted);

                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }

                // Soft delete
                book.IsDeleted = true;
                book.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                _logger.LogInformation($"Book deleted: {book.Id} by user: {userId}");
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting book {id}");
                return StatusCode(500, new { message = "An error occurred while deleting the book" });
            }
        }

        // GET: api/books/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetBookStats()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var userBooks = await _context.Books
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .ToListAsync();

                if (!userBooks.Any())
                {
                    return Ok(new
                    {
                        totalBooks = 0,
                        averageRating = 0,
                        booksByGenre = new List<BookStatsDto>(),
                        booksByRating = new Dictionary<int, int>(),
                        oldestBook = (BookDto?)null,
                        newestBook = (BookDto?)null,
                        mostRecentlyAdded = (BookDto?)null
                    });
                }

                var stats = new
                {
                    totalBooks = userBooks.Count,
                    averageRating = Math.Round(userBooks.Average(b => b.Rating), 2),
                    booksByGenre = userBooks
                        .GroupBy(b => b.Genre)
                        .Select(g => new BookStatsDto
                        {
                            Genre = g.Key,
                            Count = g.Count(),
                            AverageRating = Math.Round(g.Average(b => b.Rating), 2)
                        })
                        .OrderByDescending(s => s.Count)
                        .ToList(),
                    booksByRating = userBooks
                        .GroupBy(b => b.Rating)
                        .OrderBy(g => g.Key)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    booksByYear = userBooks
                        .GroupBy(b => b.PublishedDate.Year)
                        .OrderBy(g => g.Key)
                        .ToDictionary(g => g.Key, g => g.Count()),
                    oldestBook = _mapper.Map<BookDto>(userBooks.OrderBy(b => b.PublishedDate).FirstOrDefault()),
                    newestBook = _mapper.Map<BookDto>(userBooks.OrderByDescending(b => b.PublishedDate).FirstOrDefault()),
                    mostRecentlyAdded = _mapper.Map<BookDto>(userBooks.OrderByDescending(b => b.CreatedAt).FirstOrDefault()),
                    topAuthors = userBooks
                        .GroupBy(b => b.Author)
                        .Select(g => new { Author = g.Key, Count = g.Count() })
                        .OrderByDescending(a => a.Count)
                        .Take(5)
                        .ToList()
                };

                return Ok(stats);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book statistics");
                return StatusCode(500, new { message = "An error occurred while calculating statistics" });
            }
        }

        // GET: api/books/genres
        [HttpGet("genres")]
        public async Task<ActionResult<IEnumerable<string>>> GetGenres()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var genres = await _context.Books
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .Select(b => b.Genre)
                    .Distinct()
                    .OrderBy(g => g)
                    .ToListAsync();

                return Ok(genres);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting genres");
                return StatusCode(500, new { message = "An error occurred while retrieving genres" });
            }
        }

        // GET: api/books/authors
        [HttpGet("authors")]
        public async Task<ActionResult<IEnumerable<string>>> GetAuthors()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var authors = await _context.Books
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .Select(b => b.Author)
                    .Distinct()
                    .OrderBy(a => a)
                    .ToListAsync();

                return Ok(authors);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting authors");
                return StatusCode(500, new { message = "An error occurred while retrieving authors" });
            }
        }
    }
}
