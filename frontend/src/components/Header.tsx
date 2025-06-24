import { Button } from "@/components/ui/button";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Menu, Moon, Settings, Sun, User } from "lucide-react";
import { useUIStore } from "../store/useUiStore";
import { useUserStore } from "../store/useUserStore";
import AvatarDiv from "./Avatar";

const Header = () => {
  const { currentUser } = useUserStore();
  console.log(currentUser, 'currentUser')
  const { isDarkMode, isSidebarOpen, toggleSidebar, toggleTheme } = useUIStore();
  return (
    <div className="h-16 bg-background border-b border-background-accent px-4 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <h1 className="text-xl font-semibold">
          Messenger
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-9 h-9 p-0"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu >
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full cursor-pointer">
              <AvatarDiv />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56 bg-background shadow" align="end">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">
                {currentUser?.name}
              </p>
              <p className="text-xs">
                {currentUser?.email}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              // onClick={toggleProfileDrawer}
              className="cursor-pointer hover:bg-background-accent"
            >
              <User className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer hover:bg-background-accent">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-background-accent" />

            <DropdownMenuItem className="cursor-pointer hover:bg-background-accent text-red-500">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

}

export default Header;