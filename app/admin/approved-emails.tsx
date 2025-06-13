"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Upload, Plus, Check, X, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getApprovedEmails,
  addApprovedEmail,
  removeApprovedEmail,
  addMultipleApprovedEmails,
} from "@/app/lib/approved-emails"

export function ApprovedEmailsManager() {
  const [approvedEmails, setApprovedEmails] = useState<string[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [bulkEmails, setBulkEmails] = useState("")
  const [isAddingBulk, setIsAddingBulk] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    added: string[]
    invalid: string[]
    duplicates: string[]
  } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadApprovedEmails()
  }, [])

  const loadApprovedEmails = () => {
    const emails = getApprovedEmails()
    setApprovedEmails(emails)
  }

  const handleAddEmail = () => {
    if (!newEmail) return

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    const success = addApprovedEmail(newEmail)

    if (success) {
      toast({
        title: "Email Added",
        description: `${newEmail} has been added to the approved list`,
      })
      setNewEmail("")
      loadApprovedEmails()
    } else {
      toast({
        title: "Already Exists",
        description: "This email is already in the approved list",
        variant: "destructive",
      })
    }
  }

  const handleRemoveEmail = (email: string) => {
    if (confirm(`Are you sure you want to remove ${email} from the approved list?`)) {
      const success = removeApprovedEmail(email)

      if (success) {
        toast({
          title: "Email Removed",
          description: `${email} has been removed from the approved list`,
        })
        loadApprovedEmails()
      }
    }
  }

  const handleBulkUpload = () => {
    if (!bulkEmails.trim()) {
      toast({
        title: "No Emails Provided",
        description: "Please enter at least one email address",
        variant: "destructive",
      })
      return
    }

    const result = addMultipleApprovedEmails(bulkEmails)
    setUploadResult(result)

    if (result.added.length > 0) {
      toast({
        title: "Emails Added",
        description: `${result.added.length} email(s) have been added to the approved list`,
      })
      setBulkEmails("")
      loadApprovedEmails()
    } else {
      toast({
        title: "No New Emails Added",
        description: "No new emails were added to the list",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Approved Emails</span>
            <Badge variant="secondary">{approvedEmails.length} emails</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="new-email" className="mb-2">
                  Add New Email
                </Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleAddEmail}>
                <Plus className="w-4 h-4 mr-2" />
                Add Email
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Bulk Upload</h3>
              <Button variant="outline" size="sm" onClick={() => setIsAddingBulk(!isAddingBulk)}>
                {isAddingBulk ? "Cancel" : "Bulk Upload"}
              </Button>
            </div>

            {isAddingBulk && (
              <div className="space-y-3 p-4 border rounded-md bg-gray-50">
                <div>
                  <Label htmlFor="bulk-emails">Enter Multiple Emails</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Enter one email per line, or separate with commas or semicolons
                  </p>
                  <Textarea
                    id="bulk-emails"
                    placeholder="email1@example.com, email2@example.com, email3@example.com"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    rows={5}
                  />
                </div>
                <Button onClick={handleBulkUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Emails
                </Button>

                {uploadResult && (
                  <div className="mt-4 space-y-3">
                    {uploadResult.added.length > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center text-green-700 mb-1">
                          <Check className="w-4 h-4 mr-2" />
                          <span className="font-medium">Added ({uploadResult.added.length})</span>
                        </div>
                        <div className="text-xs text-green-600 max-h-20 overflow-y-auto">
                          {uploadResult.added.join(", ")}
                        </div>
                      </div>
                    )}

                    {uploadResult.invalid.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center text-red-700 mb-1">
                          <X className="w-4 h-4 mr-2" />
                          <span className="font-medium">Invalid ({uploadResult.invalid.length})</span>
                        </div>
                        <div className="text-xs text-red-600 max-h-20 overflow-y-auto">
                          {uploadResult.invalid.join(", ")}
                        </div>
                      </div>
                    )}

                    {uploadResult.duplicates.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-center text-yellow-700 mb-1">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Duplicates ({uploadResult.duplicates.length})</span>
                        </div>
                        <div className="text-xs text-yellow-600 max-h-20 overflow-y-auto">
                          {uploadResult.duplicates.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h3 className="font-medium">Approved Email List</h3>
              </div>
              {approvedEmails.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {approvedEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between px-4 py-2 border-b last:border-0 hover:bg-gray-50"
                    >
                      <span className="text-sm">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmail(email)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No approved emails yet. Add emails to allow users to sign up.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
