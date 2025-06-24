import { kv } from "@vercel/kv"

// Database keys
const KEYS = {
  RESOURCES: (category: string) => `resources:${category}`,
  CUSTOM_CATEGORIES: "custom_categories",
  PENDING_RESOURCES: "pending_resources",
  FEEDBACK: "feedback",
  SETTINGS: "admin_settings",
  USERS: "users",
}

// Types
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
  name: string
  label: string
  type: "text" | "email" | "textarea" | "select" | "number" | "tel"
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
  createdAt: string
}

export interface Feedback {
  id: string
  category: string
  resourceName: string
  resourceData: any
  feedback: string
  submittedAt: string
  status: "pending" | "reviewed" | "resolved"
}

// Resource operations
export async function getResourceData(category: string): Promise<any[]> {
  try {
    const data = await kv.get(KEYS.RESOURCES(category))
    console.log(`📊 Database: Getting data for "${category}": ${Array.isArray(data) ? data.length : 0} items`)
    return Array.isArray(data) ? data : []
  } catch (error) {

    return []
  }
}

export async function addResource(category: string, data: any): Promise<boolean> {
  try {
    console.log("➕ Database: Adding resource to category:", category, data)

    const currentData = await getResourceData(category)
    const updatedData = [...currentData, data]

    await kv.set(KEYS.RESOURCES(category), updatedData)

    console.log("✅ Database: Resource added. Category now has:", updatedData.length, "items")
    return true
  } catch (error) {

    return false
  }
}

export async function updateResource(category: string, index: number, data: any): Promise<boolean> {
  try {
    console.log("✏️ Database: Updating resource in category:", category, "at index:", index)

    const currentData = await getResourceData(category)

    if (index >= 0 && index < currentData.length) {
      currentData[index] = data
      await kv.set(KEYS.RESOURCES(category), currentData)

      console.log("✅ Database: Resource updated successfully")
      return true
    } else {
      console.log("❌ Database: Invalid index for update")
      return false
    }
  } catch (error) {

    return false
  }
}

export async function deleteResource(category: string, index: number): Promise<boolean> {
  try {
    console.log("🗑️ Database: Deleting resource from category:", category, "at index:", index)

    const currentData = await getResourceData(category)

    if (index >= 0 && index < currentData.length) {
      currentData.splice(index, 1)
      await kv.set(KEYS.RESOURCES(category), currentData)

      console.log("✅ Database: Resource deleted successfully")
      return true
    } else {
      console.log("❌ Database: Invalid index for deletion")
      return false
    }
  } catch (error) {

    return false
  }
}

// Custom category operations
export async function getCustomCategories(): Promise<CategoryDefinition[]> {
  try {
    const categories = await kv.get(KEYS.CUSTOM_CATEGORIES)
    console.log("📋 Database: Getting custom categories:", Array.isArray(categories) ? categories.length : 0)
    return Array.isArray(categories) ? categories : []
  } catch (error) {

    return []
  }
}

export async function addCustomCategory(
  category: Omit<CategoryDefinition, "id" | "createdAt">,
): Promise<CategoryDefinition | null> {
  try {
    // Create a safe ID from the category name
    const id = category.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .replace(/^-|-$/g, "")

    const finalId = id || `category-${Date.now()}`

    const newCategory: CategoryDefinition = {
      ...category,
      id: finalId,
      name: finalId,
      icon: category.icon || "Folder",
      createdAt: new Date().toISOString(),
      fields: category.fields || [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", required: true },
      ],
    }

    console.log("➕ Database: Creating category with icon:", newCategory.icon, newCategory)

    const currentCategories = await getCustomCategories()
    const updatedCategories = [...currentCategories, newCategory]

    await kv.set(KEYS.CUSTOM_CATEGORIES, updatedCategories)

    // Initialize empty resources array for this category
    await kv.set(KEYS.RESOURCES(finalId), [])

    console.log("✅ Database: Category created and saved. Total custom categories:", updatedCategories.length)
    return newCategory
  } catch (error) {

    return null
  }
}

export async function updateCustomCategory(
  id: string,
  updates: Partial<CategoryDefinition>,
): Promise<CategoryDefinition | null> {
  try {
    const currentCategories = await getCustomCategories()
    const index = currentCategories.findIndex((c) => c.id === id)

    if (index !== -1) {
      currentCategories[index] = { ...currentCategories[index], ...updates }
      await kv.set(KEYS.CUSTOM_CATEGORIES, currentCategories)

      console.log("✏️ Database: Updated category:", id)
      return currentCategories[index]
    } else {
      console.log("❌ Database: Category not found for update:", id)
      return null
    }
  } catch (error) {

    return null
  }
}

export async function deleteCustomCategory(id: string): Promise<boolean> {
  try {
    const currentCategories = await getCustomCategories()
    const filteredCategories = currentCategories.filter((c) => c.id !== id)

    if (filteredCategories.length < currentCategories.length) {
      await kv.set(KEYS.CUSTOM_CATEGORIES, filteredCategories)
      // Also remove the resources for this category
      await kv.del(KEYS.RESOURCES(id))

      console.log("🗑️ Database: Deleted category:", id)
      return true
    } else {
      console.log("❌ Database: Category not found for deletion:", id)
      return false
    }
  } catch (error) {

    return false
  }
}

