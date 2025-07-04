// In-memory storage for the session
// In a real app, this would be a database

import { campsData } from "../data/camps"
import { schoolsData } from "../data/schools"
import { medicalSuppliesData } from "../data/medical-supplies"
import { hamaspikData } from "../data/hamaspik-programs"
import { contractedProgramsData } from "../data/contracted-programs"
import { perksData } from "../data/perks"

export interface PendingResource {
  id: string
  category: string
  data: any
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  submitterEmail?: string
  adminNotes?: string
}

export interface CategoryField {
  id: string
  name: string
  label: string
  type: "TEXT" | "EMAIL" | "TEXTAREA" | "SELECT" | "NUMBER" | "PHONE"
  required: boolean
  options?: string[]
}

export interface CategoryDefinition {
  id: string
  name: string
  label: string
  description: string
  icon: string
  color: string
  fields: CategoryField[]
  isDefault?: boolean
  createdAt: string
}

// Try to load data from localStorage if available (client-side only)
let savedStorage: any = {}
let savedPendingResources: PendingResource[] = []
let savedCustomCategories: CategoryDefinition[] = []

// Check if we're in a browser environment
if (typeof window !== "undefined") {
  try {
    const storedData = localStorage.getItem("resourceStorage")
    if (storedData) {
      savedStorage = JSON.parse(storedData)
    }

    const storedPendingResources = localStorage.getItem("pendingResources")
    if (storedPendingResources) {
      savedPendingResources = JSON.parse(storedPendingResources)
    }

    const storedCustomCategories = localStorage.getItem("customCategories")
    if (storedCustomCategories) {
      savedCustomCategories = JSON.parse(storedCustomCategories)
    } else {
      console.log("ℹ️ No custom categories found in localStorage")
    }
  } catch (error) {

  }
}

// Initialize with original data - make sure all categories are included
const storage = {
  camps: savedStorage.camps || [...campsData],
  schools: savedStorage.schools || [...schoolsData],
  "medical-supplies": savedStorage["medical-supplies"] || [...medicalSuppliesData],
  "hamaspik-programs": savedStorage["hamaspik-programs"] || [...hamaspikData],
  "contracted-programs": savedStorage["contracted-programs"] || [...contractedProgramsData],
  perks: savedStorage.perks || [...perksData],
  ...Object.keys(savedStorage).reduce((acc, key) => {
    if (!["camps", "schools", "medical-supplies", "hamaspik-programs", "contracted-programs", "perks"].includes(key)) {
      acc[key] = savedStorage[key]
    }
    return acc
  }, {} as any),
}

const pendingResources: PendingResource[] = [...savedPendingResources]

// Store custom categories
const customCategories: CategoryDefinition[] = [...savedCustomCategories]

// Helper function to save data to localStorage (client-side only)
const saveToLocalStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const dataToSave = {
        storage: JSON.stringify(storage),
        pendingResources: JSON.stringify(pendingResources),
        customCategories: JSON.stringify(customCategories),
        timestamp: Date.now(),
      }

      localStorage.setItem("resourceStorage", dataToSave.storage)
      localStorage.setItem("pendingResources", dataToSave.pendingResources)
      localStorage.setItem("customCategories", dataToSave.customCategories)
      localStorage.setItem("lastUpdate", dataToSave.timestamp.toString())

      // Trigger a storage event to notify other tabs/components
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "resourceStorage",
          newValue: dataToSave.storage,
        }),
      )
    } catch (error) {

    }
  }
}

export const getResourceData = (category: string) => {
  const data = storage[category as keyof typeof storage] || []
  return data
}

export const addResource = (category: string, data: any) => {

  if (!storage[category as keyof typeof storage]) {
    storage[category as keyof typeof storage] = []
  }

  storage[category as keyof typeof storage].push(data)
  saveToLocalStorage()

  return true
}

export const updateResource = (category: string, index: number, data: any) => {

  if (storage[category as keyof typeof storage] && storage[category as keyof typeof storage][index]) {
    // Store the old data for comparison
    const oldData = storage[category as keyof typeof storage][index]

    // Update the resource
    storage[category as keyof typeof storage][index] = data

    // Save to localStorage immediately
    saveToLocalStorage()

    // Verify the update was successful
    const updatedData = storage[category as keyof typeof storage][index]

    // Double-check localStorage was updated
    if (typeof window !== "undefined") {
      try {
        const storedData = localStorage.getItem("resourceStorage")
        if (storedData) {
          const parsed = JSON.parse(storedData)
        }
      } catch (error) {

      }
    }

    return true
  }

  return false
}

