import { useUserStore } from '@/src/store/useUserStore'
import { useEffect } from 'react'
import AvatarDiv from '../Avatar'

const ActiveUsers = () => {

  const activeUsers = useUserStore((state) => state.activeUsers)
  const setActiveUsers = useUserStore((state) => state.setActiveUsers)

  useEffect(() => {
    setActiveUsers()
  }, [setActiveUsers])


  return (
    <div className='flex items-center justify-center gap-3 w-full overflow-x-auto py-2 border-b border-background-accent'>
      {activeUsers?.map((user) => {
        return (
          <div key={user._id} >
            <AvatarDiv user={user} variant='activeUsersList'></AvatarDiv>
          </div>
        )
      })}
    </div>
  )
}

export default ActiveUsers
