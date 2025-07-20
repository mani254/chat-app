import { useChatStore } from '@/src/store/useChatStore'
import { useUserStore } from '@/src/store/useUserStore'
import { User } from '@/src/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AvatarDiv from '../Avatar'
const ActiveUsers = () => {

  const activeUsers = useUserStore((state) => state.activeUsers)
  const setActiveUsers = useUserStore((state) => state.setActiveUsers)
  const currentUser = useUserStore((state) => state.currentUser)
  const createChat = useChatStore((state) => state.createChat)
  const router = useRouter();

  useEffect(() => {
    setActiveUsers()
  }, [setActiveUsers])

  async function handleCreateChat(user: User) {
    const info = {
      users: [currentUser!._id, user._id],
      isGroupChat: false,
      name: "",
      groupAdmin: undefined
    }
    await createChat(info).then(res => {
      router.push(`/?chatId=${res._id}`)
    })
  }

  return (
    <div className='flex items-center justify-center gap-3 w-full overflow-x-auto py-2 border-b border-background-accent'>
      {activeUsers?.map((user) => {
        return (
          <div key={user._id} onClick={() => handleCreateChat(user)}>
            <AvatarDiv user={user} showActiveCircle={true} showActiveDot={true}></AvatarDiv>
          </div>
        )
      })}
    </div>
  )
}

export default ActiveUsers
