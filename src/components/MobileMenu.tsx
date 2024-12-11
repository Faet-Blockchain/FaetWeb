/* eslint-disable @next/next/no-img-element */
import { motion } from 'framer-motion'
import NavLink from './NavLink'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const menuVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 35,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 35,
      },
    },
  }

  return (
    <motion.div
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={menuVariants}
      className="fixed top-0 right-0 h-screen w-64 bg-neutral-950 backdrop-blur z-50 p-4"
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <nav className="mt-8 space-y-4 flex flex-col h-full">
            <NavLink href="/#home">Home</NavLink>
            <NavLink href="/roadmap">Roadmap</NavLink>
            <NavLink href="/#contact">Contact</NavLink>
        <div className='flex gap-3'>
          <NavLink href="https://discord.gg/t88HmN52Nd">
              <img
                src="/images/discord.png"
                alt="discord"
                width={48}
                height={48}
                className=""
              />
            </NavLink>
            <NavLink href="https://x.com/FaetStudio">
              <img
                src="/images/X.png"
                alt="X"
                width={48}
                height={48}
                className=""
              />
            </NavLink>
          </div>
      </nav>
    </motion.div>
  )
}

export default MobileMenu

