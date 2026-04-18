'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/(auth)/login/actions'

const navItems = [
  { href: '/obres', label: 'Obres', icon: '🏗️' },
  { href: '/treballadors', label: 'Treballadors', icon: '👷' },
  { href: '/planificacio', label: 'Planificació', icon: '📅' },
  { href: '/vehicles', label: 'Vehicles', icon: '🚐' },
] as const

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
      className="flex h-full w-56 flex-col"
    >
      {/* Logo area */}
      <div
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        className="flex h-14 items-center px-4"
      >
        <span
          className="text-lg font-bold tracking-widest uppercase"
          style={{
            fontFamily: 'var(--font-heading, Oswald, Arial, sans-serif)',
            color: 'var(--brand-red)',
            letterSpacing: '0.12em',
          }}
        >
          Nandu
        </span>
        <span
          className="ml-1 text-lg font-bold tracking-widest uppercase"
          style={{
            fontFamily: 'var(--font-heading, Oswald, Arial, sans-serif)',
            color: 'var(--text-primary)',
            letterSpacing: '0.12em',
          }}
        >
          Obres
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col p-2 gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 py-2 text-sm font-medium transition-colors duration-200"
              style={
                isActive
                  ? {
                      background: 'var(--sidebar-active-bg)',
                      color: 'var(--sidebar-active-text)',
                      borderLeft: '3px solid var(--brand-red)',
                      paddingLeft: '9px',
                      paddingRight: '12px',
                    }
                  : {
                      color: 'var(--sidebar-inactive-text)',
                      borderLeft: '3px solid transparent',
                      paddingLeft: '9px',
                      paddingRight: '12px',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--sidebar-hover-bg)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
        className="p-2"
      >
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-200"
            style={{ color: 'var(--sidebar-inactive-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <span aria-hidden="true">🚪</span>
            Tancar sessió
          </button>
        </form>
      </div>
    </aside>
  )
}
