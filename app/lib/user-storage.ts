// User storage and authentication utilities

export interface User {
  id: string
  email: string
  password: string
  isActive: boolean
  isAdmin: boolean
  createdAt: number
  lastLogin: number | null
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  const specialChars = (password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g) || []).length
  if (specialChars < 2) {
    errors.push("Password must contain at least two special characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []

  const usersJson = localStorage.getItem("resourceGuideUsers")
  if (!usersJson) return []

  try {
    return JSON.parse(usersJson)
  } catch (e) {
    console.error("Failed to parse users from localStorage", e)
    return []
  }
}

export function saveUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem("resourceGuideUsers", JSON.stringify(users))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export async function createUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: any }> {
  // Run on client-side only
  if (typeof window === "undefined") {
    return { success: false, message: "Cannot create user on server side" };
  }

  // Validate email
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return { success: false, message: "Please provide a valid email address" };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return {
      success: false,
      message: passwordValidation.errors.join(". "),
    };
  }

  try {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.error || "Registration failed" };
    }

    return {
      success: true,
      message: data.message,
      user: { id: data.userId, email }, // return user ID & email for localStorage
    };
  } catch (error) {
    console.error("Error calling /api/register:", error);
    return { success: false, message: "Something went wrong" };
  }
}


export async function authenticateUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: { id: string; email: string } }> {
  if (typeof window === "undefined") {
    return { success: false, message: "Cannot authenticate on server side" };
  }

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, message: data.error || "Login failed" };
    }

    return {
      success: true,
      message: data.message,
      user: { id: data.userId, email: data.email },
    };
  } catch (error) {
    console.error("Error authenticating:", error);
    return { success: false, message: "Something went wrong" };
  }
}


export function getUserById(id: string): User | null {
  const users = getUsers()
  return users.find((user) => user.id === id) || null
}

export function updateUser(updatedUser: User): { success: boolean; message: string } {
  const users = getUsers()
  const index = users.findIndex((user) => user.id === updatedUser.id)

  if (index === -1) {
    return { success: false, message: "User not found" }
  }

  users[index] = updatedUser
  saveUsers(users)

  return { success: true, message: "User updated successfully" }
}

export function deleteUser(id: string): { success: boolean; message: string } {
  const users = getUsers()
  const filteredUsers = users.filter((user) => user.id !== id)

  if (filteredUsers.length === users.length) {
    return { success: false, message: "User not found" }
  }

  saveUsers(filteredUsers)

  return { success: true, message: "User deleted successfully" }
}

export function isCurrentUserAdmin(): boolean {
  if (typeof window === "undefined") return false

  const userId = localStorage.getItem("currentUserId")
  if (!userId) return false

  const user = getUserById(userId)
  return user?.isAdmin || false
}
