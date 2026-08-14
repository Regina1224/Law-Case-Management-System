using System.Security.Claims;
using LawFirm.Infrastructure.Repositories.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Identity.Web;

namespace LawFirm.Api.Authorization;

public class SystemAdminAuthorizationHandler : AuthorizationHandler<SystemAdminRequirement>
{
    private readonly IAppUserRepository _appUserRepository;

    public SystemAdminAuthorizationHandler(IAppUserRepository appUserRepository)
    {
        _appUserRepository = appUserRepository;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, SystemAdminRequirement requirement)
    {
        var objectId = context.User.GetObjectId()
            ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(objectId))
        {
            return;
        }

        var appUser = await _appUserRepository.GetByEntraObjectIdAsync(objectId);

        if (appUser is { Role: "SystemAdmin", IsActive: true })
        {
            context.Succeed(requirement);
        }
    }
}