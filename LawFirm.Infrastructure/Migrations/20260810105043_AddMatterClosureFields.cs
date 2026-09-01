using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawFirm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMatterClosureFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClosureNotes",
                table: "Matters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClosureReason",
                table: "Matters",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClosureNotes",
                table: "Matters");

            migrationBuilder.DropColumn(
                name: "ClosureReason",
                table: "Matters");
        }
    }
}
