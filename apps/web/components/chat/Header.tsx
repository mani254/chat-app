import { useUserStore } from "@/store/useUserStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Ellipsis, LogOut, Moon, Settings, User, Video } from "lucide-react";
import { useState } from "react";
import AvatarDiv from "../common/AvatarDiv";
import FeatureComingSoonModal from "../common/FeatureCommingSoonModal";

const Header = () => {

  const [openFeatureCommingSoonModal, setOpenFeatureCommingSoonModal] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const handleSignOut = useUserStore((state) => state.logout);
  return (
    <div className="flex items-center justify-between px-2 py-2">

      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">
          Chats
        </h1>
      </div>

      <div className="flex gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-2 bg-background-accent/60 rounded-full cursor-pointer hover:bg-background-accent transition shadow-sm">
              <Ellipsis size={16} />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            onClick={() => setOpenFeatureCommingSoonModal(true)}
            className="w-auto bg-background border border-border shadow-lg rounded-xl z-50"
            align="start"
          >

            {/* User Header */}
            <div className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <AvatarDiv showActiveCircle showActiveDot />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-foreground">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-foreground-accent">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">

              <DropdownMenuItem
                className="group flex items-center gap-2 px-4 py-2.5 text-sm text-foreground-accent hover:text-foreground hover:bg-background-accent transition-colors rounded-md mx-1 cursor-pointer"
                onClick={() => setOpenFeatureCommingSoonModal(true)}
              >
                <User className="w-4 h-4 group-hover:text-primary transition-colors" />
                View Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                className="group flex items-center gap-2 px-4 py-2.5 text-sm text-foreground-accent hover:text-foreground hover:bg-background-accent transition-colors rounded-md mx-1 cursor-pointer"
                onClick={() => setOpenFeatureCommingSoonModal(true)}
              >
                <Settings className="w-4 h-4 group-hover:text-primary transition-colors" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                className="group flex items-center gap-2 px-4 py-2.5 text-sm text-foreground-accent hover:text-foreground hover:bg-background-accent transition-colors rounded-md mx-1 cursor-pointer"
                onClick={() => setOpenFeatureCommingSoonModal(true)}
              >
                <Moon className="w-4 h-4 group-hover:text-primary transition-colors" />
                Toggle Theme
              </DropdownMenuItem>

            </div>

            <DropdownMenuSeparator className="my-1 border-border" />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleSignOut}
              className="group flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-md mx-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
              Sign Out
            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>

        <div className="p-2 bg-background-accent rounded-full cursor-pointer" onClick={() => setOpenFeatureCommingSoonModal(true)}>
          <Video size={16} />
        </div>

        <div className="p-2 bg-background-accent/60 rounded-full cursor-pointer hover:bg-background-accent transition shadow-sm" onClick={() => setOpenFeatureCommingSoonModal(true)}>
          <Settings size={16} />
        </div>

        <FeatureComingSoonModal open={openFeatureCommingSoonModal} onOpenChange={setOpenFeatureCommingSoonModal} />

      </div>

    </div>
  )
}

export default Header
