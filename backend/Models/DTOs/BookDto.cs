// Models/DTOs/BookDto.cs
using System.ComponentModel.DataAnnotations;

namespace BookApi.Models.DTOs
{
    public class BookDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public DateTime PublishedDate { get; set; }
        public int Rating { get; set; }
    }

    public class CreateBookDto
    {
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
        [CustomValidation(typeof(Validation.ValidationHelpers), nameof(Validation.ValidationHelpers.ValidatePublishedDate))]
        public DateTime PublishedDate { get; set; }

        [Required(ErrorMessage = "Rating is required")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }
    }

    public class UpdateBookDto
    {
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
        [CustomValidation(typeof(Validation.ValidationHelpers), nameof(Validation.ValidationHelpers.ValidatePublishedDate))]
        public DateTime PublishedDate { get; set; }

        [Required(ErrorMessage = "Rating is required")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        public byte[]? RowVersion { get; set; }
    }

    public class BookStatsDto
    {
        public string Genre { get; set; } = string.Empty;
        public int Count { get; set; }
        public double AverageRating { get; set; }
    }
}