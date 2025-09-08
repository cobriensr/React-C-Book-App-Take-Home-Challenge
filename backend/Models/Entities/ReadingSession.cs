// Models/Entities/ReadingSession.cs

using System.ComponentModel.DataAnnotations;

namespace BookApi.Models.Entities
{
    public class ReadingSession
    {
        public Guid Id { get; set; }
        
        // User who read the book
        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        // Book that was read
        public Guid BookId { get; set; }
        public Book? Book { get; set; }
        
        // Session details
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public int PagesRead { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; }
    }
}