export const deleteResource = (category: string, index: number) => {

  if (storage[category as keyof typeof storage] && storage[category as keyof typeof storage][index]) {
    storage[category as keyof typeof storage].splice(index, 1)
    saveToLocalStorage()
    return true
  }

  return false
}

export const getPendingResources = () => {
  return pendingResources
}

export const addPendingResource = (resource: Omit<PendingResource, "id">) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  const newResource: PendingResource = {
    ...resource,
    id,
  }
  pendingResources.push(newResource)
  saveToLocalStorage()
  return newResource
}

export const updatePendingResource = (id: string, updates: Partial<PendingResource>) => {
  const index = pendingResources.findIndex((r) => r.id === id)
  if (index !== -1) {
    pendingResources[index] = { ...pendingResources[index], ...updates }
    saveToLocalStorage()
    return pendingResources[index]
  }
  return null
}

export const approvePendingResource = (id: string, adminNotes?: string) => {
  const resource = pendingResources.find((r) => r.id === id)
  if (resource) {
    // Add to main storage
    addResource(resource.category, resource.data)

    // Update status
    updatePendingResource(id, {
      status: "approved",
      adminNotes,
    })

    saveToLocalStorage()
    return true
  }
  return false
}

export const rejectPendingResource = (id: string, adminNotes?: string) => {
  const resource = pendingResources.find((r) => r.id === id)
  if (resource) {
    updatePendingResource(id, {
      status: "rejected",
      adminNotes,
    })
    saveToLocalStorage()
    return true
  }
  return false
}

export const removePendingResource = (id: string) => {
  const index = pendingResources.findIndex((r) => r.id === id)
  if (index !== -1) {
    pendingResources.splice(index, 1)
    saveToLocalStorage()
    return true
  }
  return false
}

// Custom category management functions
export const getCustomCategories = () => {
  return customCategories
}

export const addCustomCategory = (category: Omit<CategoryDefinition, "id" | "createdAt">) => {
  // Create a safe ID from the category name
  const id = category.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens

  // If the ID is empty after cleaning, use a timestamp-based ID
  const finalId = id || `category-${Date.now()}`

  const newCategory: CategoryDefinition = {
    ...category,
    id: finalId,
    name: finalId, // Use the same clean ID for name
    icon: category.icon || "Folder", // Ensure icon is always set
    createdAt: new Date().toISOString(),
    // Ensure fields exist
    fields: category.fields || [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
    ],
  }

  customCategories.push(newCategory)

  // Initialize storage for this category
  if (!storage[finalId as keyof typeof storage]) {
    storage[finalId as keyof typeof storage] = []
  }

  saveToLocalStorage()
  return newCategory
}

export const updateCustomCategory = (id: string, updates: Partial<CategoryDefinition>) => {
  const index = customCategories.findIndex((c) => c.id === id)
  if (index !== -1) {
    customCategories[index] = { ...customCategories[index], ...updates }
    saveToLocalStorage()
    return customCategories[index]
  }
  return null
}

export const deleteCustomCategory = (id: string) => {
  const index = customCategories.findIndex((c) => c.id === id)
  if (index !== -1) {
    customCategories.splice(index, 1)
    // Also remove the storage for this category
    delete storage[id as keyof typeof storage]
    saveToLocalStorage()
    return true
  }
  return false
}

export const deleteDefaultCategory = (id: string) => {
  // Remove from storage
  delete storage[id as keyof typeof storage]
  saveToLocalStorage()
  return true
}

