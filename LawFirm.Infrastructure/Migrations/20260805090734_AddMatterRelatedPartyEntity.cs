using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawFirm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMatterRelatedPartyEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MatterRelatedParties",
                columns: table => new
                {
                    MatterRelatedPartyId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MatterId = table.Column<int>(type: "int", nullable: false),
                    PartyName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PartyType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Organization = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MatterRelatedParties", x => x.MatterRelatedPartyId);
                    table.ForeignKey(
                        name: "FK_MatterRelatedParties_Matters_MatterId",
                        column: x => x.MatterId,
                        principalTable: "Matters",
                        principalColumn: "MatterId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MatterRelatedParties_MatterId",
                table: "MatterRelatedParties",
                column: "MatterId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MatterRelatedParties");
        }
    }
}
