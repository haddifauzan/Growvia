'use client'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { Menu } from 'lucide-react'

const NavToggle = () => {
  // Hooks
  const { toggleVerticalNav, isBreakpointReached } = useVerticalNav()

  const handleClick = () => {
    toggleVerticalNav()
  }

  return (
    <>
      {/* <Menu className='cursor-pointer w-6 h-6' onClick={handleClick} /> */}
      {/* Comment following code and uncomment above code in order to toggle menu on desktop screens as well */}
      {isBreakpointReached && <Menu className='cursor-pointer w-6 h-6 text-slate-700 dark:text-slate-200' onClick={handleClick} />}
    </>
  )
}

export default NavToggle
