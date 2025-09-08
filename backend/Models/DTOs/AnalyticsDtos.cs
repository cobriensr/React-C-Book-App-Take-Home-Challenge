// Models/DTOs/AnalyticsDtos.cs

using System.ComponentModel.DataAnnotations;

namespace BookApi.Models.DTOs
{
    public class AdvancedAnalyticsDto
    {
        public OverviewStatsDto Overview { get; set; } = new();
        public List<RatingTrendDto> RatingTrends { get; set; } = new();
        public List<GenreTrendDto> GenreTrends { get; set; } = new();
        public ReadingStatsDto ReadingStats { get; set; } = new();
        public List<TopBookDto> TopBooks { get; set; } = new();
        public List<AuthorStatsDto> TopAuthors { get; set; } = new();
        public List<MonthlyStatsDto> MonthlyStats { get; set; } = new();
    }

    public class OverviewStatsDto
    {
        public int TotalBooks { get; set; }
        public int TotalFavorites { get; set; }
        public double AverageRating { get; set; }
        public int TotalReadingSessions { get; set; }
        public int TotalMinutesRead { get; set; }
        public int TotalPagesRead { get; set; }
        public int BooksReadThisMonth { get; set; }
        public int BooksAddedThisMonth { get; set; }
    }

    public class RatingTrendDto
    {
        public DateTime Date { get; set; }
        public double AverageRating { get; set; }
        public int BookCount { get; set; }
    }

    public class GenreTrendDto
    {
        public string Genre { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public double AverageRating { get; set; }
        public int TotalMinutesRead { get; set; }
    }

    public class ReadingHistoryDto
    {
        public Guid Id { get; set; }
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public string BookAuthor { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public int PagesRead { get; set; }
        public string? Notes { get; set; }
    }

    public class LogReadingSessionDto
    {
        [Required]
        public Guid BookId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Range(0, int.MaxValue)]
        public int PagesRead { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    public class ReadingStatsDto
    {
        public int TotalSessions { get; set; }
        public int TotalMinutes { get; set; }
        public int TotalPages { get; set; }
        public double AverageSessionMinutes { get; set; }
        public double AveragePagesPerSession { get; set; }
        public string MostReadGenre { get; set; } = string.Empty;
        public string LongestReadBook { get; set; } = string.Empty;
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
    }

    public class TopBookDto
    {
        public Guid BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int Rating { get; set; }
        public int ReadingSessions { get; set; }
        public int TotalMinutesRead { get; set; }
    }

    public class AuthorStatsDto
    {
        public string Author { get; set; } = string.Empty;
        public int BookCount { get; set; }
        public double AverageRating { get; set; }
        public int TotalMinutesRead { get; set; }
    }

    public class MonthlyStatsDto
    {
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public int BooksAdded { get; set; }
        public int BooksRead { get; set; }
        public int MinutesRead { get; set; }
        public double AverageRating { get; set; }
    }
}