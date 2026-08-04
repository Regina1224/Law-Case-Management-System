using LawFirm.Application.DTOs.ReferenceData;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Mvc;

namespace LawFirm.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MatterTypesController : ControllerBase
    {
        private readonly IMatterTypeService _matterTypeService;

        public MatterTypesController(IMatterTypeService matterTypeService)
        {
            _matterTypeService = matterTypeService;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<MatterTypeDto>>>> GetAll()
        {
            var result = await _matterTypeService.GetAllActiveAsync();
            return Ok(ApiResponse<IEnumerable<MatterTypeDto>>.Ok(result));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<MatterTypeDto>>> GetById(int id)
        {
            var result = await _matterTypeService.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(ApiResponse<MatterTypeDto>.Fail("Not found"));
            }
            return Ok(ApiResponse<MatterTypeDto>.Ok(result));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<MatterTypeDto>>> Create(CreateMatterTypeDto dto)
        {
            var result = await _matterTypeService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<MatterTypeDto>.Ok(result));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<MatterTypeDto>>> Update(int id, CreateMatterTypeDto dto)
        {
            var result = await _matterTypeService.UpdateAsync(id, dto);
            return Ok(ApiResponse<MatterTypeDto>.Ok(result));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<object?>>> Delete(int id)
        {
            await _matterTypeService.DeleteAsync(id);
            return Ok(ApiResponse<object?>.Ok(null, "Deleted successfully!"));
        }
    }
}