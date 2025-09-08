// Models/Entities/Favorite.cs

using System.ComponentModel.DataAnnotations;

namespace BookApi.Models.Entities
{
    public class Favorite
    {
        public Guid Id { get; set; }
        
        // User who favorited the book
        public Guid UserId { get; set; }
        public User? User { get; set; }
        
        // Book that was favorited
        public Guid BookId { get; set; }
        public Book? Book { get; set; }
        
        // Optional notes about why it's a favorite
        [StringLength(1000)]
        public string? Notes { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // For unique constraint on UserId + BookId
        public bool IsActive { get; set; } = true;
    }
}