using Microsoft.EntityFrameworkCore;
using TodoManager.Api.Data;
using TodoManager.Api.Models;

namespace TodoManager.Api.Services;

public class TodoService : ITodoService
{
    private static readonly HashSet<string> ValidStatuses =
        ["New", "Active", "InProgress", "Blocked", "Closed"];

    private readonly AppDbContext _db;

    public TodoService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<TodoItem>> GetAllAsync() =>
        await _db.Todos
            .Include(t => t.Assignee)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

    public async Task<TodoItem?> GetByIdAsync(int id) =>
        await _db.Todos.Include(t => t.Assignee).FirstOrDefaultAsync(t => t.Id == id);

    public async Task<TodoItem> CreateAsync(string title, string? description, DateTime? dueDate, int? assigneeId)
    {
        var item = new TodoItem
        {
            Title = title,
            Description = description,
            DueDate = dueDate,
            AssigneeId = assigneeId,
            CreatedAt = DateTime.UtcNow,
        };
        _db.Todos.Add(item);
        await _db.SaveChangesAsync();
        await _db.Entry(item).Reference(t => t.Assignee).LoadAsync();
        return item;
    }

    public async Task<TodoItem?> UpdateAsync(int id, string title, string? description, string status, DateTime? dueDate, int? assigneeId)
    {
        if (!ValidStatuses.Contains(status)) return null;
        var item = await _db.Todos.Include(t => t.Assignee).FirstOrDefaultAsync(t => t.Id == id);
        if (item is null) return null;
        item.Title = title;
        item.Description = description;
        item.Status = status;
        item.DueDate = dueDate;
        item.AssigneeId = assigneeId;
        await _db.SaveChangesAsync();
        await _db.Entry(item).Reference(t => t.Assignee).LoadAsync();
        return item;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _db.Todos.FindAsync(id);
        if (item is null) return false;
        _db.Todos.Remove(item);
        await _db.SaveChangesAsync();
        return true;
    }
}
