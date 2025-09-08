// Models/Entities/User.cs

using System.ComponentModel.DataAnnotations;

namespace BookApi.Models.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        
        [Required]
        [EmailAddress]
        [StringLength(256)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation property for user's books
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}
