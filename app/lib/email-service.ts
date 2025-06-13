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

      if (!settings.adminEmail) {
        console.log("⚠️ No admin email configured, skipping notification")
        return false
      }

      if (!settings.emailNotifications) {
        console.log("⚠️ Email notifications disabled, skipping notification")
        return false
      }

      const resourceName =
        resourceData.data.name ||
        resourceData.data.campName ||
        resourceData.data.title ||
        resourceData.data.program ||
        resourceData.data.resource ||
        "Unknown Resource"

      const subject = `New Resource Submission: ${resourceName}`
      const message = `
A new resource has been submitted for review.

Resource: ${resourceName}
Category: ${resourceData.category}
Submission ID: ${resourceData.id}
Submitted: ${new Date(resourceData.submittedAt).toLocaleString()}

Please review this submission in the admin panel.

Resource Details:
${Object.entries(resourceData.data)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}
      `

      return await this.sendEmail(settings.adminEmail, subject, message)
    } catch (error) {
      console.error("Error sending new resource notification:", error)
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
        console.log("⚠️ No admin email configured, skipping feedback notification")
        return false
      }

      if (!settings.emailNotifications) {
        console.log("⚠️ Email notifications disabled, skipping feedback notification")
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
      console.error("Error sending feedback notification:", error)
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
      console.error("Error sending test email:", error)
      return false
    }
  }

  private static async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
    try {
      const settings = getSettings()

      // For now, we'll use a free Web3Forms key for testing
      // You can get your own free key at https://web3forms.com
      const accessKey = "c9e1f7e4-8b2a-4f3d-9c5e-1a2b3c4d5e6f" // This is a demo key

      console.log("📧 Sending email to:", email)
      console.log("📧 Subject:", subject)

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
      console.log("📧 Web3Forms API response:", data)

      if (data.success) {
        console.log("✅ Email sent successfully")
        return true
      } else {
        console.error("❌ Web3Forms API returned error:", data.message)
        return false
      }
    } catch (error) {
      console.error("❌ Failed to send email:", error)
      return false
    }
  }
}
