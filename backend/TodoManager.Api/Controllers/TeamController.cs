using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoManager.Api.Data;
using TodoManager.Api.Models;

namespace TodoManager.Api.Controllers;

[ApiController]
[Route("api/team")]
public class TeamController : ControllerBase
{
    private readonly AppDbContext _db;

    public TeamController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.TeamMembers.OrderBy(m => m.Name).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var member = await _db.TeamMembers.FindAsync(id);
        return member is null ? NotFound() : Ok(member);
    }

    [HttpPost]
    public async Task<IActionResult> Add(AddMemberRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");
        var member = new TeamMember { Name = req.Name.Trim() };
        _db.TeamMembers.Add(member);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remove(int id)
    {
        var member = await _db.TeamMembers.FindAsync(id);
        if (member is null) return NotFound();
        _db.TeamMembers.Remove(member);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record AddMemberRequest(string Name);
