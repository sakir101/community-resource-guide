"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function AddResourceButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const userAuth = localStorage.getItem("isUserAuthenticated")
    const userLoginTime = localStorage.getItem("userLoginTime")

    if (userAuth === "true" && userLoginTime) {
      const now = Date.now()
      const loginTimestamp = Number.parseInt(userLoginTime)
      const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours

      if (now - loginTimestamp < sessionDuration) {
        setIsUserAuthenticated(true)
      }
    }

    // Check if admin is logged in
    const adminStatus = localStorage.getItem("isAdmin")
    const adminLoginTime = localStorage.getItem("adminLoginTime")

    if (adminStatus === "true" && adminLoginTime) {
      const now = Date.now()
      const loginTimestamp = Number.parseInt(adminLoginTime)
      const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours

      if (now - loginTimestamp < sessionDuration) {
        setIsAdmin(true)
      }
    }
  }, [])

  // Don't show button if user is not authenticated
  if (!isUserAuthenticated) {
    return null
  }

  if (!isAdmin) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button asChild size="lg" className="rounded-full shadow-lg" variant="outline">
          <Link href="/login">
            <Plus className="w-5 h-5 mr-2" />
            Admin Login
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button asChild size="lg" className="rounded-full shadow-lg">
        <Link href="/admin">
          <Plus className="w-5 h-5 mr-2" />
          Admin Panel
        </Link>
      </Button>
    </div>
  )
}
