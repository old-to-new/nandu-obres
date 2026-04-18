'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/(auth)/login/actions'

const navItems = [
  { href: '/obres', label: 'Obres' },
  { href: '/treballadors', label: 'Treballadors' },
  { href: '/planificacio', label: 'Planificació' },
  { href: '/vehicles', label: 'Vehicles' },
] as const

export default function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
      <span className="font-semibold text-gray-900">Gestió d&apos;Obres</span>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Tancar menú' : 'Obrir menú'}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-14 border-b border-gray-200 bg-white shadow-sm">
          <nav className="space-y-1 p-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-2">
            <form action={signOut}>
              <button
                type="submit"
                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100"
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
