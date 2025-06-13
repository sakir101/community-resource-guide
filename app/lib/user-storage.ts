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

export function createUser(email: string, password: string): { success: boolean; message: string; user?: User } {
  if (typeof window === "undefined") {
    return { success: false, message: "Cannot create user on server side" }
  }

  // Validate email
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return { success: false, message: "Please provide a valid email address" }
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return { success: false, message: passwordValidation.errors.join(". ") }
  }

  const users = getUsers()

  // Check if user already exists
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: "A user with this email already exists" }
  }

  // Create new user
  const newUser: User = {
    id: generateId(),
    email: email.toLowerCase(),
    password: password, // In a real app, this should be hashed
    isActive: true,
    isAdmin: users.length === 0, // First user is admin
    createdAt: Date.now(),
    lastLogin: null,
  }

  // Add user to storage
  users.push(newUser)
  saveUsers(users)

  return { success: true, message: "User created successfully", user: newUser }
}

export function authenticateUser(email: string, password: string): { success: boolean; message: string; user?: User } {
  if (typeof window === "undefined") {
    return { success: false, message: "Cannot authenticate on server side" }
  }

  const users = getUsers()
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

  if (!user) {
    return { success: false, message: "Invalid email or password" }
  }

  if (!user.isActive) {
    return { success: false, message: "This account has been deactivated" }
  }

  if (user.password !== password) {
    // In a real app, compare hashed passwords
    return { success: false, message: "Invalid email or password" }
  }

  // Update last login time
  user.lastLogin = Date.now()
  saveUsers(users)

  return { success: true, message: "Authentication successful", user }
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
