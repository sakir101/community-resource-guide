"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Building, Phone, Mail, MapPin, Users, MessageSquare, Filter } from "lucide-react"
import { contractedProgramsData } from "../data/contracted-programs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Add after the static data import
const getAvailableAges = () => {
  const ages = new Set<string>()
  contractedProgramsData.forEach((program) => {
    if (program.ages) {
      const ageStr = program.ages.toLowerCase()
      const numbers = ageStr.match(/\d+/g)?.map(Number) || []

      if (numbers.some((num) => num >= 3 && num <= 9)) ages.add("3-9")
      if (numbers.some((num) => num >= 9 && num <= 15)) ages.add("9-15")
      if (numbers.some((num) => num >= 15 && num <= 21)) ages.add("15-21")
      if (numbers.some((num) => num >= 21) || ageStr.includes("adult")) ages.add("21+")
    }
  })
  return [
    { value: "all", label: "All Ages" },
    ...Array.from(ages).map((age) => ({
      value: age,
      label: age === "21+" ? "21+ years" : `${age} years`,
    })),
  ]
}

const getAvailableGenders = () => {
  const genders = new Set<string>()
  contractedProgramsData.forEach((program) => {
    if (program.gender) {
      const genderLower = program.gender.toLowerCase()
      if (genderLower.includes("boys") || genderLower.includes("male")) genders.add("boys")
      if (genderLower.includes("girls") || genderLower.includes("female")) genders.add("girls")
      if (genderLower.includes("both") || genderLower.includes("mixed")) genders.add("both")
    }
  })
  return [
    { value: "all", label: "All Genders" },
    ...Array.from(genders).map((gender) => ({
      value: gender,
      label: gender === "boys" ? "Boys" : gender === "girls" ? "Girls" : "Both",
    })),
  ]
}

const getAvailableProgramTypes = () => {
  const types = new Set<string>()
  contractedProgramsData.forEach((program) => {
    const text = `${program.programType} ${program.description}`.toLowerCase()
    if (text.includes("after school")) types.add("after-school")
    if (text.includes("employment") || text.includes("work")) types.add("employment")
    if (text.includes("therapeutic") || text.includes("therapy")) types.add("therapeutic")
    if (text.includes("social") || text.includes("friendship")) types.add("social")
    if (text.includes("respite")) types.add("respite")
    if (text.includes("recreational") || text.includes("fun")) types.add("recreational")
    if (text.includes("educational") || text.includes("learning")) types.add("educational")
  })
  return [
    { value: "all", label: "All Program Types" },
    ...Array.from(types).map((type) => ({
      value: type,
      label:
        type === "after-school"
          ? "After School"
          : type === "employment"
            ? "Employment"
            : type === "therapeutic"
              ? "Therapeutic Services"
              : type === "social"
                ? "Social Programs"
                : type === "respite"
                  ? "Respite Care"
                  : type === "recreational"
                    ? "Recreational"
                    : "Educational",
    })),
  ]
}

const getAvailableAreas = () => {
  const areas = new Set<string>()
  contractedProgramsData.forEach((program) => {
    if (program.location) {
      const locationLower = program.location.toLowerCase()
      if (locationLower.includes("boro park") || locationLower.includes("bp")) areas.add("boro-park")
      if (locationLower.includes("williamsburg")) areas.add("williamsburg")
      if (locationLower.includes("flatbush")) areas.add("flatbush")
      if (locationLower.includes("crown heights")) areas.add("crown-heights")
      if (locationLower.includes("brooklyn")) areas.add("brooklyn")
      if (locationLower.includes("upstate") || locationLower.includes("monroe")) areas.add("upstate")
      if (locationLower.includes("multiple") || locationLower.includes("various")) areas.add("multiple")
    }
  })
  return [
    { value: "all", label: "All Areas" },
    ...Array.from(areas).map((area) => ({
      value: area,
      label:
        area === "boro-park"
          ? "Boro Park"
          : area === "williamsburg"
            ? "Williamsburg"
            : area === "flatbush"
              ? "Flatbush"
              : area === "crown-heights"
                ? "Crown Heights"
                : area === "brooklyn"
                  ? "Brooklyn"
                  : area === "upstate"
                    ? "Upstate"
                    : "Multiple Locations",
    })),
  ]
}

