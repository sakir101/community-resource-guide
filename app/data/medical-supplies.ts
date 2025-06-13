export interface MedicalSupply {
  resource: string
  contact: string
  email: string
  notes: string
  moreItems: string
}

export const medicalSuppliesData: MedicalSupply[] = [
  {
    resource: "Advanced Care",
    contact: "718-473-9000 x330",
    email: "charny@advancedcaregroup.com",
    notes: "Incontinence supplies: Diapers, pull ups, liners, chucks, gloves.",
    moreItems: "",
  },
  {
    resource: "Baron Medical Supplies",
    contact: "718-486-6164 x105",
    email: "brenda@baronmedical.com",
    notes:
      "Diapers and Incontinence supplies send the demographics, insurance info and mother's number and they do the rest. They need to receive a prescription from the PCP- Baron offers telehealth services for those that cannot get the prescription from their PCP.",
    moreItems:
      "Enclosed beds, positioned bath chairs, strollers, oxygen equipment, enteral supplies feeding tubes, catheterization supplies. - this requires lengthier authorization, but they will guide the clients through it.",
  },
  {
    resource: "Medarts Medical Supplies",
    contact: "(718) 436-6088",
    email: "",
    notes: "strollers",
    moreItems: "",
  },
  {
    resource: "Medicaid Cars/ Transportation",
    contact: "",
    email: "https://www.medanswering.com/",
    notes: "The doctor uploads a form and once approved, they can book cars to and from appointments.",
    moreItems: "",
  },
]
