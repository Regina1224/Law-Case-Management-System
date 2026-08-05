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
        private readonly IClientRepository _clientRepository;
        private readonly IMatterRepository _matterRepository;
        private readonly IMatterTypeRepository _matterTypeRepository;

        public IntakeService(
            IIntakeRepository intakeRepository,
            IPracticeAreaRepository practiceAreaRepository,
            IClientRepository clientRepository,
            IMatterRepository matterRepository,
            IMatterTypeRepository matterTypeRepository)
        {
            _intakeRepository = intakeRepository;
            _practiceAreaRepository = practiceAreaRepository;
            _clientRepository = clientRepository;
            _matterRepository = matterRepository;
            _matterTypeRepository = matterTypeRepository;
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


        public async Task<IntakeDetailDto> GetIntakeByIdAsync(int id)
        {
            var intake = await _intakeRepository.GetByIdAsync(id);
            if (intake == null)
            {
                throw new KeyNotFoundException($"Intake with id {id} was not found.");
            }

            return new IntakeDetailDto
            {
                IntakeId = intake.IntakeId,
                IntakeCode = intake.IntakeCode,
                ProspectiveClientName = intake.ProspectiveClientName,
                IntendedClientType = intake.IntendedClientType,
                PrimaryEmail = intake.Email,
                PrimaryPhone = intake.Phone,
                PracticeAreaId = intake.PracticeAreaId,
                PracticeAreaName = intake.PracticeArea.Name,
                LegalIssueSummary = intake.LegalIssueSummary,
                Urgency = intake.Urgency,
                AssignedReviewer = intake.AssignedReviewer,
                SourceOfEnquiry = intake.SourceOfEnquiry,
                ConsultationDate = intake.ConsultationDate,
                Status = intake.Status,
                CreatedAt = intake.CreatedAt,
                ConvertedClientId = intake.ConvertedClientId,
                ConvertedMatterId = intake.ConvertedMatterId
            };
        }

        public async Task<IntakeDetailDto> UpdateIntakeAsync(int id, UpdateIntakeDto dto)
        {
            var intake = await _intakeRepository.GetByIdAsync(id);
            if (intake == null)
            {
                throw new KeyNotFoundException($"Intake with id {id} was not found.");
            }

            if (string.IsNullOrWhiteSpace(dto.Status))
            {
                throw new ArgumentException("Status is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.LegalIssueSummary))
            {
                throw new ArgumentException("Legal issue summary is required.");
            }

        
            var practiceArea = await _practiceAreaRepository.GetByIdAsync(dto.PracticeAreaId);
            if (practiceArea == null)
            {
                throw new KeyNotFoundException($"Practice area with id {dto.PracticeAreaId} was not found.");
            }

            
            if (intake.Status == "Converted")
            {
                throw new ArgumentException("A converted intake cannot be edited.");
            }

            intake.Status = dto.Status;
            intake.AssignedReviewer = dto.AssignedReviewer;
            intake.PracticeAreaId = dto.PracticeAreaId;
            intake.Urgency = dto.Urgency;
            intake.ConsultationDate = dto.ConsultationDate;
            intake.LegalIssueSummary = dto.LegalIssueSummary;

            var updatedIntake = await _intakeRepository.UpdateAsync(intake);

            return new IntakeDetailDto
            {
                IntakeId = updatedIntake.IntakeId,
                IntakeCode = updatedIntake.IntakeCode,
                ProspectiveClientName = updatedIntake.ProspectiveClientName,
                IntendedClientType = updatedIntake.IntendedClientType,
                PrimaryEmail = updatedIntake.Email,
                PrimaryPhone = updatedIntake.Phone,
                PracticeAreaId = updatedIntake.PracticeAreaId,
                PracticeAreaName = practiceArea.Name,
                LegalIssueSummary = updatedIntake.LegalIssueSummary,
                Urgency = updatedIntake.Urgency,
                AssignedReviewer = updatedIntake.AssignedReviewer,
                SourceOfEnquiry = updatedIntake.SourceOfEnquiry,
                ConsultationDate = updatedIntake.ConsultationDate,
                Status = updatedIntake.Status,
                CreatedAt = updatedIntake.CreatedAt,
                ConvertedClientId = updatedIntake.ConvertedClientId,
                ConvertedMatterId = updatedIntake.ConvertedMatterId
            };
        }

        public async Task<ConvertIntakeResultDto> ConvertIntakeAsync(int id, ConvertIntakeDto dto)
        {
            var intake = await _intakeRepository.GetByIdAsync(id);
            if (intake == null)
            {
                throw new KeyNotFoundException($"Intake with id {id} was not found.");
            }

            if (intake.Status == "Converted")
            {
                throw new ArgumentException("This intake has already been converted.");
            }

            // Resolve the Client: reuse an existing one, or create a new one from the supplied fields.
            Client client;
            if (dto.ExistingClientId.HasValue)
            {
                var existingClient = await _clientRepository.GetByIdAsync(dto.ExistingClientId.Value);
                if (existingClient == null)
                {
                    throw new KeyNotFoundException($"Client with id {dto.ExistingClientId.Value} was not found.");
                }
                client = existingClient;
            }
            else
            {
                if (dto.ClientType != "Individual" && dto.ClientType != "Corporate")
                {
                    throw new ArgumentException("Client type must be either 'Individual' or 'Corporate'.");
                }

                if (dto.ClientType == "Individual")
                {
                    if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
                    {
                        throw new ArgumentException("First name and last name are required for individual client.");
                    }
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(dto.OrganizationName))
                    {
                        throw new ArgumentException("Organization name is required for corporate client.");
                    }
                }

                var clientCount = await _clientRepository.GetClientCountAsync();
                var clientCode = $"CLI-{(clientCount + 1):D4}";

                var newClient = new Client
                {
                    ClientCode = clientCode,
                    ClientType = dto.ClientType!,
                    Status = "Active Client",
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    OrganizationName = dto.OrganizationName,
                    Email = dto.Email ?? intake.Email,
                    Phone = dto.Phone ?? intake.Phone,
                    IsArchived = false,
                    CreatedAt = DateTime.UtcNow
                };

                client = await _clientRepository.AddAsync(newClient);
            }

            // Validate the Matter fields that are not already available on the Intake.
            if (string.IsNullOrWhiteSpace(dto.MatterTitle))
            {
                throw new ArgumentException("Matter title is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.ResponsibleLawyer))
            {
                throw new ArgumentException("Responsible lawyer is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.Status))
            {
                throw new ArgumentException("Status is required.");
            }

            var matterType = await _matterTypeRepository.GetByIdAsync(dto.MatterTypeId);
            if (matterType == null)
            {
                throw new KeyNotFoundException($"Matter type with id {dto.MatterTypeId} was not found.");
            }

            var matterCount = await _matterRepository.GetTotalCountAsync();
            var matterNumber = $"MAT-{(matterCount + 1):D4}";

            var matter = new Matter
            {
                MatterNumber = matterNumber,
                ClientId = client.ClientId,
                MatterTitle = dto.MatterTitle,
                MatterTypeId = dto.MatterTypeId,
                PracticeAreaId = intake.PracticeAreaId,
                ResponsibleLawyer = dto.ResponsibleLawyer,
                SupportingStaff = dto.SupportingStaff,
                Status = dto.Status,
                Priority = dto.Priority,
                Summary = intake.LegalIssueSummary,
                OpenedDate = dto.OpenedDate,
                TargetCloseDate = dto.TargetCloseDate,
                IsConfidential = dto.IsConfidential,
                SourceIntakeId = intake.IntakeId,
                CreatedAt = DateTime.UtcNow
            };

            var savedMatter = await _matterRepository.AddAsync(matter);

            intake.Status = "Converted";
            intake.ConvertedClientId = client.ClientId;
            intake.ConvertedMatterId = savedMatter.MatterId;
            var updatedIntake = await _intakeRepository.UpdateAsync(intake);

            var clientName = client.ClientType == "Individual"
                ? $"{client.FirstName} {client.LastName}".Trim()
                : client.OrganizationName ?? "";

            return new ConvertIntakeResultDto
            {
                IntakeId = updatedIntake.IntakeId,
                IntakeCode = updatedIntake.IntakeCode,
                IntakeStatus = updatedIntake.Status,
                ClientId = client.ClientId,
                ClientCode = client.ClientCode,
                ClientName = clientName,
                MatterId = savedMatter.MatterId,
                MatterNumber = savedMatter.MatterNumber,
                MatterTitle = savedMatter.MatterTitle
            };
        }
    }

}