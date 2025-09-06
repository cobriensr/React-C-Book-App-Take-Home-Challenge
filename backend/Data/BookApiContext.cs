// Data/BookApiContext.cs
using Microsoft.EntityFrameworkCore;
using BookApi.Models.Entities;

namespace BookApi.Data
{
    public class BookApiContext : DbContext
    {
        public BookApiContext(DbContextOptions<BookApiContext> options)
            : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Book entity
            modelBuilder.Entity<Book>(entity =>
            {
                // Primary key
                entity.HasKey(e => e.Id);

                // Indexes
                entity.HasIndex(e => e.Title);
                entity.HasIndex(e => e.Author);
                entity.HasIndex(e => e.Genre);
                entity.HasIndex(e => e.PublishedDate);
                entity.HasIndex(e => e.IsDeleted);

                // Property configurations
                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.Author)
                    .IsRequired()
                    .HasMaxLength(300);

                entity.Property(e => e.Genre)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Rating)
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                // Configure row version for concurrency control
                entity.Property(e => e.RowVersion)
                    .IsConcurrencyToken()
                    .ValueGeneratedOnAddOrUpdate();

                // Global query filter for soft delete
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // Seed data for testing
            modelBuilder.Entity<Book>().HasData(
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "The Pragmatic Programmer",
                    Author = "Andy Hunt, Dave Thomas",
                    Genre = "Software",
                    PublishedDate = new DateTime(1999, 10, 30, 0, 0, 0, DateTimeKind.Utc),
                    Rating = 5,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Clean Code",
                    Author = "Robert C. Martin",
                    Genre = "Software",
                    PublishedDate = new DateTime(1999, 10, 30, 0, 0, 0, DateTimeKind.Utc),
                    Rating = 5,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Design Patterns",
                    Author = "Gang of Four",
                    Genre = "Software",
                    PublishedDate = new DateTime(1999, 10, 30, 0, 0, 0, DateTimeKind.Utc),
                    Rating = 4,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "The Phoenix Project",
                    Author = "Gene Kim, Kevin Behr, George Spafford",
                    Genre = "DevOps",
                    PublishedDate = new DateTime(2013, 1, 10, 0, 0, 0, DateTimeKind.Utc),
                    Rating = 4,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Atomic Habits",
                    Author = "James Clear",
                    Genre = "Self-Help",
                    PublishedDate = new DateTime(2018, 10, 16, 0, 0, 0, DateTimeKind.Utc),
                    Rating = 5,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                }
            );
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.Entity is Book && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                var book = (Book)entityEntry.Entity;
                book.UpdatedAt = DateTime.UtcNow;

                if (entityEntry.State == EntityState.Added)
                {
                    book.CreatedAt = DateTime.UtcNow;
                    if (book.Id == Guid.Empty)
                    {
                        book.Id = Guid.NewGuid();
                    }
                }
            }
        }
    }
}