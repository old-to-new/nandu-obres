'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { HardHat, Users, CalendarDays, Truck, Settings, LogOut } from 'lucide-react'
import { signOut } from '@/app/(auth)/login/actions'

const navItems = [
  { href: '/obres', label: 'Obres', Icon: HardHat },
  { href: '/treballadors', label: 'Treballadors', Icon: Users },
  { href: '/planificacio', label: 'Planificació', Icon: CalendarDays },
  { href: '/vehicles', label: 'Vehicles', Icon: Truck },
  { href: '/ajustos', label: 'Ajustos', Icon: Settings },
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
        className="flex h-20 items-center justify-center px-4"
      >
        <Image
          src="/logo-marcijou.jpg"
          alt="Construccions Marc i Jou"
          width={140}
          height={60}
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col p-2 gap-0.5" aria-label="Navegació principal">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 py-2 text-sm font-medium transition-colors duration-150"
              style={
                isActive
                  ? {
                      background: 'var(--sidebar-active-bg)',
                      color: 'var(--sidebar-active-text)',
                      borderLeft: '3px solid var(--brand-red)',
                      paddingLeft: '13px',
                      paddingRight: '12px',
                    }
                  : {
                      color: 'var(--sidebar-inactive-text)',
                      borderLeft: '3px solid transparent',
                      paddingLeft: '13px',
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
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              {label}
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
            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium transition-colors duration-150"
            style={{ color: 'var(--sidebar-inactive-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover-bg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
            Tancar sessió
          </button>
        </form>
      </div>
    </aside>
  )
}
