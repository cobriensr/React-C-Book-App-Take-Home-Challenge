// Controllers/AnalyticsController.cs

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using BookApi.Data;
using BookApi.Models.DTOs;
using BookApi.Models.Entities;
using System.Security.Claims;

namespace BookApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly BookApiContext _context;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(BookApiContext context, ILogger<AnalyticsController> logger)
        {
            _context = context;
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

        // GET: api/analytics/advanced
        [HttpGet("advanced")]
        public async Task<ActionResult<AdvancedAnalyticsDto>> GetAdvancedAnalytics()
        {
            try
            {
                var userId = GetCurrentUserId();
                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                
                // Get user's books
                var userBooks = await _context.Books
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .ToListAsync();
                
                // Get reading sessions
                var readingSessions = await _context.ReadingSessions
                    .Include(rs => rs.Book)
                    .Where(rs => rs.UserId == userId)
                    .ToListAsync();
                
                // Get favorites
                var favoritesCount = await _context.Favorites
                    .Where(f => f.UserId == userId && f.IsActive)
                    .CountAsync();
                
                // Overview stats
                var overview = new OverviewStatsDto
                {
                    TotalBooks = userBooks.Count,
                    TotalFavorites = favoritesCount,
                    AverageRating = userBooks.Any() ? Math.Round(userBooks.Average(b => b.Rating), 2) : 0,
                    TotalReadingSessions = readingSessions.Count,
                    TotalMinutesRead = readingSessions.Sum(rs => rs.DurationMinutes),
                    TotalPagesRead = readingSessions.Sum(rs => rs.PagesRead),
                    BooksReadThisMonth = readingSessions
                        .Where(rs => rs.StartTime >= startOfMonth)
                        .Select(rs => rs.BookId)
                        .Distinct()
                        .Count(),
                    BooksAddedThisMonth = userBooks
                        .Count(b => b.CreatedAt >= startOfMonth)
                };
                
                // Rating trends (last 12 months)
                var ratingTrends = userBooks
                    .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
                    .Select(g => new RatingTrendDto
                    {
                        Date = new DateTime(g.Key.Year, g.Key.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                        AverageRating = Math.Round(g.Average(b => b.Rating), 2),
                        BookCount = g.Count()
                    })
                    .OrderBy(rt => rt.Date)
                    .TakeLast(12)
                    .ToList();
                
                // Genre trends
                var genreTrends = userBooks
                    .GroupBy(b => b.Genre)
                    .Select(g => new GenreTrendDto
                    {
                        Genre = g.Key,
                        Count = g.Count(),
                        Percentage = Math.Round((double)g.Count() / userBooks.Count * 100, 1),
                        AverageRating = Math.Round(g.Average(b => b.Rating), 2),
                        TotalMinutesRead = readingSessions
                            .Where(rs => rs.Book != null && rs.Book.Genre == g.Key)
                            .Sum(rs => rs.DurationMinutes)
                    })
                    .OrderByDescending(gt => gt.Count)
                    .ToList();
                
                // Reading stats
                var readingStats = new ReadingStatsDto
                {
                    TotalSessions = readingSessions.Count,
                    TotalMinutes = readingSessions.Sum(rs => rs.DurationMinutes),
                    TotalPages = readingSessions.Sum(rs => rs.PagesRead),
                    AverageSessionMinutes = readingSessions.Any() 
                        ? Math.Round(readingSessions.Average(rs => rs.DurationMinutes), 1) 
                        : 0,
                    AveragePagesPerSession = readingSessions.Any() 
                        ? Math.Round(readingSessions.Average(rs => (double)rs.PagesRead), 1) 
                        : 0,
                    MostReadGenre = readingSessions
                        .Where(rs => rs.Book != null)
                        .GroupBy(rs => rs.Book!.Genre)
                        .OrderByDescending(g => g.Sum(rs => rs.DurationMinutes))
                        .FirstOrDefault()?.Key ?? "N/A",
                    LongestReadBook = readingSessions
                        .Where(rs => rs.Book != null)
                        .GroupBy(rs => rs.Book!.Title)
                        .OrderByDescending(g => g.Sum(rs => rs.DurationMinutes))
                        .FirstOrDefault()?.Key ?? "N/A",
                    CurrentStreak = CalculateCurrentStreak(readingSessions),
                    LongestStreak = CalculateLongestStreak(readingSessions)
                };
                
                // Top books by reading time
                var topBooks = readingSessions
                    .Where(rs => rs.Book != null)
                    .GroupBy(rs => rs.Book)
                    .Select(g => new TopBookDto
                    {
                        BookId = g.Key!.Id,
                        Title = g.Key.Title,
                        Author = g.Key.Author,
                        Rating = g.Key.Rating,
                        ReadingSessions = g.Count(),
                        TotalMinutesRead = g.Sum(rs => rs.DurationMinutes)
                    })
                    .OrderByDescending(tb => tb.TotalMinutesRead)
                    .Take(5)
                    .ToList();
                
                // Top authors
                var topAuthors = userBooks
                    .GroupBy(b => b.Author)
                    .Select(g => new AuthorStatsDto
                    {
                        Author = g.Key,
                        BookCount = g.Count(),
                        AverageRating = Math.Round(g.Average(b => b.Rating), 2),
                        TotalMinutesRead = readingSessions
                            .Where(rs => rs.Book != null && rs.Book.Author == g.Key)
                            .Sum(rs => rs.DurationMinutes)
                    })
                    .OrderByDescending(a => a.BookCount)
                    .Take(5)
                    .ToList();
                
                // Monthly stats (last 6 months)
                var monthlyStats = Enumerable.Range(0, 6)
                    .Select(i => now.AddMonths(-i))
                    .Select(date => new MonthlyStatsDto
                    {
                        Month = date.ToString("MMMM"),
                        Year = date.Year,
                        BooksAdded = userBooks.Count(b => 
                            b.CreatedAt.Year == date.Year && 
                            b.CreatedAt.Month == date.Month),
                        BooksRead = readingSessions
                            .Where(rs => rs.StartTime.Year == date.Year && 
                                        rs.StartTime.Month == date.Month)
                            .Select(rs => rs.BookId)
                            .Distinct()
                            .Count(),
                        MinutesRead = readingSessions
                            .Where(rs => rs.StartTime.Year == date.Year && 
                                        rs.StartTime.Month == date.Month)
                            .Sum(rs => rs.DurationMinutes),
                        AverageRating = userBooks
                            .Where(b => b.CreatedAt.Year == date.Year && 
                                       b.CreatedAt.Month == date.Month)
                            .Select(b => (double?)b.Rating)
                            .Average() ?? 0
                    })
                    .Reverse()
                    .ToList();
                
                var analytics = new AdvancedAnalyticsDto
                {
                    Overview = overview,
                    RatingTrends = ratingTrends,
                    GenreTrends = genreTrends,
                    ReadingStats = readingStats,
                    TopBooks = topBooks,
                    TopAuthors = topAuthors,
                    MonthlyStats = monthlyStats
                };
                
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting advanced analytics");
                return StatusCode(500, new { message = "An error occurred while retrieving analytics" });
            }
        }

        // GET: api/analytics/rating-trends
        [HttpGet("rating-trends")]
        public async Task<ActionResult<IEnumerable<RatingTrendDto>>> GetRatingTrends(
            [FromQuery] int months = 12)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var trends = await _context.Books
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .Where(b => b.CreatedAt >= DateTime.UtcNow.AddMonths(-months))
                    .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
                    .Select(g => new RatingTrendDto
                    {
                        Date = new DateTime(g.Key.Year, g.Key.Month, 1, 0, 0, 0, DateTimeKind.Utc),
                        AverageRating = Math.Round(g.Average(b => b.Rating), 2),
                        BookCount = g.Count()
                    })
                    .OrderBy(rt => rt.Date)
                    .ToListAsync();
                
                return Ok(trends);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting rating trends");
                return StatusCode(500, new { message = "An error occurred while retrieving rating trends" });
            }
        }

        // GET: api/analytics/genre-trends
        [HttpGet("genre-trends")]
        public async Task<ActionResult<IEnumerable<GenreTrendDto>>> GetGenreTrends()
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var books = await _context.Books
                    .Where(b => b.UserId == userId && !b.IsDeleted)
                    .ToListAsync();
                
                var readingSessions = await _context.ReadingSessions
                    .Include(rs => rs.Book)
                    .Where(rs => rs.UserId == userId)
                    .ToListAsync();
                
                var totalBooks = books.Count;
                
                var trends = books
                    .GroupBy(b => b.Genre)
                    .Select(g => new GenreTrendDto
                    {
                        Genre = g.Key,
                        Count = g.Count(),
                        Percentage = totalBooks > 0 
                            ? Math.Round((double)g.Count() / totalBooks * 100, 1) 
                            : 0,
                        AverageRating = Math.Round(g.Average(b => b.Rating), 2),
                        TotalMinutesRead = readingSessions
                            .Where(rs => rs.Book != null && rs.Book.Genre == g.Key)
                            .Sum(rs => rs.DurationMinutes)
                    })
                    .OrderByDescending(gt => gt.Count)
                    .ToList();
                
                return Ok(trends);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting genre trends");
                return StatusCode(500, new { message = "An error occurred while retrieving genre trends" });
            }
        }

        // GET: api/analytics/reading-history
        [HttpGet("reading-history")]
        public async Task<ActionResult<IEnumerable<ReadingHistoryDto>>> GetReadingHistory(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                
                var query = _context.ReadingSessions
                    .Include(rs => rs.Book)
                    .Where(rs => rs.UserId == userId)
                    .OrderByDescending(rs => rs.StartTime);
                
                var totalCount = await query.CountAsync();
                
                var history = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(rs => new ReadingHistoryDto
                    {
                        Id = rs.Id,
                        BookId = rs.BookId,
                        BookTitle = rs.Book != null ? rs.Book.Title : "Unknown",
                        BookAuthor = rs.Book != null ? rs.Book.Author : "Unknown",
                        StartTime = rs.StartTime,
                        EndTime = rs.EndTime,
                        DurationMinutes = rs.DurationMinutes,
                        PagesRead = rs.PagesRead,
                        Notes = rs.Notes
                    })
                    .ToListAsync();
                
                Response.Headers.Append("X-Total-Count", totalCount.ToString());
                Response.Headers.Append("X-Page", page.ToString());
                Response.Headers.Append("X-Page-Size", pageSize.ToString());
                Response.Headers.Append("X-Total-Pages", Math.Ceiling((double)totalCount / pageSize).ToString());
                
                return Ok(history);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting reading history");
                return StatusCode(500, new { message = "An error occurred while retrieving reading history" });
            }
        }

        // POST: api/analytics/log-reading
        [HttpPost("log-reading")]
        public async Task<ActionResult<ReadingHistoryDto>> LogReadingSession(
            [FromBody] LogReadingSessionDto logReadingDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                
                var userId = GetCurrentUserId();
                
                // Verify book exists and belongs to user
                var book = await _context.Books
                    .FirstOrDefaultAsync(b => b.Id == logReadingDto.BookId && 
                                             b.UserId == userId && 
                                             !b.IsDeleted);
                
                if (book == null)
                {
                    return NotFound(new { message = "Book not found" });
                }
                
                // Calculate duration
                var duration = (int)(logReadingDto.EndTime - logReadingDto.StartTime).TotalMinutes;
                
                if (duration <= 0)
                {
                    return BadRequest(new { message = "End time must be after start time" });
                }
                
                // Create reading session
                var session = new ReadingSession
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    BookId = logReadingDto.BookId,
                    StartTime = logReadingDto.StartTime,
                    EndTime = logReadingDto.EndTime,
                    DurationMinutes = duration,
                    PagesRead = logReadingDto.PagesRead,
                    Notes = logReadingDto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                
                _context.ReadingSessions.Add(session);
                await _context.SaveChangesAsync();
                
                var response = new ReadingHistoryDto
                {
                    Id = session.Id,
                    BookId = session.BookId,
                    BookTitle = book.Title,
                    BookAuthor = book.Author,
                    StartTime = session.StartTime,
                    EndTime = session.EndTime,
                    DurationMinutes = session.DurationMinutes,
                    PagesRead = session.PagesRead,
                    Notes = session.Notes
                };
                
                _logger.LogInformation($"Reading session logged for book {book.Title} by user {userId}");
                return CreatedAtAction(nameof(GetReadingHistory), response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error logging reading session");
                return StatusCode(500, new { message = "An error occurred while logging reading session" });
            }
        }
        
        // Helper methods
        private static int CalculateCurrentStreak(List<ReadingSession> sessions)
        {
            if (sessions.Count == 0) return 0;
            
            var dates = sessions
                .Select(s => s.StartTime.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();
            
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);
            
            if (!dates.Contains(today) && !dates.Contains(yesterday))
                return 0;
            
            int streak = 0;
            var checkDate = dates.Contains(today) ? today : yesterday;
            
            foreach (var date in dates)
            {
                if (date == checkDate)
                {
                    streak++;
                    checkDate = checkDate.AddDays(-1);
                }
                else if (date < checkDate)
                {
                    break;
                }
            }
            
            return streak;
        }
        
        private static int CalculateLongestStreak(List<ReadingSession> sessions)
        {
            if (sessions.Count == 0) return 0;
            
            var dates = sessions
                .Select(s => s.StartTime.Date)
                .Distinct()
                .OrderBy(d => d)
                .ToList();
            
            int maxStreak = 1;
            int currentStreak = 1;
            
            for (int i = 1; i < dates.Count; i++)
            {
                if ((dates[i] - dates[i - 1]).Days == 1)
                {
                    currentStreak++;
                    maxStreak = Math.Max(maxStreak, currentStreak);
                }
                else
                {
                    currentStreak = 1;
                }
            }
            
            return maxStreak;
        }
    }
}