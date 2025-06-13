export interface Perk {
  title: string
  description: string
  details: string
}

export const perksData: Perk[] = [
  {
    title: "Community Discounts",
    description: "Special discounts available for community members at local businesses and services.",
    details: "Present your community ID for exclusive savings.",
  },
  {
    title: "Transportation Services",
    description: "Subsidized transportation for medical appointments and essential services.",
    details: "Contact your case manager for eligibility and scheduling.",
  },
  {
    title: "Educational Resources",
    description: "Free access to educational materials and tutoring services.",
    details: "Available for children and adults in various subjects and skill levels.",
  },
  {
    title: "Recreational Programs",
    description: "Complimentary access to recreational facilities and programs.",
    details: "Includes swimming, sports, arts and crafts, and social activities.",
  },
]
