using System;

namespace LawFirm.Application.DTOs.Clients;

public class ClientListItemDto
{
    public int ClientId { get; set; }
    public string ClientCode { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty; // TODO: 想一下这个字段怎么来？
    public string ClientType { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}


