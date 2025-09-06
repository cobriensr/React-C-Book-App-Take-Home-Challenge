// Models/Entities/Book.cs
using System.ComponentModel.DataAnnotations;

namespace BookApi.Models.Entities
{
    public class Book
    {
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(500, MinimumLength = 1, ErrorMessage = "Title must be between 1 and 500 characters")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Author is required")]
        [StringLength(300, MinimumLength = 1, ErrorMessage = "Author must be between 1 and 300 characters")]
        public string Author { get; set; } = string.Empty;

        [Required(ErrorMessage = "Genre is required")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Genre must be between 1 and 100 characters")]
        public string Genre { get; set; } = string.Empty;

        [Required(ErrorMessage = "Published date is required")]
        [DataType(DataType.Date)]
        public DateTime PublishedDate { get; set; }

        [Required(ErrorMessage = "Rating is required")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        // Additional properties for production readiness
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }

        [Timestamp]
        public byte[]? RowVersion { get; set; }
    }
}