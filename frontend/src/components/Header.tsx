import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Ellipsis, LogOut, Menu, Moon, Settings, User, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useUIStore } from "../store/useUiStore";
import { signOut, useUserStore } from "../store/useUserStore";
import AvatarDiv from "./Avatar";

const dropdownItemClass = `
  cursor-pointer px-4 py-2 flex items-center text-sm
  hover:bg-background-accent 
  focus:bg-background-accent
  focus:outline-none focus:ring-0 focus:border-none
  active:bg-background-accent/70
  transition-colors
`;

const Header = () => {
  const router = useRouter()
  const { currentUser } = useUserStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const handleSignOut = useCallback(async () => {
    const res = await signOut()
    if (res) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="h-16 flex items-center justify-between border-b border-background-accent shadow-sm px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSidebar()}
            className="lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <h1 className="text-xl font-semibold">
          Chats
        </h1>

      </div>

      <div className="flex gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-2 bg-background-accent rounded-full cursor-pointer hover:bg-background-accent/80 transition">
              <Ellipsis size={19} />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-64 bg-background shadow-xl border border-border rounded-lg z-10"
            align="start"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <AvatarDiv />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator className="my-1" />

            {/* Menu Items */}
            <DropdownMenuItem className={dropdownItemClass}>
              <User className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>

            <DropdownMenuItem className={dropdownItemClass}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem className={dropdownItemClass}>
              <Moon className="w-4 h-4 mr-2" />
              Toggle Theme
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className={`${dropdownItemClass} text-red-500`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>


        <div className="p-2 bg-background-accent rounded-full cursor-pointer">
          <Video size={19} />
        </div>

        <div className="p-2 bg-background-accent rounded-full cursor-pointer">
          <Settings size={19} />
        </div>
      </div>
    </div >
  )

}

export default Header;