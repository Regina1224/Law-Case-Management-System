using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawFirm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIntakeEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Intakes",
                columns: table => new
                {
                    IntakeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IntakeCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProspectiveClientName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IntendedClientType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PracticeAreaId = table.Column<int>(type: "int", nullable: false),
                    LegalIssueSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Urgency = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AssignedReviewer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SourceOfEnquiry = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OpposingPartySummary = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConsultationDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Intakes", x => x.IntakeId);
                    table.ForeignKey(
                        name: "FK_Intakes_PracticeAreas_PracticeAreaId",
                        column: x => x.PracticeAreaId,
                        principalTable: "PracticeAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Intakes_PracticeAreaId",
                table: "Intakes",
                column: "PracticeAreaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Intakes");
        }
    }
}
