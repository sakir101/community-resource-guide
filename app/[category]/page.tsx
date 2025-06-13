"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Search, MessageSquare, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useParams } from "next/navigation"

interface CategoryDefinition {
  id: string
  name: string
  label: string
  description: string
  icon: string
  color: string
  fields: any[]
  isDefault?: boolean
}

export default function DynamicCategoryPage() {
  const params = useParams()
  const categoryName = params.category as string

  const [searchTerm, setSearchTerm] = useState("")
  const [resourcesData, setResourcesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryInfo, setCategoryInfo] = useState<CategoryDefinition | null>(null)
  const [feedbackDialog, setFeedbackDialog] = useState(false)
  const [selectedResourceForFeedback, setSelectedResourceForFeedback] = useState<any | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [filters, setFilters] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()

  // Fetch category info and resources
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "resourceStorage") {
        console.log("🔄 Storage changed, refreshing data...")
        // Refetch data when storage changes
        if (categoryName) {
          fetchCategoryData()
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom events
    const handleCustomRefresh = () => {
      console.log("🔄 Custom refresh event received")
      if (categoryName) {
        fetchCategoryData()
      }
    }

    window.addEventListener("refreshData", handleCustomRefresh)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("refreshData", handleCustomRefresh)
    }
  }, [categoryName])

  // Update the fetchCategoryData function to be more robust
  const fetchCategoryData = async () => {
    try {
      // Decode the category name in case it's URL encoded
      const decodedCategoryName = decodeURIComponent(categoryName)
      console.log("🔍 Looking for category:", decodedCategoryName, "from URL:", categoryName)

      // First, get category information
      const categoriesResponse = await fetch("/api/categories?includeDefault=true&_t=" + Date.now()) // Add cache buster
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json()
        if (categoriesResult.success) {
          console.log(
            "📋 Available categories:",
            categoriesResult.data.map((c: any) => ({ id: c.id, name: c.name, label: c.label })),
          )

          const category = categoriesResult.data.find(
            (cat: any) =>
              cat.name === categoryName ||
              cat.id === categoryName ||
              cat.name === decodedCategoryName ||
              cat.id === decodedCategoryName,
          )

          if (category) {
            console.log("✅ Found category:", category)
            setCategoryInfo(category)

            // Then, get resources for this category using the category's name/id
            const resourcesResponse = await fetch(`/api/resources?category=${category.name}&_t=` + Date.now()) // Add cache buster
            if (resourcesResponse.ok) {
              const resourcesResult = await resourcesResponse.json()
              if (resourcesResult.success) {
                console.log("📊 Found resources:", resourcesResult.data.length)
                setResourcesData(resourcesResult.data)
              }
            }
          } else {
            console.error(`❌ Category not found: ${categoryName} (decoded: ${decodedCategoryName})`)
          }
        }
      }
    } catch (error) {
      console.error("❌ Failed to fetch category data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update the main useEffect to use the new function
  useEffect(() => {
    if (categoryName) {
      setLoading(true)
      fetchCategoryData()
    }
  }, [categoryName])

  const handleFeedbackSubmit = async () => {
    if (!selectedResourceForFeedback || !feedbackText.trim()) return

    setIsSubmittingFeedback(true)

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categoryName,
          resourceName: getResourceDisplayName(selectedResourceForFeedback),
          resourceData: selectedResourceForFeedback,
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
        setSelectedResourceForFeedback(null)
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

  const openFeedbackDialog = (resource: any) => {
    setSelectedResourceForFeedback(resource)
    setFeedbackDialog(true)
    setFeedbackText("")
  }

  const getResourceDisplayName = (resource: any) => {
    if (!categoryInfo || !categoryInfo.fields || categoryInfo.fields.length === 0) {
      return "Unknown Resource"
    }

    // Use the first field as the display name
    const firstField = categoryInfo.fields[0]
    return resource[firstField.name] || "Unknown Resource"
  }

  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm("")
  }

  const filteredResources = resourcesData.filter((resource) => {
    const matchesSearch = Object.values(resource).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (value === "all" || !value) return true
      return resource[key]?.toString().toLowerCase().includes(value.toLowerCase())
    })

    return matchesSearch && matchesFilters
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-4">The category "{categoryName}" could not be found.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryInfo.label}</h1>
          <p className="text-gray-600">{categoryInfo.description}</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={`Search ${categoryInfo.label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Dynamic Filters based on category fields */}
          {categoryInfo.fields && categoryInfo.fields.length > 1 && (
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-gray-500" />
                <h3 className="font-medium text-gray-900">Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="ml-auto text-blue-600">
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryInfo.fields.slice(1, 4).map((field) => (
                  <div key={field.name}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{field.label}</label>
                    {field.type === "select" && field.options ? (
                      <Select
                        value={filters[field.name] || "all"}
                        onValueChange={(value) => setFilters({ ...filters, [field.name]: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All {field.label}</SelectItem>
                          {field.options.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={`Filter by ${field.label.toLowerCase()}`}
                        value={filters[field.name] || ""}
                        onChange={(e) => setFilters({ ...filters, [field.name]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredResources.length} of {resourcesData.length} resources
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">{getResourceDisplayName(resource)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display all fields */}
                <div className="space-y-2">
                  {categoryInfo.fields.slice(1).map((field) => {
                    const value = resource[field.name]
                    if (!value) return null

                    return (
                      <div key={field.name} className="text-sm">
                        <strong>{field.label}:</strong> {value}
                      </div>
                    )
                  })}
                </div>

                {/* Feedback Button */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFeedbackDialog(resource)}
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

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {resourcesData.length === 0
                ? `No resources found in ${categoryInfo.label}.`
                : "No resources found matching your search."}
            </p>
            {resourcesData.length === 0 && (
              <p className="text-gray-400 text-sm mt-2">Resources can be added through the admin panel.</p>
            )}
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Suggest Update for {selectedResourceForFeedback && getResourceDisplayName(selectedResourceForFeedback)}
              </DialogTitle>
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
                  placeholder="Please describe what needs to be updated, corrected, or added..."
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
