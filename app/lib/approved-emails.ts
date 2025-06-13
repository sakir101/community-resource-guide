// Utility functions for managing approved emails

export function getApprovedEmails(): string[] {
  if (typeof window === "undefined") return ["j8455008807@gmail.com"]

  try {
    const emails = localStorage.getItem("approvedEmails")
    const storedEmails = emails ? JSON.parse(emails) : []

    // Always include the default admin email
    const defaultEmails = ["j8455008807@gmail.com"]

    // Combine and remove duplicates
    const allEmails = [...new Set([...defaultEmails, ...storedEmails])]

    return allEmails
  } catch (error) {
    console.error("Error loading approved emails:", error)
    return ["j8455008807@gmail.com"]
  }
}

export function saveApprovedEmails(emails: string[]): void {
  if (typeof window === "undefined") return

  try {
    // Normalize emails (lowercase, trim)
    const normalizedEmails = emails.map((email) => email.toLowerCase().trim())

    // Always include the default admin email
    const defaultEmails = ["j8455008807@gmail.com"]

    // Combine and remove duplicates
    const allEmails = [...new Set([...defaultEmails, ...normalizedEmails])]

    localStorage.setItem("approvedEmails", JSON.stringify(allEmails))
  } catch (error) {
    console.error("Error saving approved emails:", error)
  }
}

export function addApprovedEmail(email: string): boolean {
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return false
  }

  const emails = getApprovedEmails()
  const normalizedEmail = email.toLowerCase().trim()

  if (emails.includes(normalizedEmail)) {
    return false // Already exists
  }

  emails.push(normalizedEmail)
  saveApprovedEmails(emails)
  return true
}

export function removeApprovedEmail(email: string): boolean {
  const emails = getApprovedEmails()
  const normalizedEmail = email.toLowerCase().trim()
  const filteredEmails = emails.filter((e) => e !== normalizedEmail)

  if (filteredEmails.length === emails.length) {
    return false // Email wasn't in the list
  }

  saveApprovedEmails(filteredEmails)
  return true
}

export function isEmailApproved(email: string): boolean {
  const emails = getApprovedEmails()
  const normalizedEmail = email.toLowerCase().trim()
  return emails.includes(normalizedEmail)
}

export function addMultipleApprovedEmails(emailsText: string): {
  added: string[]
  invalid: string[]
  duplicates: string[]
} {
  const result = {
    added: [] as string[],
    invalid: [] as string[],
    duplicates: [] as string[],
  }

  const existingEmails = getApprovedEmails()
  const emailsToAdd: string[] = []

  // Split by commas, newlines, or spaces
  const emailCandidates = emailsText.split(/[\s,;]+/).filter(Boolean)

  for (const candidate of emailCandidates) {
    const email = candidate.trim()

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      result.invalid.push(email)
      continue
    }

    const normalizedEmail = email.toLowerCase()

    // Check for duplicates in existing list
    if (existingEmails.includes(normalizedEmail)) {
      result.duplicates.push(email)
      continue
    }

    // Check for duplicates in current batch
    if (emailsToAdd.includes(normalizedEmail)) {
      result.duplicates.push(email)
      continue
    }

    emailsToAdd.push(normalizedEmail)
    result.added.push(email)
  }

  if (emailsToAdd.length > 0) {
    saveApprovedEmails([...existingEmails, ...emailsToAdd])
  }

  return result
}
