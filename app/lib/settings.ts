// Settings management for the admin panel
interface Settings {
  adminEmail: string
  emailNotifications: boolean
  web3FormsKey: string
}

const defaultSettings: Settings = {
  adminEmail: "sakirhossainfaruque104@gmail.com",
  emailNotifications: true,
  web3FormsKey: "f543a6ac-166d-4f10-9d05-2cfc23c25a16", // You'll need to get this from web3forms.com
}

export const getSettings = (): Settings => {
  if (typeof window === "undefined") {
    return defaultSettings
  }

  try {
    const stored = localStorage.getItem("adminSettings")
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...parsed }
    }
  } catch (error) {

  }

  return defaultSettings
}

export const saveSettings = (settings: Partial<Settings>) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    const updated = { ...settings }
    console.log(updated, "updated")
    localStorage.setItem("adminSettings", JSON.stringify(updated))
  } catch (error) {

    throw error
  }
}
