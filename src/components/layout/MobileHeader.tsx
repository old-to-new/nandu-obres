'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/(auth)/login/actions'

const navItems = [
  { href: '/obres', label: 'Obres' },
  { href: '/treballadors', label: 'Treballadors' },
  { href: '/planificacio', label: 'Planificació' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/ajustos', label: 'Ajustos' },
] as const

export default function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4 md:hidden"
      style={{ borderColor: 'var(--sidebar-border)' }}
    >
      {/* Logo */}
      <Image
        src="/logo-marcijou.jpg"
        alt="Construccions Marc i Jou"
        width={110}
        height={44}
        className="object-contain"
        priority
      />

      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Tancar menú' : 'Obrir menú'}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 border-b bg-white shadow-sm"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <nav className="space-y-1 p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? {
                          background: 'var(--sidebar-active-bg)',
                          color: 'var(--sidebar-active-text)',
                          borderLeft: '3px solid var(--brand-red)',
                          paddingLeft: '9px',
                        }
                      : {
                          color: 'var(--sidebar-inactive-text)',
                        }
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-2" style={{ borderColor: 'var(--sidebar-border)' }}>
            <form action={signOut}>
              <button
                type="submit"
                className="block w-full px-3 py-2 text-left text-sm font-medium"
                style={{ color: 'var(--sidebar-inactive-text)' }}
              >
                Tancar sessió
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
