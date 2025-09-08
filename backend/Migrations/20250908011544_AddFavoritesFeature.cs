using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BookApi.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoritesFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Books",
                keyColumn: "Id",
                keyValue: new Guid("986975ac-4130-41da-b20e-e7a29af2fa52"));

            migrationBuilder.DeleteData(
                table: "Books",
                keyColumn: "Id",
                keyValue: new Guid("bbab1eeb-dd9e-4f52-8f5a-60a594526325"));

            migrationBuilder.DeleteData(
                table: "Books",
                keyColumn: "Id",
                keyValue: new Guid("c2487e10-bc4d-4089-b90d-a4e38c02fce9"));

            migrationBuilder.DeleteData(
                table: "Books",
                keyColumn: "Id",
                keyValue: new Guid("cb1b9915-79aa-4d90-8dc2-ce6ee0bcff2f"));

            migrationBuilder.DeleteData(
                table: "Books",
                keyColumn: "Id",
                keyValue: new Guid("e0fd905b-60b6-41d7-8eb3-7d91f3bf7c3a"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Books",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Favorites_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Favorites_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Books_UserId",
                table: "Books",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_BookId",
                table: "Favorites",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_UserId_BookId",
                table: "Favorites",
                columns: new[] { "UserId", "BookId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Books_Users_UserId",
                table: "Books",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Books_Users_UserId",
                table: "Books");

            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Books_UserId",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Books");

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
        }
    }
}
