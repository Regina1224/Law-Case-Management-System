using LawFirm.Application.DTOs.ReferenceData;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize]
    public class PracticeAreasController : ControllerBase
    {
        private readonly IPracticeAreaService _practiceAreaService;

        public PracticeAreasController(IPracticeAreaService practiceAreaService)
        {
            _practiceAreaService = practiceAreaService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<PracticeAreaDto>>>> GetAll()
        {
            var result = await _practiceAreaService.GetAllActiveAsync();
            return Ok(ApiResponse<IEnumerable<PracticeAreaDto>>.Ok(result));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<PracticeAreaDto>>> GetById(int id)
        {
            var result = await _practiceAreaService.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(ApiResponse<PracticeAreaDto>.Fail("Not found"));
            }
            return Ok(ApiResponse<PracticeAreaDto>.Ok(result));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<PracticeAreaDto>>> Create(CreatePracticeAreaDto dto)
        {
            var result = await _practiceAreaService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<PracticeAreaDto>.Ok(result));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<PracticeAreaDto>>> Update(int id, CreatePracticeAreaDto dto)
        {
            var result = await _practiceAreaService.UpdateAsync(id, dto);
            return Ok(ApiResponse<PracticeAreaDto>.Ok(result));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object?>>> Delete(int id)
        {
            await _practiceAreaService.DeleteAsync(id);
            return Ok(ApiResponse<object?>.Ok(null, "Deleted successfully!"));
        }
    }
}
