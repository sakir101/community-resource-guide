import { getSettings } from "./settings"

export class EmailNotificationService {
  static async sendNewResourceNotification(resourceData: {
    id: string
    category: string
    data: any
    submittedAt: string
  }): Promise<boolean> {
    try {
      const settings = getSettings()
      console.log(settings, "settings in email service")

      if (!settings.adminEmail) {
        return false
      }

      if (!settings.emailNotifications) {
        return false
      }

      const resourceName =
        resourceData.data


      const subject = `New Resource Submission: ${resourceName}`
      const message = `
A new resource has been submitted for review.

Resource: ${resourceName}
Category: ${resourceData.category}
Submission ID: ${resourceData.id}
Submitted: ${new Date(resourceData.submittedAt).toLocaleString()}

Please review this submission in the admin panel.`

      return await this.sendEmail(settings.adminEmail, subject, message)
    } catch (error) {

      return false
    }
  }

  static async updateResourceNotification(resourceData: {
    id: string
    category: string
    data: any
    updatedAt: string
  }): Promise<boolean> {
    try {
      const settings = getSettings()

      if (!settings.adminEmail) {
        return false
      }

      if (!settings.emailNotifications) {
        return false
      }

      const resourceName =
        resourceData.data


      const subject = `Resource Update: ${resourceName}`
      const message = `
A resource has been updated.

Resource: ${resourceName}
Category: ${resourceData.category}
Submission ID: ${resourceData.id}
UpdatedAt: ${new Date(resourceData.updatedAt).toLocaleString()}

Please review this update in the admin panel.`

      return await this.sendEmail(settings.adminEmail, subject, message)
    } catch (error) {

      return false
    }
  }

  static async deleteResourceNotification(resourceData: {
    id: string
    category: string
    data: any
  }): Promise<boolean> {
    try {
      const settings = getSettings()

      if (!settings.adminEmail) {
        return false
      }

      if (!settings.emailNotifications) {
        return false
      }

      const resourceName =
        resourceData.data




      const subject = `Resource delete: ${resourceName}`
      const message = `
A resource has been deleted.

Resource: ${resourceName}
Category: ${resourceData.category}
Submission ID: ${resourceData.id}


Please review this submission in the admin panel.`

      return await this.sendEmail(settings.adminEmail, subject, message)
    } catch (error) {

      return false
    }
  }

  static async sendFeedbackNotification(feedbackData: {
    id: string
    category: string
    resourceName: string
    feedback: string
    submittedAt: string
  }): Promise<boolean> {
    try {
      const settings = getSettings()

      if (!settings.adminEmail) {
        return false
      }

      if (!settings.emailNotifications) {
        return false
      }

      const subject = `Feedback Received: ${feedbackData.resourceName}`
      const message = `
New feedback has been submitted for a resource.

Resource: ${feedbackData.resourceName}
Category: ${feedbackData.category}
Feedback ID: ${feedbackData.id}
Submitted: ${new Date(feedbackData.submittedAt).toLocaleString()}

Feedback:
${feedbackData.feedback}

Please review this feedback in the admin panel.
      `
      return await this.sendEmail(settings.adminEmail, subject, message)
    } catch (error) {
      return false
    }
  }

  static async sendTestEmail(email: string): Promise<boolean> {
    try {
      const subject = "Test Email from Community Resource Guide"
      const message = `
This is a test email from the Community Resource Guide admin panel.

If you received this email, your email configuration is working correctly.

Sent at: ${new Date().toLocaleString()}

Test successful! ✅
      `

      return await this.sendEmail(email, subject, message)
    } catch (error) {

      return false
    }
  }

  private static async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
    try {
      const settings = getSettings()

      // For now, we'll use a free Web3Forms key for testing
      // You can get your own free key at https://web3forms.com
      const accessKey = "212445ad-8038-4130-bf22-3db034d7013a" // This is a demo key


      const formData = new FormData()
      formData.append("access_key", accessKey)
      formData.append("subject", subject)
      formData.append("from_name", "Community Resource Guide")
      formData.append("email", email) // recipient
      formData.append("message", message)

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Web3Forms API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        return true
      } else {

        return false
      }
    } catch (error) {

      return false
    }
  }
}
