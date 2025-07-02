import { getSettings } from "./settings"

export class EmailNotificationService {
  static async sendNewResourceNotification(resourceData: {
    id: string
    category: string
    data: any
    submittedAt: string
    email: string
    settings: any
  }): Promise<boolean> {
    try {
      const { id, category, data, submittedAt, email, settings } = resourceData;

      if (!settings.adminEmail) {
        return false;
      }

      if (!settings.emailNotifications) {
        return false;
      }

      const resourceName = data;

      const subject = `New Resource Submission: ${resourceName}`;
      const message = `
  A new resource has been submitted for review.
  
  Resource: ${resourceName}
  Category: ${category}
  Submission ID: ${id}
  Submitted: ${new Date(submittedAt).toLocaleString()}
  
  Please review this submission in the admin panel.
      `;

      return await this.sendEmail(email, subject, message, settings);
    } catch (error) {
      return false;
    }
  }

  static async updateResourceNotification(resourceData: {
    id: string
    category: string
    data: any
    updatedAt: string,
    email: string
    settings: any
  }): Promise<boolean> {
    try {
      const { id, category, data, updatedAt, email, settings } = resourceData;

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

      return await this.sendEmail(email, subject, message, settings)
    } catch (error) {

      return false
    }
  }

  static async deleteResourceNotification(resourceData: {
    id: string
    category: string
    data: any,
    email: string
    settings: any
  }): Promise<boolean> {
    try {
      const { id, category, data, email, settings } = resourceData;

      const resourceName =
        resourceData.data




      const subject = `Resource delete: ${resourceName}`
      const message = `
A resource has been deleted.

Resource: ${resourceName}
Category: ${resourceData.category}
Submission ID: ${resourceData.id}


Please review this submission in the admin panel.`

      return await this.sendEmail(email, subject, message, settings)
    } catch (error) {

      return false
    }
  }
  static async resourceNameUpdateNotification(resourceData: {
    id: string
    category: string
    data: any,
    email: string
    settings: any
  }): Promise<boolean> {
    try {
      const { id, category, data, email, settings } = resourceData;

      const resourceName =
        resourceData.data




      const subject = `Resource name updated: ${resourceName}`
      const message = `
A resource name has been updated.

Resource: ${resourceName}
Category: ${resourceData.category}
Submission ID: ${resourceData.id}


Please review this submission in the admin panel.`

      return await this.sendEmail(email, subject, message, settings)
    } catch (error) {

      return false
    }
  }

  static async sendFeedbackNotification(feedbackData: {
    id: string
    category: string
    resourceName: string
    feedback: string
    submittedAt: string,
    email: string
    settings: any
  }): Promise<boolean> {
    try {
      const { id, category, resourceName, feedback, submittedAt, email, settings } = feedbackData;

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
      return await this.sendEmail(email, subject, message, settings)
    } catch (error) {
      return false
    }
  }

  static async sendTestEmail(email: string, settings: any): Promise<boolean> {
    try {
      const subject = "Test Email from Community Resource Guide";
      const message = `
This is a test email from the Community Resource Guide admin panel.

If you received this email, your email configuration is working correctly.

Sent at: ${new Date().toLocaleString()}

Test successful! ✅
      `;
      return await this.sendEmail(email, subject, message, settings);
    } catch (error) {
      console.error("sendTestEmail error", error);
      return false;
    }
  }

  private static async sendEmail(
    email: string,
    subject: string,
    message: string,
    settings: any
  ): Promise<boolean> {
    try {
      const accessKey = settings.web3FormsKey;
      console.log(accessKey, "accessKey in email service");

      if (!accessKey || !settings.emailNotifications) {
        console.log("❌ Missing API key or notifications disabled.");
        return false;
      }



      const formData = new FormData();
      formData.append("access_key", accessKey);
      formData.append("subject", subject);
      formData.append("from_name", "Community Resource Guide");
      formData.append("email", email);
      formData.append("message", message);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Web3Forms API error: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("sendEmail error", error);
      return false;
    }


  }
}
