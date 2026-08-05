using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawFirm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIntakeConversionLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SourceIntakeId",
                table: "Matters",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ConvertedClientId",
                table: "Intakes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ConvertedMatterId",
                table: "Intakes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Matters_SourceIntakeId",
                table: "Matters",
                column: "SourceIntakeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Matters_Intakes_SourceIntakeId",
                table: "Matters",
                column: "SourceIntakeId",
                principalTable: "Intakes",
                principalColumn: "IntakeId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Matters_Intakes_SourceIntakeId",
                table: "Matters");

            migrationBuilder.DropIndex(
                name: "IX_Matters_SourceIntakeId",
                table: "Matters");

            migrationBuilder.DropColumn(
                name: "SourceIntakeId",
                table: "Matters");

            migrationBuilder.DropColumn(
                name: "ConvertedClientId",
                table: "Intakes");

            migrationBuilder.DropColumn(
                name: "ConvertedMatterId",
                table: "Intakes");
        }
    }
}
