import Link from 'next/link'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  target?: string // Make target optional
  rel?: string // Make rel optional
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, target, rel }) => {
  return (
    <Link href={href} className="hover:text-white transition-colors" target={target} rel={rel}>
      {children}
    </Link>
  )
}

export default NavLink
