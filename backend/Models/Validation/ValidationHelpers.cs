// Models/Validation/ValidationHelpers.cs

using System.ComponentModel.DataAnnotations;

namespace BookApi.Models.Validation
{
    public static class ValidationHelpers
    {
        public static ValidationResult? ValidatePublishedDate(DateTime publishedDate, ValidationContext context)
        {
            if (publishedDate > DateTime.UtcNow)
            {
                return new ValidationResult("Published date cannot be in the future");
            }

            if (publishedDate < new DateTime(1450, 1, 1, 0, 0, 0, DateTimeKind.Utc))
            {
                return new ValidationResult("Published date seems unrealistic (before printing press invention)");
            }

            return ValidationResult.Success;
        }
    }
}
