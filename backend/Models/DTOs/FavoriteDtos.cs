// Models/DTOs/FavoriteDtos.cs

using System.ComponentModel.DataAnnotations;

namespace BookApi.Models.DTOs
{
    public class FavoriteDto
    {
        public Guid Id { get; set; }
        public Guid BookId { get; set; }
        public BookDto Book { get; set; } = new();
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    
    public class AddFavoriteDto
    {
        [Required]
        public Guid BookId { get; set; }
        
        [StringLength(1000)]
        public string? Notes { get; set; }
    }
    
    public class UpdateFavoriteNotesDto
    {
        [StringLength(1000)]
        public string? Notes { get; set; }
    }
    
    public class PopularBookDto
    {
        public Guid BookId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public int FavoriteCount { get; set; }
        public double AverageRating { get; set; }
        public bool IsFavoritedByCurrentUser { get; set; }
    }
}