export const getAllCategories = () => {
  const defaultCategories = [
    {
      id: "camps",
      name: "camps",
      label: "Camps",
      description: "Summer camps and recreational programs",
      icon: "Users",
      color: "bg-green-50 text-green-600 border-green-200",
      isDefault: true,
      fields: [
        { name: "campName", label: "Camp Name", type: "text", required: true },
        { name: "contactPerson", label: "Contact Person", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        { name: "email", label: "Email", type: "email" },
        { name: "underAuspicesOf", label: "Under Auspices Of", type: "text" },
        { name: "gender", label: "Gender", type: "select", options: ["boys", "girls", "both", "mixed"] },
        { name: "ages", label: "Ages", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "location", label: "Location", type: "text" },
        { name: "integrated", label: "Integration Type", type: "text" },
        { name: "medicalNeeds", label: "Medical Needs", type: "text" },
        { name: "tuition", label: "Tuition", type: "text" },
        { name: "comments", label: "Comments", type: "textarea" },
      ],
    },
    {
      id: "schools",
      name: "schools",
      label: "Schools",
      description: "Educational institutions and schools",
      icon: "GraduationCap",
      color: "bg-blue-50 text-blue-600 border-blue-200",
      isDefault: true,
      fields: [
        { name: "name", label: "School Name", type: "text", required: true },
        { name: "location", label: "Location", type: "text", required: true },
        { name: "contactPerson", label: "Contact Person", type: "text", required: true },
        { name: "phone", label: "Phone", type: "text", required: true },
        { name: "email", label: "Email", type: "email" },
        { name: "studentsServed", label: "Students Served", type: "textarea" },
      ],
    },
    {
      id: "medical-supplies",
      name: "medical-supplies",
      label: "Medical Supplies",
      description: "Medical supplies and equipment resources",
      icon: "Stethoscope",
      color: "bg-red-50 text-red-600 border-red-200",
      isDefault: true,
      fields: [
        { name: "resource", label: "Resource Name", type: "text", required: true },
        { name: "contact", label: "Contact Info", type: "text", required: true },
        { name: "email", label: "Email", type: "email" },
        { name: "notes", label: "Notes", type: "textarea" },
        { name: "moreItems", label: "Additional Items", type: "textarea" },
      ],
    },
    {
      id: "hamaspik-programs",
      name: "hamaspik-programs",
      label: "Hamaspik Programs",
      description: "Hamaspik organization programs and services",
      icon: "Heart",
      color: "bg-purple-50 text-purple-600 border-purple-200",
      isDefault: true,
      fields: [
        { name: "program", label: "Program Name", type: "text", required: true },
        { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Both"] },
        { name: "functioningLevel", label: "Functioning Level", type: "text" },
        { name: "location", label: "Location", type: "text" },
        { name: "daysOpen", label: "Days Open", type: "text" },
        { name: "contact", label: "Contact", type: "text" },
        { name: "runBy", label: "Run By", type: "text" },
      ],
    },
    {
      id: "contracted-programs",
      name: "contracted-programs",
      label: "Contracted Programs",
      description: "Active contracted programs and services",
      icon: "Building",
      color: "bg-orange-50 text-orange-600 border-orange-200",
      isDefault: true,
      fields: [
        { name: "name", label: "Program Name", type: "text", required: true },
        { name: "programType", label: "Program Type", type: "text" },
        { name: "location", label: "Location", type: "text" },
        { name: "phone", label: "Phone", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "gender", label: "Gender", type: "select", options: ["boys", "girls", "both"] },
        { name: "ages", label: "Ages", type: "text" },
        { name: "whoItsFor", label: "Who It's For", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "toSignUp", label: "How to Sign Up", type: "text" },
      ],
    },
    {
      id: "perks",
      name: "perks",
      label: "Perks",
      description: "Special perks and benefits available",
      icon: "Gift",
      color: "bg-pink-50 text-pink-600 border-pink-200",
      isDefault: true,
      fields: [
        { name: "title", label: "Perk Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
        { name: "details", label: "Details", type: "textarea" },
      ],
    },
  ]

  const allCategories = [...defaultCategories, ...customCategories.map((cat) => ({ ...cat, isDefault: false }))]
  return allCategories
}

// Add a function to force reload data from localStorage
export const reloadFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const storedData = localStorage.getItem("resourceStorage")
      if (storedData) {
        const parsed = JSON.parse(storedData)
        Object.keys(parsed).forEach((key) => {
          storage[key as keyof typeof storage] = parsed[key]
        })
      }
    } catch (error) {

    }
  }
}

// Debug function to check storage contents
export const debugStorage = () => {
  return storage
}

// Debug function to check and restore perks data
export const checkAndRestorePerks = () => {

  // If perks is empty, restore from original data
  if (!storage.perks || storage.perks.length === 0) {
    storage.perks = [...perksData]
    saveToLocalStorage()
  }

  return storage.perks
}

// Debug function to check localStorage
export const debugLocalStorage = () => {
  if (typeof window !== "undefined") {
  }
}
