"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, Settings, LogIn, LogOut, X, FileText } from "lucide-react"

export function Header() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const checkAuthentication = () => {
    const userAuth = localStorage.getItem("isUserAuthenticated")
    const userLoginTime = localStorage.getItem("userLoginTime")

    if (userAuth === "true" && userLoginTime) {
      const now = Date.now()
      const loginTimestamp = Number.parseInt(userLoginTime)
      const sessionDuration = 24 * 60 * 60 * 1000

      if (now - loginTimestamp < sessionDuration) {
        setIsUserAuthenticated(true)
      } else {
        setIsUserAuthenticated(false)
      }
    } else {
      setIsUserAuthenticated(false)
    }

    const adminStatus = localStorage.getItem("isAdmin")
    const adminLoginTime = localStorage.getItem("adminLoginTime")

    if (adminStatus === "true" && adminLoginTime) {
      const now = Date.now()
      const loginTimestamp = Number.parseInt(adminLoginTime)
      const sessionDuration = 24 * 60 * 60 * 1000

      if (now - loginTimestamp < sessionDuration) {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    } else {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    checkAuthentication()
    const interval = setInterval(checkAuthentication, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleUserLogout = () => {
    localStorage.removeItem("isUserAuthenticated")
    localStorage.removeItem("userLoginTime")
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("adminLoginTime")
    localStorage.removeItem("currentUserId")
    localStorage.removeItem("currentUserEmail")
    setIsUserAuthenticated(false)
    setIsAdmin(false)
    setIsMenuOpen(false)
    window.location.href = "/auth"
  }

  const handleAdminLogout = () => {
    localStorage.removeItem("isAdmin")
    localStorage.removeItem("adminLoginTime")
    setIsAdmin(false)
    setIsMenuOpen(false)
    window.location.href = "/"
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (!isUserAuthenticated) {
    return null
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu Button - 3 lines */}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="text-xl font-bold text-gray-900">
              Resource Guide
            </Link>

            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsMenuOpen(false)} />}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-2">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
          >
            <Home className="w-4 h-4 mr-3" />
            Home
          </Link>

          <Link
            href="/submit-resource"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
          >
            <FileText className="w-4 h-4 mr-3" />
            Submit Resource
          </Link>

          {isAdmin ? (
            <>
              <Link
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
              >
                <Settings className="w-4 h-4 mr-3" />
                Admin Panel
              </Link>
              <button
                onClick={handleAdminLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 text-left"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Admin Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
            >
              <LogIn className="w-4 h-4 mr-3" />
              Admin Login
            </Link>
          )}

          <div className="border-t border-gray-200 pt-2 mt-2">
            <button
              onClick={handleUserLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 text-left"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}
