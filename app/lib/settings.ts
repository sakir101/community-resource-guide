// Settings management for the admin panel
interface Settings {
  adminEmail: string
  emailNotifications: boolean
  web3FormsKey: string
}

const defaultSettings: Settings = {
  adminEmail: "sakirhossainfaruque104@gmail.com",
  emailNotifications: true,
  web3FormsKey: "212445ad-8038-4130-bf22-3db034d7013a", // You'll need to get this from web3forms.com
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
