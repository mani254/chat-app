import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Ellipsis, LogOut, Moon, Settings, User, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { signOut } from "../lib/userApi";
import { useUserStore } from "../store/useUserStore";
import AvatarDiv from "./ui/Avatar";
import FeatureComingSoonModal from "./ui/FeatureCommingSoonModal";

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
  const [openFeatureCommingSoonModal, setOpenFeatureCommingSoonModal] = useState(false);



  const handleSignOut = useCallback(async () => {
    const res = await signOut()
    if (res) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="h-16 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4">
      {/* Left side */}
      <div className="flex items-center gap-3">

        <h1 className="text-xl font-semibold tracking-tight">
          Chats
        </h1>

      </div>

      <div className="flex gap-2 items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-2 bg-background-accent/60 rounded-full cursor-pointer hover:bg-background-accent transition shadow-sm">
              <Ellipsis size={19} />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent onClick={() => setOpenFeatureCommingSoonModal(true)}
            className="w-64 bg-background/95 backdrop-blur shadow-xl border border-border rounded-xl z-10"
            align="start"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-border/80">
              <div className="flex items-center gap-3">
                <AvatarDiv />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {currentUser?.name}
                  </p>
                  <p className="text-xs text-foreground-accent">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator className="my-1" />

            {/* Menu Items */}
            <DropdownMenuItem className={dropdownItemClass} onClick={() => setOpenFeatureCommingSoonModal(true)}>
              <User className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>

            <DropdownMenuItem className={dropdownItemClass} onClick={() => setOpenFeatureCommingSoonModal(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuItem className={dropdownItemClass} onClick={() => setOpenFeatureCommingSoonModal(true)}>
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


        <div className="p-2 bg-background-accent rounded-full cursor-pointer" onClick={() => setOpenFeatureCommingSoonModal(true)}>
          <Video size={19} />
        </div>

        <div className="p-2 bg-background-accent/60 rounded-full cursor-pointer hover:bg-background-accent transition shadow-sm" onClick={() => setOpenFeatureCommingSoonModal(true)}>
          <Settings size={19} />
        </div>

        <FeatureComingSoonModal open={openFeatureCommingSoonModal} onOpenChange={setOpenFeatureCommingSoonModal} />
      </div>
    </div >
  )

}

export default Header;