// Pending resources operations
export async function getPendingResources(): Promise<PendingResource[]> {
  try {
    const resources = await kv.get(KEYS.PENDING_RESOURCES)
    return Array.isArray(resources) ? resources : []
  } catch (error) {

    return []
  }
}

export async function addPendingResource(resource: Omit<PendingResource, "id">): Promise<PendingResource | null> {
  try {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newResource: PendingResource = { ...resource, id }

    const currentResources = await getPendingResources()
    const updatedResources = [...currentResources, newResource]

    await kv.set(KEYS.PENDING_RESOURCES, updatedResources)

    console.log("📝 Database: Added pending resource:", newResource.id, "Total pending:", updatedResources.length)
    return newResource
  } catch (error) {

    return null
  }
}

export async function updatePendingResource(
  id: string,
  updates: Partial<PendingResource>,
): Promise<PendingResource | null> {
  try {
    const currentResources = await getPendingResources()
    const index = currentResources.findIndex((r) => r.id === id)

    if (index !== -1) {
      currentResources[index] = { ...currentResources[index], ...updates }
      await kv.set(KEYS.PENDING_RESOURCES, currentResources)
      return currentResources[index]
    }
    return null
  } catch (error) {

    return null
  }
}

export async function approvePendingResource(id: string, adminNotes?: string): Promise<boolean> {
  try {
    const pendingResources = await getPendingResources()
    const resource = pendingResources.find((r) => r.id === id)

    if (resource) {
      // Add to main storage
      await addResource(resource.category, resource.data)

      // Update status
      await updatePendingResource(id, {
        status: "approved",
        adminNotes,
      })

      return true
    }
    return false
  } catch (error) {

    return false
  }
}

export async function rejectPendingResource(id: string, adminNotes?: string): Promise<boolean> {
  try {
    const resource = await updatePendingResource(id, {
      status: "rejected",
      adminNotes,
    })
    return resource !== null
  } catch (error) {
    return false
  }
}

export async function removePendingResource(id: string): Promise<boolean> {
  try {
    const currentResources = await getPendingResources()
    const filteredResources = currentResources.filter((r) => r.id !== id)

    if (filteredResources.length < currentResources.length) {
      await kv.set(KEYS.PENDING_RESOURCES, filteredResources)
      return true
    }
    return false
  } catch (error) {

    return false
  }
}

// Feedback operations
export async function getFeedback(): Promise<Feedback[]> {
  try {
    const feedback = await kv.get(KEYS.FEEDBACK)
    return Array.isArray(feedback) ? feedback : []
  } catch (error) {

    return []
  }
}

export async function addFeedback(feedback: Omit<Feedback, "id">): Promise<Feedback | null> {
  try {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newFeedback: Feedback = { ...feedback, id }

    const currentFeedback = await getFeedback()
    const updatedFeedback = [...currentFeedback, newFeedback]

    await kv.set(KEYS.FEEDBACK, updatedFeedback)

    console.log("📝 Database: Added feedback:", newFeedback.id)
    return newFeedback
  } catch (error) {

    return null
  }
}

export async function updateFeedbackStatus(id: string, status: Feedback["status"]): Promise<boolean> {
  try {
    const currentFeedback = await getFeedback()
    const index = currentFeedback.findIndex((f) => f.id === id)

    if (index !== -1) {
      currentFeedback[index].status = status
      await kv.set(KEYS.FEEDBACK, currentFeedback)
      return true
    }
    return false
  } catch (error) {

    return false
  }
}

// Initialize default data if needed
export async function initializeDefaultData(): Promise<void> {
  try {
    console.log("🔄 Database: Initializing default data...")

    // Import default data
    const { campsData } = await import("../data/camps")
    const { schoolsData } = await import("../data/schools")
    const { medicalSuppliesData } = await import("../data/medical-supplies")
    const { hamaspikData } = await import("../data/hamaspik-programs")
    const { contractedProgramsData } = await import("../data/contracted-programs")
    const { perksData } = await import("../data/perks")

    // Check if data already exists, if not, initialize it
    const categories = [
      { key: "camps", data: campsData },
      { key: "schools", data: schoolsData },
      { key: "medical-supplies", data: medicalSuppliesData },
      { key: "hamaspik-programs", data: hamaspikData },
      { key: "contracted-programs", data: contractedProgramsData },
      { key: "perks", data: perksData },
    ]

    for (const category of categories) {
      const existingData = await getResourceData(category.key)
      if (existingData.length === 0) {
        console.log(`📊 Database: Initializing ${category.key} with ${category.data.length} items`)
        await kv.set(KEYS.RESOURCES(category.key), category.data)
      }
    }

    console.log("✅ Database: Default data initialization complete")
  } catch (error) {

  }
}

// Debug function
export async function debugDatabase(): Promise<void> {
  try {
    console.log("🔍 Database Debug:")

    const categories = ["camps", "schools", "medical-supplies", "hamaspik-programs", "contracted-programs", "perks"]

    for (const category of categories) {
      const data = await getResourceData(category)
      console.log(`${category}: ${data.length} items`)
    }

    const customCategories = await getCustomCategories()
    console.log(`Custom categories: ${customCategories.length}`)

    const pendingResources = await getPendingResources()
    console.log(`Pending resources: ${pendingResources.length}`)

    const feedback = await getFeedback()
    console.log(`Feedback: ${feedback.length}`)
  } catch (error) {

  }
}
