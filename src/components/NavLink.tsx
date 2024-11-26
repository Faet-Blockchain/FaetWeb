import Link from 'next/link'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <Link href={href} className="hover:text-white transition-colors">
      {children}
    </Link>
  )
}

export default NavLink

