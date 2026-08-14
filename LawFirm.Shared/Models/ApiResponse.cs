namespace LawFirm.Shared.Models;

public class ApiResponse<T>
{
    public bool Success { get; set;}
    public T? Data { get; set; }
    public string? Message { get; set; }
    public string? Code { get; set; }
    public List<string>? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message
        };

    }

    public static ApiResponse<T> Fail(string message, string? code = null, List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Data = default,
            Message = message,
            Code = code,
            Errors = errors
        };
    }

}
