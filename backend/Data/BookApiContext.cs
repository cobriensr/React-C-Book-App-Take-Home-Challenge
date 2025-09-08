// Data/BookApiContext.cs

using Microsoft.EntityFrameworkCore;
using BookApi.Models.Entities;

namespace BookApi.Data
{
    public class BookApiContext(DbContextOptions<BookApiContext> options) : DbContext(options)
    {
        public DbSet<Book> Books { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<ReadingSession> ReadingSessions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Username).IsUnique();

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure ReadingSession entity
            modelBuilder.Entity<ReadingSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                // Indexes
                entity.HasIndex(e => new { e.UserId, e.BookId });
                entity.HasIndex(e => e.StartTime);
                
                // Relationships
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction);
                    
                entity.HasOne(e => e.Book)
                    .WithMany()
                    .HasForeignKey(e => e.BookId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.Property(e => e.Notes)
                    .HasMaxLength(500);
                    
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");
            });

            // Configure Book entity
            modelBuilder.Entity<Book>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.User)
                    .WithMany(u => u.Books)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.Title);
                entity.HasIndex(e => e.Author);
                entity.HasIndex(e => e.Genre);
                entity.HasIndex(e => e.PublishedDate);
                entity.HasIndex(e => e.IsDeleted);
                entity.HasIndex(e => e.UserId);

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

                entity.Property(e => e.RowVersion)
                    .IsConcurrencyToken()
                    .ValueGeneratedOnAddOrUpdate();

                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // Configure Favorite entity
            modelBuilder.Entity<Favorite>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Unique constraint: user can only favorite a book once
                entity.HasIndex(e => new { e.UserId, e.BookId }).IsUnique();

                // Relationships
                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.NoAction); // Prevent cascade cycles

                entity.HasOne(e => e.Book)
                    .WithMany()
                    .HasForeignKey(e => e.BookId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(e => e.Notes)
                    .HasMaxLength(1000);

                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("GETUTCDATE()");
            });
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
                .Where(e => (e.Entity is Book || e.Entity is User || e.Entity is Favorite) && 
                           (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                switch (entityEntry.Entity)
                {
                    case Book book:
                        book.UpdatedAt = DateTime.UtcNow;
                        if (entityEntry.State == EntityState.Added)
                        {
                            book.CreatedAt = DateTime.UtcNow;
                            if (book.Id == Guid.Empty)
                                book.Id = Guid.NewGuid();
                        }
                        break;

                    case User user:
                        user.UpdatedAt = DateTime.UtcNow;
                        if (entityEntry.State == EntityState.Added)
                        {
                            user.CreatedAt = DateTime.UtcNow;
                            if (user.Id == Guid.Empty)
                                user.Id = Guid.NewGuid();
                        }
                        break;

                    case Favorite favorite:
                        favorite.UpdatedAt = DateTime.UtcNow;
                        if (entityEntry.State == EntityState.Added)
                        {
                            favorite.CreatedAt = DateTime.UtcNow;
                            if (favorite.Id == Guid.Empty)
                                favorite.Id = Guid.NewGuid();
                        }
                        break;
                    case ReadingSession session:
                        if (entityEntry.State == EntityState.Added)
                        {
                            session.CreatedAt = DateTime.UtcNow;
                            if (session.Id == Guid.Empty)
                                session.Id = Guid.NewGuid();
                        }
                        break;
                }
            }
        }
    }
}