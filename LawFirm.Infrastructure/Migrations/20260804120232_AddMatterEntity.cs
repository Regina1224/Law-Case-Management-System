using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawFirm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMatterEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Matters",
                columns: table => new
                {
                    MatterId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MatterNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    MatterTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MatterTypeId = table.Column<int>(type: "int", nullable: false),
                    PracticeAreaId = table.Column<int>(type: "int", nullable: false),
                    ResponsibleLawyer = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SupportingStaff = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OpenedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TargetCloseDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ClosedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsConfidential = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Matters", x => x.MatterId);
                    table.ForeignKey(
                        name: "FK_Matters_Clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Clients",
                        principalColumn: "ClientId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matters_MatterTypes_MatterTypeId",
                        column: x => x.MatterTypeId,
                        principalTable: "MatterTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Matters_PracticeAreas_PracticeAreaId",
                        column: x => x.PracticeAreaId,
                        principalTable: "PracticeAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Matters_ClientId",
                table: "Matters",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Matters_MatterTypeId",
                table: "Matters",
                column: "MatterTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_Matters_PracticeAreaId",
                table: "Matters",
                column: "PracticeAreaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Matters");
        }
    }
}
