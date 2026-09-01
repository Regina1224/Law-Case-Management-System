import { useMsal } from "@azure/msal-react";
import { LogOut } from "lucide-react";
import { loginRequest } from "../app/msalConfig";
import { useCurrentUser } from "../features/auth/useCurrentUser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AuthButton = () => {
  const { instance, accounts } = useMsal();
  const { user } = useCurrentUser();

  const isLoggedIn = accounts.length > 0;

  const handleLogin = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const handleLogout = async () => {
    await instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  if (!isLoggedIn) {
    return (
      <Button onClick={handleLogin} className="w-full">
        Sign in
      </Button>
    );
  }

  const displayName = user?.displayName ?? accounts[0].name ?? "Signed in";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="h-7 w-7 rounded-md">
              <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.role ?? "..."}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-(--anchor-width) min-w-56"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="grid text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default AuthButton;