// Replace static arrays
const ageRanges = getAvailableAges()
const genderOptions = getAvailableGenders()
const programTypeOptions = getAvailableProgramTypes()
const areaOptions = getAvailableAreas()

export default function ContractedProgramsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAge, setSelectedAge] = useState("all")
  const [selectedGender, setSelectedGender] = useState("all")
  const [selectedProgramType, setSelectedProgramType] = useState("all")
  const [selectedArea, setSelectedArea] = useState("all")
  const [feedbackDialog, setFeedbackDialog] = useState(false)
  const [selectedProgramForFeedback, setSelectedProgramForFeedback] = useState<any | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const { toast } = useToast()

  const clearAllFilters = () => {
    setSelectedAge("all")
    setSelectedGender("all")
    setSelectedProgramType("all")
    setSelectedArea("all")
    setSearchTerm("")
  }

  const isAgeInRange = (ageText: string, selectedRange: string): boolean => {
    if (!ageText || selectedRange === "all") return true

    const ageStr = ageText.toLowerCase()

    // Extract numbers from the age text
    const numbers = ageStr.match(/\d+/g)?.map(Number) || []

    switch (selectedRange) {
      case "3-9":
        return (
          numbers.some((num) => num >= 3 && num <= 9) ||
          ageStr.includes("3") ||
          ageStr.includes("4") ||
          ageStr.includes("5") ||
          ageStr.includes("6") ||
          ageStr.includes("7") ||
          ageStr.includes("8") ||
          ageStr.includes("9")
        )
      case "9-15":
        return (
          numbers.some((num) => num >= 9 && num <= 15) ||
          ageStr.includes("9") ||
          ageStr.includes("10") ||
          ageStr.includes("11") ||
          ageStr.includes("12") ||
          ageStr.includes("13") ||
          ageStr.includes("14") ||
          ageStr.includes("15")
        )
      case "15-21":
        return (
          numbers.some((num) => num >= 15 && num <= 21) ||
          ageStr.includes("15") ||
          ageStr.includes("16") ||
          ageStr.includes("17") ||
          ageStr.includes("18") ||
          ageStr.includes("19") ||
          ageStr.includes("20") ||
          ageStr.includes("21")
        )
      case "21+":
        return (
          numbers.some((num) => num >= 21) ||
          ageStr.includes("21") ||
          ageStr.includes("22") ||
          ageStr.includes("23") ||
          ageStr.includes("24") ||
          ageStr.includes("25") ||
          ageStr.includes("adult") ||
          ageStr.includes("20+")
        )
      default:
        return true
    }
  }

  const matchesGenderFilter = (gender: string, selectedGender: string): boolean => {
    if (selectedGender === "all") return true
    if (!gender) return false

    const genderLower = gender.toLowerCase()

    switch (selectedGender) {
      case "boys":
        return genderLower.includes("boys") || genderLower.includes("male")
      case "girls":
        return genderLower.includes("girls") || genderLower.includes("female")
      case "both":
        return genderLower.includes("both") || genderLower.includes("mixed")
      default:
        return true
    }
  }

  const matchesProgramTypeFilter = (programType: string, description: string, selectedType: string): boolean => {
    if (selectedType === "all") return true

    const text = `${programType} ${description}`.toLowerCase()

    switch (selectedType) {
      case "after-school":
        return text.includes("after school") || text.includes("afterschool")
      case "employment":
        return text.includes("employment") || text.includes("work") || text.includes("job")
      case "therapeutic":
        return text.includes("therapeutic") || text.includes("therapy")
      case "social":
        return text.includes("social") || text.includes("friendship")
      case "respite":
        return text.includes("respite") || text.includes("relief")
      case "recreational":
        return text.includes("recreational") || text.includes("fun") || text.includes("activities")
      case "educational":
        return text.includes("educational") || text.includes("learning")
      default:
        return true
    }
  }

  const matchesAreaFilter = (location: string, selectedArea: string): boolean => {
    if (selectedArea === "all") return true
    if (!location) return false

    const locationLower = location.toLowerCase()

    switch (selectedArea) {
      case "boro-park":
        return locationLower.includes("boro park") || locationLower.includes("bp")
      case "williamsburg":
        return locationLower.includes("williamsburg")
      case "flatbush":
        return locationLower.includes("flatbush")
      case "crown-heights":
        return locationLower.includes("crown heights")
      case "brooklyn":
        return locationLower.includes("brooklyn")
      case "upstate":
        return locationLower.includes("upstate") || locationLower.includes("monroe")
      case "multiple":
        return locationLower.includes("multiple") || locationLower.includes("various")
      default:
        return true
    }
  }

  const filteredPrograms = contractedProgramsData.filter((program) => {
    const matchesSearch = Object.values(program).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const matchesAge = isAgeInRange(program.ages, selectedAge)
    const matchesGender = matchesGenderFilter(program.gender, selectedGender)
    const matchesProgramType = matchesProgramTypeFilter(program.programType, program.description, selectedProgramType)
    const matchesArea = matchesAreaFilter(program.location, selectedArea)

    return matchesSearch && matchesAge && matchesGender && matchesProgramType && matchesArea
  })

  const handleFeedbackSubmit = async () => {
    if (!selectedProgramForFeedback || !feedbackText.trim()) return

    setIsSubmittingFeedback(true)

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "contracted-programs",
          resourceName: selectedProgramForFeedback.name,
          resourceData: selectedProgramForFeedback,
          feedback: feedbackText,
          submittedAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Feedback Submitted!",
          description: "Thank you for your feedback. An admin will review it shortly.",
        })
        setFeedbackDialog(false)
        setFeedbackText("")
        setSelectedProgramForFeedback(null)
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const openFeedbackDialog = (program: any) => {
    setSelectedProgramForFeedback(program)
    setFeedbackDialog(true)
    setFeedbackText("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contracted Programs</h1>
          <p className="text-gray-600">Active contracted programs and services</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Section */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-500" />
              <h3 className="font-medium text-gray-900">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="ml-auto text-blue-600">
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Age Range</label>
                <Select value={selectedAge} onValueChange={setSelectedAge}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {genderOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Program Type</label>
                <Select value={selectedProgramType} onValueChange={setSelectedProgramType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {programTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Area</label>
                <Select value={selectedArea} onValueChange={setSelectedArea}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {areaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredPrograms.length} of {contractedProgramsData.length} programs
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-orange-600 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    {program.name}
                  </CardTitle>
                  {program.gender && <Badge variant="outline">{program.gender}</Badge>}
                </div>
                {program.programType && <p className="text-sm text-gray-600">{program.programType}</p>}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  {program.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{program.location}</span>
                    </div>
                  )}
                  {program.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{program.phone}</span>
                    </div>
                  )}
                  {program.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-blue-600">{program.email}</span>
                    </div>
                  )}
                </div>

                {/* Program Details */}
                <div className="space-y-2">
                  {program.ages && (
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        <strong>Ages:</strong> {program.ages}
                      </span>
                    </div>
                  )}
                  {program.whoItsFor && (
                    <p className="text-sm">
                      <strong>For:</strong> {program.whoItsFor}
                    </p>
                  )}
                </div>

                {/* Description */}
                {program.description && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-orange-800">{program.description}</p>
                  </div>
                )}

                {/* Sign Up Info */}
                {program.toSignUp && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>To Sign Up:</strong> {program.toSignUp}
                    </p>
                  </div>
                )}

                {/* Feedback Button */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFeedbackDialog(program)}
                    className="w-full text-xs text-gray-500 hover:text-blue-600 h-8"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Suggest Update or Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No programs found matching your search.</p>
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Suggest Update for {selectedProgramForFeedback?.name}</DialogTitle>
              <p className="text-sm text-gray-600">
                Help us keep our information accurate by suggesting updates or reporting issues
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Your feedback or suggested changes:</Label>
                <Textarea
                  id="feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Please describe what needs to be updated, corrected, or added. For example: 'Contact information has changed to...', 'Program is no longer available', 'Missing information about...', etc."
                  rows={4}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackText.trim() || isSubmittingFeedback}
                  className="flex-1"
                >
                  {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                </Button>
                <Button variant="outline" onClick={() => setFeedbackDialog(false)} disabled={isSubmittingFeedback}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
