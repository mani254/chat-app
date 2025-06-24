import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "../store/useUserStore";


const AvatarDiv = () => {

  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <Avatar className="w-8 h-8 bg-primary-accent">
      <AvatarImage src={currentUser?.avatar} />
      <AvatarFallback>
        {currentUser?.name?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

export default AvatarDiv
