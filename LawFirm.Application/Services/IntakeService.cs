using LawFirm.Application.DTOs.Intakes;
using LawFirm.Infrastructure.Repositories.Interfaces;
using LawFirm.Shared.Models;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Domain.Entities;

namespace LawFirm.Application.Services
{
    public class IntakeService : IIntakeService
    {
        private readonly IIntakeRepository _intakeRepository;
        private readonly IPracticeAreaRepository _practiceAreaRepository;

        public IntakeService(IIntakeRepository intakeRepository, IPracticeAreaRepository practiceAreaRepository)
        {
            _intakeRepository = intakeRepository;
            _practiceAreaRepository = practiceAreaRepository;
        }

        public async Task<PagedResultDto<IntakeListItemDto>> GetIntakesAsync(
            string? keyword, string? status, int? practiceAreaId, string? assignedReviewer, int page, int pageSize)
        {
            var (items, totalCount) = await _intakeRepository.GetFilteredAsync(
                keyword, status, practiceAreaId, assignedReviewer, page, pageSize);

            var dtoItems = items.Select(i => new IntakeListItemDto
            {
                IntakeId = i.IntakeId,
                IntakeCode = i.IntakeCode,
                ProspectiveClientName = i.ProspectiveClientName,
                PracticeAreaName = i.PracticeArea.Name,
                AssignedReviewer = i.AssignedReviewer,
                Status = i.Status,
                Urgency = i.Urgency,
                CreatedAt = i.CreatedAt
            }).ToList();

            return new PagedResultDto<IntakeListItemDto>
            {
                Items = dtoItems,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<IntakeDetailDto> CreateIntakeAsync(CreateIntakeDto dto)
        {
            // Required field validation
            if (string.IsNullOrWhiteSpace(dto.ProspectiveClientName))
            {
                throw new ArgumentException("Prospective client name is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.LegalIssueSummary))
            {
                throw new ArgumentException("Legal issue summary is required.");
            }

            // PracticeAreaId Existence Check
            var practiceArea = await _practiceAreaRepository.GetByIdAsync(dto.PracticeAreaId);
            if (practiceArea == null)
            {
                throw new KeyNotFoundException($"Practice area with id {dto.PracticeAreaId} was not found.");
            }

            // Generate IntakeCode
            var totalCount = await _intakeRepository.GetTotalCountAsync();
            var intakeCode = $"INT-{(totalCount + 1):D4}";

            // Assemble and save Entity
            var intake = new Intake
            {
                IntakeCode = intakeCode,
                ProspectiveClientName = dto.ProspectiveClientName,
                IntendedClientType = dto.IntendedClientType,
                Email = dto.PrimaryEmail,
                Phone = dto.PrimaryPhone,
                PracticeAreaId = dto.PracticeAreaId,
                LegalIssueSummary = dto.LegalIssueSummary,
                Urgency = dto.Urgency,
                AssignedReviewer = dto.AssignedReviewer,
                SourceOfEnquiry = dto.SourceOfEnquiry,
                ConsultationDate = dto.ConsultationDate,
                Status = "New",
                CreatedAt = DateTime.UtcNow
            };

            var savedIntake = await _intakeRepository.AddAsync(intake);

            // DTO returned by mapping
            return new IntakeDetailDto
            {
                IntakeId = savedIntake.IntakeId,
                IntakeCode = savedIntake.IntakeCode,
                ProspectiveClientName = savedIntake.ProspectiveClientName,
                IntendedClientType = savedIntake.IntendedClientType,
                PrimaryEmail = savedIntake.Email,
                PrimaryPhone = savedIntake.Phone,
                PracticeAreaId = savedIntake.PracticeAreaId,
                PracticeAreaName = practiceArea.Name,
                LegalIssueSummary = savedIntake.LegalIssueSummary,
                Urgency = savedIntake.Urgency,
                AssignedReviewer = savedIntake.AssignedReviewer,
                SourceOfEnquiry = savedIntake.SourceOfEnquiry,
                ConsultationDate = savedIntake.ConsultationDate,
                Status = savedIntake.Status,
                CreatedAt = savedIntake.CreatedAt
            };
        }
    }

}