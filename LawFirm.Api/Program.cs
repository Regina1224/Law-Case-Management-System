using LawFirm.Api.Authorization;
using LawFirm.Api.Middleware;
using LawFirm.Application.Services;
using LawFirm.Application.Services.Interfaces;
using LawFirm.Infrastructure.Data;
using LawFirm.Infrastructure.Repositories;
using LawFirm.Infrastructure.Repositories.Interfaces;
using LawFirm.Infrastructure.Storage;
using LawFirm.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
// Application Insights: only wire up telemetry when a connection string is actually configured,
// since the SDK throws at startup rather than no-op on an empty/missing one.
var appInsightsConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
if (!string.IsNullOrWhiteSpace(appInsightsConnectionString))
{
    builder.Services.AddApplicationInsightsTelemetry();
}
// DI connect DB
builder.Services.AddDbContext<LawFirmDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure()));

builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();

builder.Services.AddMicrosoftIdentityWebApiAuthentication(builder.Configuration);
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SystemAdminOnly", policy =>
        policy.Requirements.Add(new SystemAdminRequirement()));
});
builder.Services.AddScoped<IAuthorizationHandler, SystemAdminAuthorizationHandler>();

// All endpoints require authentication by default; opt out with [AllowAnonymous].
builder.Services.AddControllers(options =>
{
    options.Filters.Add(new AuthorizeFilter());
})
.ConfigureApiBehaviorOptions(options =>
{
    // Keep automatic model-binding validation failures in the same ApiResponse<T>
    // envelope as everything else, instead of the default ValidationProblemDetails shape.
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(kvp => kvp.Value?.Errors.Count > 0)
            .SelectMany(kvp => kvp.Value!.Errors.Select(e => $"{kvp.Key}: {e.ErrorMessage}"))
            .ToList();

        var response = ApiResponse<object>.Fail("One or more validation errors occurred.", "VALIDATION_ERROR", errors);
        return new BadRequestObjectResult(response);
    };
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});
// Reference Data
builder.Services.AddScoped<IPracticeAreaRepository, PracticeAreaRepository>();
builder.Services.AddScoped<IPracticeAreaService, PracticeAreaService>();
// Client
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IClientService, ClientService>();
// Client contact
builder.Services.AddScoped<IClientContactRepository, ClientContactRepository>();
// Client note
builder.Services.AddScoped<IClientNoteRepository, ClientNoteRepository>();
// Intake
builder.Services.AddScoped<IIntakeRepository, IntakeRepository>();
builder.Services.AddScoped<IIntakeService, IntakeService>();
// Document
builder.Services.AddScoped<IDocumentRepository, DocumentRepository>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
//MatterType
builder.Services.AddScoped<IMatterTypeRepository, MatterTypeRepository>();
builder.Services.AddScoped<IMatterTypeService, MatterTypeService>();
// Matter
builder.Services.AddScoped<IMatterRepository, MatterRepository>();
builder.Services.AddScoped<IMatterService, MatterService>();
// Matter note
builder.Services.AddScoped<IMatterNoteRepository, MatterNoteRepository>();
// Matter related party
builder.Services.AddScoped<IMatterRelatedPartyRepository, MatterRelatedPartyRepository>();
// Matter task
builder.Services.AddScoped<IMatterTaskRepository, MatterTaskRepository>();
// Matter deadline
builder.Services.AddScoped<IMatterDeadlineRepository, MatterDeadlineRepository>();
// App user
builder.Services.AddScoped<IAppUserRepository, AppUserRepository>();
builder.Services.AddScoped<IAppUserService, AppUserService>();


var app = builder.Build();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseMiddleware<ExceptionMiddleware>();
//app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
