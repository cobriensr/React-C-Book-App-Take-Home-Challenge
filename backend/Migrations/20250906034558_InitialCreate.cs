using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BookApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Author = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Genre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PublishedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Books", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Books",
                columns: new[] { "Id", "Author", "CreatedAt", "Genre", "IsDeleted", "PublishedDate", "Rating", "Title", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("986975ac-4130-41da-b20e-e7a29af2fa52"), "Gene Kim, Kevin Behr, George Spafford", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2490), "DevOps", false, new DateTime(2013, 1, 10, 0, 0, 0, 0, DateTimeKind.Utc), 4, "The Phoenix Project", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2490) },
                    { new Guid("bbab1eeb-dd9e-4f52-8f5a-60a594526325"), "James Clear", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2500), "Self-Help", false, new DateTime(2018, 10, 16, 0, 0, 0, 0, DateTimeKind.Utc), 5, "Atomic Habits", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2500) },
                    { new Guid("c2487e10-bc4d-4089-b90d-a4e38c02fce9"), "Andy Hunt, Dave Thomas", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2100), "Software", false, new DateTime(1999, 10, 30, 0, 0, 0, 0, DateTimeKind.Utc), 5, "The Pragmatic Programmer", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2220) },
                    { new Guid("cb1b9915-79aa-4d90-8dc2-ce6ee0bcff2f"), "Robert C. Martin", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2470), "Software", false, new DateTime(1999, 10, 30, 0, 0, 0, 0, DateTimeKind.Utc), 5, "Clean Code", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2470) },
                    { new Guid("e0fd905b-60b6-41d7-8eb3-7d91f3bf7c3a"), "Gang of Four", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2480), "Software", false, new DateTime(1999, 10, 30, 0, 0, 0, 0, DateTimeKind.Utc), 4, "Design Patterns", new DateTime(2025, 9, 6, 3, 45, 58, 412, DateTimeKind.Utc).AddTicks(2480) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Books_Author",
                table: "Books",
                column: "Author");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Genre",
                table: "Books",
                column: "Genre");

            migrationBuilder.CreateIndex(
                name: "IX_Books_IsDeleted",
                table: "Books",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_Books_PublishedDate",
                table: "Books",
                column: "PublishedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Title",
                table: "Books",
                column: "Title");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Books");
        }
    }
}
