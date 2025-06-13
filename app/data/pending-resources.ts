export interface PendingResource {
  id: string
  category: string
  data: any
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  submitterEmail?: string
  adminNotes?: string
}

// This would normally be stored in a database
export const pendingResourcesData: PendingResource[] = [
  {
    id: "1",
    category: "camps",
    data: {
      campName: "Sample Camp",
      contactPerson: "John Doe",
      phone: "555-0123",
      email: "john@samplecamp.com",
      gender: "both",
      ages: "5-12",
      description: "A sample camp submission",
      location: "Brooklyn, NY",
    },
    submittedAt: "2024-01-15T10:30:00Z",
    status: "pending",
  },
]
