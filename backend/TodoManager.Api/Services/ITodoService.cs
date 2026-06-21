using TodoManager.Api.Models;

namespace TodoManager.Api.Services;

public interface ITodoService
{
    Task<IEnumerable<TodoItem>> GetAllAsync();
    Task<TodoItem?> GetByIdAsync(int id);
    Task<TodoItem> CreateAsync(string title, string? description, DateTime? dueDate, int? assigneeId);
    Task<TodoItem?> UpdateAsync(int id, string title, string? description, string status, DateTime? dueDate, int? assigneeId);
    Task<bool> DeleteAsync(int id);
}
