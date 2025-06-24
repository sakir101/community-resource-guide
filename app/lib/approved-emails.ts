// Utility functions for managing approved emails

export async function getApprovedEmails(): Promise<string[]> {


  try {
    // 1. Fetch from API
    const response = await fetch("/api/emails", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    const apiEmails: string[] = result.emails || [];



    // 3. Combine all emails and remove duplicates
    const combined = [...apiEmails];
    const uniqueEmails = [...new Set(combined.map((email) => email.toLowerCase().trim()))];

    return uniqueEmails;
  } catch (error) {

    return [];
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



    // localStorage.setItem("approvedEmails", JSON.stringify(allEmails))
  } catch (error) {

  }
}

export async function addApprovedEmail(email: string): Promise<boolean> {
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return false;
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const response = await fetch("/api/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: normalizedEmail }),
    });

    if (response.ok) {
      return true;
    } else {
      const result = await response.json();
      return false;
    }
  } catch (error) {

    return false;
  }
}


export async function removeApprovedEmail(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim()

  try {
    const res = await fetch("/api/emails", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail }),
    })

    const data = await res.json()

    if (res.ok && data.success) {
      // Optionally update localStorage (if used)
      const emails = await getApprovedEmails()
      const filtered = emails.filter((e) => e !== normalizedEmail)
      saveApprovedEmails(filtered)
      return true
    }

    return false
  } catch (error) {

    return false
  }
}

export async function isEmailApproved(email: string): Promise<boolean> {
  try {
    const emails = await getApprovedEmails();
    const normalizedEmail = email.toLowerCase().trim();
    return emails.includes(normalizedEmail);
  } catch (error) {

    return false;
  }
}


export async function addMultipleApprovedEmails(emailsText: string): Promise<{
  added: string[]
  invalid: string[]
  duplicates: string[]
}> {
  const result = {
    added: [] as string[],
    invalid: [] as string[],
    duplicates: [] as string[],
  }

  const emailCandidates = emailsText.split(/[\s,;]+/).filter(Boolean)
  const normalizedEmails = emailCandidates.map(email => email.trim().toLowerCase())

  // Validate + deduplicate input
  const validEmails: string[] = []
  const seen = new Set<string>()

  for (const email of normalizedEmails) {
    if (!/\S+@\S+\.\S+/.test(email)) {
      result.invalid.push(email)
      continue
    }

    if (seen.has(email)) {
      result.duplicates.push(email)
      continue
    }

    seen.add(email)
    validEmails.push(email)
  }

  if (validEmails.length === 0) return result

  try {
    const res = await fetch("/api/emails/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: validEmails }),
    })

    const data = await res.json()

    if (res.ok) {
      result.added = data.added || []
      result.duplicates.push(...(data.duplicates || []))
    } else {

    }
  } catch (error) {

  }

  return result
}

