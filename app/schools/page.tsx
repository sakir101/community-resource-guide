"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Search, Phone, Mail, MapPin, GraduationCap, MessageSquare, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface School {
  name: string
  location: string
  contactPerson: string
  phone: string
  email: string
  studentsServed: string
}

export default function SchoolsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAge, setSelectedAge] = useState("all")
  const [selectedSchoolType, setSelectedSchoolType] = useState("all")
  const [selectedArea, setSelectedArea] = useState("all")
  const [selectedLanguage, setSelectedLanguage] = useState("all")
  const [schoolsData, setSchoolsData] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackDialog, setFeedbackDialog] = useState(false)
  const [selectedSchoolForFeedback, setSelectedSchoolForFeedback] = useState<School | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const { toast } = useToast()

  // Fetch schools data from API
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("/api/resources?category=schools")
        const result = await response.json()
        if (result.success) {
          setSchoolsData(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch schools:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [])

  // Add dynamic filter generation functions after the useEffect
  const getAvailableAges = () => {
    const ages = new Set<string>()
    schoolsData.forEach((school) => {
      if (school.studentsServed) {
        const ageStr = school.studentsServed.toLowerCase()
        const numbers = ageStr.match(/\d+/g)?.map(Number) || []

        if (numbers.some((num) => num >= 3 && num <= 5) || ageStr.includes("preschool")) ages.add("3-5")
        if (numbers.some((num) => num >= 5 && num <= 9) || ageStr.includes("elementary")) ages.add("5-9")
        if (numbers.some((num) => num >= 9 && num <= 13)) ages.add("9-13")
        if (numbers.some((num) => num >= 13 && num <= 18) || ageStr.includes("high school")) ages.add("13-18")
        if (numbers.some((num) => num >= 18) || ageStr.includes("adult") || ageStr.includes("post")) ages.add("18+")
      }
    })
    return [
      { value: "all", label: "All Ages" },
      ...Array.from(ages).map((age) => ({
        value: age,
        label: age === "18+" ? "18+ years" : `${age} years`,
      })),
    ]
  }

  const getAvailableSchoolTypes = () => {
    const types = new Set<string>()
    schoolsData.forEach((school) => {
      const text = `${school.studentsServed} ${school.name}`.toLowerCase()
      if (text.includes("mainstream") || text.includes("integrated")) types.add("mainstream")
      if (text.includes("special") || text.includes("disabilities") || text.includes("autism")) types.add("special-ed")
      if (text.includes("integrated") || text.includes("inclusion")) types.add("integrated")
      if (text.includes("preschool") || text.includes("early")) types.add("preschool")
      if (text.includes("high school") || text.includes("teenage")) types.add("high-school")
      if (text.includes("post") || text.includes("college") || text.includes("seminary")) types.add("post-secondary")
    })
    return [
      { value: "all", label: "All School Types" },
      ...Array.from(types).map((type) => ({
        value: type,
        label:
          type === "mainstream"
            ? "Mainstream"
            : type === "special-ed"
              ? "Special Education"
              : type === "integrated"
                ? "Integrated"
                : type === "preschool"
                  ? "Preschool/Early Intervention"
                  : type === "high-school"
                    ? "High School"
                    : "Post-Secondary",
      })),
    ]
  }

  const getAvailableAreas = () => {
    const areas = new Set<string>()
    schoolsData.forEach((school) => {
      if (school.location) {
        const locationLower = school.location.toLowerCase()
        if (locationLower.includes("brooklyn") || locationLower.includes("bp")) areas.add("brooklyn")
        if (locationLower.includes("manhattan")) areas.add("manhattan")
        if (locationLower.includes("queens")) areas.add("queens")
        if (locationLower.includes("bronx")) areas.add("bronx")
        if (locationLower.includes("staten")) areas.add("staten-island")
        if (locationLower.includes("long island")) areas.add("long-island")
        if (locationLower.includes("upstate")) areas.add("upstate")
        if (!locationLower.includes("ny") && !locationLower.includes("new york")) areas.add("out-of-state")
      }
    })
    return [
      { value: "all", label: "All Areas" },
      ...Array.from(areas).map((area) => ({
        value: area,
        label:
          area === "brooklyn"
            ? "Brooklyn"
            : area === "manhattan"
              ? "Manhattan"
              : area === "queens"
                ? "Queens"
                : area === "bronx"
                  ? "Bronx"
                  : area === "staten-island"
                    ? "Staten Island"
                    : area === "long-island"
                      ? "Long Island"
                      : area === "upstate"
                        ? "Upstate NY"
                        : "Out of State",
      })),
    ]
  }

  const getAvailableLanguages = () => {
    const languages = new Set<string>()
    schoolsData.forEach((school) => {
      if (school.studentsServed) {
        const text = school.studentsServed.toLowerCase()
        if (text.includes("english")) languages.add("english")
        if (text.includes("yiddish") || text.includes("heimish")) languages.add("yiddish")
        if (text.includes("hebrew")) languages.add("hebrew")
        if (text.includes("bilingual")) languages.add("bilingual")
      }
    })
    return [
      { value: "all", label: "All Languages" },
      ...Array.from(languages).map((lang) => ({
        value: lang,
        label:
          lang === "english" ? "English" : lang === "yiddish" ? "Yiddish" : lang === "hebrew" ? "Hebrew" : "Bilingual",
      })),
    ]
  }

  // Replace the static arrays with dynamic ones
  const [ageRanges, setAgeRanges] = useState(() => getAvailableAges())
  const [schoolTypeOptions, setSchoolTypeOptions] = useState(() => getAvailableSchoolTypes())
  const [areaOptions, setAreaOptions] = useState(() => getAvailableAreas())
  const [languageOptions, setLanguageOptions] = useState(() => getAvailableLanguages())

  useEffect(() => {
    if (schoolsData.length > 0) {
      setAgeRanges(getAvailableAges())
      setSchoolTypeOptions(getAvailableSchoolTypes())
      setAreaOptions(getAvailableAreas())
      setLanguageOptions(getAvailableLanguages())
    }
  }, [schoolsData])

  const isAgeInRange = (ageText: string, selectedRange: string): boolean => {
    if (!ageText || selectedRange === "all") return true

    const ageStr = ageText.toLowerCase()

    // Extract numbers from the age text
    const numbers = ageStr.match(/\d+/g)?.map(Number) || []

    switch (selectedRange) {
      case "3-5":
        return (
          numbers.some((num) => num >= 3 && num <= 5) ||
          ageStr.includes("3") ||
          ageStr.includes("4") ||
          ageStr.includes("5") ||
          ageStr.includes("preschool") ||
          ageStr.includes("toddler")
        )
      case "5-9":
        return (
          numbers.some((num) => num >= 5 && num <= 9) ||
          ageStr.includes("5") ||
          ageStr.includes("6") ||
          ageStr.includes("7") ||
          ageStr.includes("8") ||
          ageStr.includes("9") ||
          ageStr.includes("elementary")
        )
      case "9-13":
        return (
          numbers.some((num) => num >= 9 && num <= 13) ||
          ageStr.includes("9") ||
          ageStr.includes("10") ||
          ageStr.includes("11") ||
          ageStr.includes("12") ||
          ageStr.includes("13")
        )
      case "13-18":
        return (
          numbers.some((num) => num >= 13 && num <= 18) ||
          ageStr.includes("13") ||
          ageStr.includes("14") ||
          ageStr.includes("15") ||
          ageStr.includes("16") ||
          ageStr.includes("17") ||
          ageStr.includes("18") ||
          ageStr.includes("high school") ||
          ageStr.includes("teenage")
        )
      case "18+":
        return (
          numbers.some((num) => num >= 18) ||
          ageStr.includes("18") ||
          ageStr.includes("19") ||
          ageStr.includes("20") ||
          ageStr.includes("21") ||
          ageStr.includes("adult") ||
          ageStr.includes("post") ||
          ageStr.includes("college") ||
          ageStr.includes("seminary")
        )
      default:
        return true
    }
  }

  const clearAllFilters = () => {
    setSelectedAge("all")
    setSelectedSchoolType("all")
    setSelectedArea("all")
    setSelectedLanguage("all")
    setSearchTerm("")
  }

  const matchesSchoolTypeFilter = (studentsServed: string, schoolName: string, selectedType: string): boolean => {
    if (selectedType === "all") return true

    const text = `${studentsServed} ${schoolName}`.toLowerCase()

    switch (selectedType) {
      case "mainstream":
        return text.includes("mainstream") || text.includes("integrated")
      case "special-ed":
        return (
          text.includes("special") ||
          text.includes("disabilities") ||
          text.includes("autism") ||
          text.includes("learning")
        )
      case "integrated":
        return text.includes("integrated") || text.includes("inclusion")
      case "preschool":
        return text.includes("preschool") || text.includes("early") || text.includes("3-5") || text.includes("toddler")
      case "high-school":
        return text.includes("high school") || text.includes("teenage") || text.includes("13-18")
      case "post-secondary":
        return text.includes("post") || text.includes("college") || text.includes("seminary") || text.includes("18+")
      default:
        return true
    }
  }

  const matchesAreaFilter = (location: string, selectedArea: string): boolean => {
    if (selectedArea === "all") return true
    if (!location) return false

    const locationLower = location.toLowerCase()

    switch (selectedArea) {
      case "brooklyn":
        return locationLower.includes("brooklyn") || locationLower.includes("bp") || locationLower.includes("boro park")
      case "manhattan":
        return locationLower.includes("manhattan") || locationLower.includes("nyc")
      case "queens":
        return locationLower.includes("queens") || locationLower.includes("far rockaway")
      case "bronx":
        return locationLower.includes("bronx")
      case "staten-island":
        return locationLower.includes("staten island")
      case "long-island":
        return locationLower.includes("long island") || locationLower.includes("valley stream")
      case "upstate":
        return (
          locationLower.includes("upstate") || (locationLower.includes("ny") && !locationLower.includes("brooklyn"))
        )
      case "out-of-state":
        return !locationLower.includes("ny") && !locationLower.includes("new york")
      default:
        return true
    }
  }

  const matchesLanguageFilter = (studentsServed: string, selectedLanguage: string): boolean => {
    if (selectedLanguage === "all") return true
    if (!studentsServed) return false

    const text = studentsServed.toLowerCase()

    switch (selectedLanguage) {
      case "english":
        return text.includes("english") || (!text.includes("yiddish") && !text.includes("hebrew"))
      case "yiddish":
        return text.includes("yiddish") || text.includes("heimish") || text.includes("chassidish")
      case "hebrew":
        return text.includes("hebrew")
      case "bilingual":
        return text.includes("bilingual") || (text.includes("yiddish") && text.includes("english"))
      default:
        return true
    }
  }

  const filteredSchools = schoolsData.filter((school) => {
    const matchesSearch = Object.values(school).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const matchesAge = isAgeInRange(school.studentsServed, selectedAge)
    const matchesSchoolType = matchesSchoolTypeFilter(school.studentsServed, school.name, selectedSchoolType)
    const matchesArea = matchesAreaFilter(school.location, selectedArea)
    const matchesLanguage = matchesLanguageFilter(school.studentsServed, selectedLanguage)

    return matchesSearch && matchesAge && matchesSchoolType && matchesArea && matchesLanguage
  })

  const handleFeedbackSubmit = async () => {
    if (!selectedSchoolForFeedback || !feedbackText.trim()) return

    setIsSubmittingFeedback(true)

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "schools",
          resourceName: selectedSchoolForFeedback.name,
          resourceData: selectedSchoolForFeedback,
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
        setSelectedSchoolForFeedback(null)
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

  const openFeedbackDialog = (school: School) => {
    setSelectedSchoolForFeedback(school)
    setFeedbackDialog(true)
    setFeedbackText("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading schools...</div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schools</h1>
          <p className="text-gray-600">Educational institutions and specialized schools</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search schools..."
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">School Type</label>
                <Select value={selectedSchoolType} onValueChange={setSelectedSchoolType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolTypeOptions.map((option) => (
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

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
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
            Showing {filteredSchools.length} of {schoolsData.length} schools
          </p>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchools.map((school, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl text-blue-600 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    {school.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  {school.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{school.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{school.phone}</span>
                  </div>
                  {school.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-blue-600">{school.email}</span>
                    </div>
                  )}
                  {school.contactPerson && (
                    <p className="text-sm">
                      <strong>Contact:</strong> {school.contactPerson}
                    </p>
                  )}
                </div>

                {/* Students Served */}
                {school.studentsServed && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Students Served:</strong> {school.studentsServed}
                    </p>
                  </div>
                )}

                {/* Feedback Button */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFeedbackDialog(school)}
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

        {filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No schools found matching your search.</p>
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Suggest Update for {selectedSchoolForFeedback?.name}</DialogTitle>
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
                  placeholder="Please describe what needs to be updated, corrected, or added. For example: 'Phone number has changed to...', 'School no longer accepts new students', 'Missing information about...', etc."
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
