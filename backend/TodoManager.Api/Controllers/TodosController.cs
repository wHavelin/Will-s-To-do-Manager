using Microsoft.AspNetCore.Mvc;
using TodoManager.Api.Services;

namespace TodoManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodosController : ControllerBase
{
    private readonly ITodoService _service;

    public TodosController(ITodoService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTodoRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("Title is required.");
        var created = await _service.CreateAsync(req.Title.Trim(), req.Description?.Trim(), req.DueDate, req.AssigneeId);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTodoRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest("Title is required.");
        string[] validStatuses = ["New", "Active", "InProgress", "Blocked", "Closed"];
        if (!validStatuses.Contains(req.Status))
            return BadRequest("Invalid status.");
        var updated = await _service.UpdateAsync(id, req.Title.Trim(), req.Description?.Trim(), req.Status, req.DueDate, req.AssigneeId);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}

public record CreateTodoRequest(string Title, string? Description, DateTime? DueDate, int? AssigneeId);
public record UpdateTodoRequest(string Title, string? Description, string Status, DateTime? DueDate, int? AssigneeId);
