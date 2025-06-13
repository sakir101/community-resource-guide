"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export function FloatingAddButton() {
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)

  const checkAuthentication = () => {
    const userAuth = localStorage.getItem("isUserAuthenticated")
    const userLoginTime = localStorage.getItem("userLoginTime")

    if (userAuth === "true" && userLoginTime) {
      const now = Date.now()
      const loginTimestamp = Number.parseInt(userLoginTime)
      const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours

      if (now - loginTimestamp < sessionDuration) {
        setIsUserAuthenticated(true)
      } else {
        setIsUserAuthenticated(false)
      }
    } else {
      setIsUserAuthenticated(false)
    }
  }

  useEffect(() => {
    // Check authentication on mount
    checkAuthentication()

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuthentication()
    }

    window.addEventListener("storage", handleStorageChange)

    // Also check periodically
    const interval = setInterval(checkAuthentication, 1000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Don't show button if user is not authenticated
  if (!isUserAuthenticated) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <Button
        asChild
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 h-16 w-16 p-0 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300"
      >
        <Link href="/submit-resource" className="flex items-center justify-center">
          <FileText className="w-7 h-7 text-blue-600" />
          <span className="sr-only">Submit New Resource</span>
        </Link>
      </Button>

      {/* Tooltip */}
      <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg">
        Add New Resource
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}
