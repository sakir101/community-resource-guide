// Settings management for the admin panel
interface Settings {
  adminEmail: string
  emailNotifications: boolean
  web3FormsKey: string
}

const defaultSettings: Settings = {
  adminEmail: "",
  emailNotifications: true,
  web3FormsKey: "YOUR_WEB3FORMS_ACCESS_KEY", // You'll need to get this from web3forms.com
}

export const getSettings = (): Settings => {
  if (typeof window === "undefined") {
    return defaultSettings
  }

  try {
    const stored = localStorage.getItem("adminSettings")
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...defaultSettings, ...parsed }
    }
  } catch (error) {
    console.error("Failed to load settings:", error)
  }

  return defaultSettings
}

export const saveSettings = (settings: Partial<Settings>) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    const current = getSettings()
    const updated = { ...current, ...settings }
    localStorage.setItem("adminSettings", JSON.stringify(updated))
    console.log("✅ Settings saved:", updated)
  } catch (error) {
    console.error("Failed to save settings:", error)
    throw error
  }
}
