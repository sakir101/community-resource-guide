"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Gift, MessageSquare, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Perk {
  title: string;
  description: string;
  details: string;
}

export default function PerksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [perksData, setPerksData] = useState<Perk[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedPerkForFeedback, setSelectedPerkForFeedback] =
    useState<Perk | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");

  // Fetch perks data from API
  useEffect(() => {
    const fetchPerks = async () => {
      try {
        const response = await fetch("/api/resources?category=perks");
        const result = await response.json();
        if (result.success) {
          setPerksData(result.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPerks();
  }, []);

  // Add after the useEffect
  const getAvailableCategories = () => {
    const categories = new Set<string>();
    perksData.forEach((perk) => {
      const text = `${perk.title} ${perk.description}`.toLowerCase();
      if (text.includes("discount") || text.includes("savings"))
        categories.add("discounts");
      if (text.includes("transport") || text.includes("travel"))
        categories.add("transportation");
      if (text.includes("education") || text.includes("learning"))
        categories.add("education");
      if (
        text.includes("recreation") ||
        text.includes("activities") ||
        text.includes("fun")
      )
        categories.add("recreation");
      if (text.includes("health") || text.includes("medical"))
        categories.add("health");
      if (text.includes("service") || text.includes("support"))
        categories.add("services");
    });
    return [
      { value: "all", label: "All Categories" },
      ...Array.from(categories).map((category) => ({
        value: category,
        label:
          category === "discounts"
            ? "Discounts & Savings"
            : category === "transportation"
            ? "Transportation"
            : category === "education"
            ? "Educational Resources"
            : category === "recreation"
            ? "Recreation & Activities"
            : category === "health"
            ? "Health & Wellness"
            : "Services",
      })),
    ];
  };

  const getAvailableAvailability = () => {
    const availability = new Set<string>();
    perksData.forEach((perk) => {
      if (perk.details) {
        const text = perk.details.toLowerCase();
        if (text.includes("immediate") || text.includes("anytime"))
          availability.add("immediate");
        if (text.includes("appointment") || text.includes("contact"))
          availability.add("appointment");
        if (text.includes("seasonal") || text.includes("summer"))
          availability.add("seasonal");
        if (text.includes("limited") || text.includes("restrictions"))
          availability.add("limited");
      }
    });
    return [
      { value: "all", label: "All Availability" },
      ...Array.from(availability).map((avail) => ({
        value: avail,
        label:
          avail === "immediate"
            ? "Immediately Available"
            : avail === "appointment"
            ? "By Appointment"
            : avail === "seasonal"
            ? "Seasonal"
            : "Limited Availability",
      })),
    ];
  };

  // Replace static arrays
  const categoryOptions =
    perksData.length > 0
      ? getAvailableCategories()
      : [{ value: "all", label: "All Categories" }];
  const availabilityOptions =
    perksData.length > 0
      ? getAvailableAvailability()
      : [{ value: "all", label: "All Availability" }];

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedAvailability("all");
    setSearchTerm("");
  };

  const matchesCategoryFilter = (
    title: string,
    description: string,
    selectedCategory: string
  ): boolean => {
    if (selectedCategory === "all") return true;

    const text = `${title} ${description}`.toLowerCase();

    switch (selectedCategory) {
      case "discounts":
        return (
          text.includes("discount") ||
          text.includes("savings") ||
          text.includes("special")
        );
      case "transportation":
        return (
          text.includes("transport") ||
          text.includes("travel") ||
          text.includes("ride")
        );
      case "education":
        return (
          text.includes("education") ||
          text.includes("learning") ||
          text.includes("tutor")
        );
      case "recreation":
        return (
          text.includes("recreation") ||
          text.includes("activities") ||
          text.includes("fun") ||
          text.includes("sports")
        );
      case "health":
        return (
          text.includes("health") ||
          text.includes("medical") ||
          text.includes("wellness")
        );
      case "services":
        return (
          text.includes("service") ||
          text.includes("support") ||
          text.includes("assistance")
        );
      default:
        return true;
    }
  };

  const matchesAvailabilityFilter = (
    details: string,
    selectedAvailability: string
  ): boolean => {
    if (selectedAvailability === "all") return true;
    if (!details) return false;

    const text = details.toLowerCase();

    switch (selectedAvailability) {
      case "immediate":
        return (
          text.includes("immediate") ||
          text.includes("anytime") ||
          text.includes("available now")
        );
      case "appointment":
        return (
          text.includes("appointment") ||
          text.includes("contact") ||
          text.includes("call")
        );
      case "seasonal":
        return (
          text.includes("seasonal") ||
          text.includes("summer") ||
          text.includes("winter")
        );
      case "limited":
        return (
          text.includes("limited") ||
          text.includes("restrictions") ||
          text.includes("eligibility")
        );
      default:
        return true;
    }
  };

  const filteredPerks = perksData.filter((perk) => {
    const matchesSearch = Object.values(perk).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesCategory = matchesCategoryFilter(
      perk.title,
      perk.description,
      selectedCategory
    );
    const matchesAvailability = matchesAvailabilityFilter(
      perk.details,
      selectedAvailability
    );

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleFeedbackSubmit = async () => {
    if (!selectedPerkForFeedback || !feedbackText.trim()) return;

    setIsSubmittingFeedback(true);

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "perks",
          resourceName: selectedPerkForFeedback.title,
          resourceData: selectedPerkForFeedback,
          feedback: feedbackText,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Feedback Submitted!",
          description:
            "Thank you for your feedback. An admin will review it shortly.",
        });
        setFeedbackDialog(false);
        setFeedbackText("");
        setSelectedPerkForFeedback(null);
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const openFeedbackDialog = (perk: Perk) => {
    setSelectedPerkForFeedback(perk);
    setFeedbackDialog(true);
    setFeedbackText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading perks...</div>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Perks</h1>
          <p className="text-gray-600">
            Special perks and benefits available to community members
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search perks..."
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
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ml-auto text-blue-600"
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Availability
                </label>
                <Select
                  value={selectedAvailability}
                  onValueChange={setSelectedAvailability}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((option) => (
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
            Showing {filteredPerks.length} of {perksData.length} perks
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPerks.map((perk, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-pink-600 flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  {perk.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">{perk.description}</p>
                {perk.details && (
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <p className="text-sm text-pink-800">{perk.details}</p>
                  </div>
                )}
                {/* Feedback Button */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFeedbackDialog(perk)}
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

        {filteredPerks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No perks found matching your search.
            </p>
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Suggest Update for {selectedPerkForFeedback?.title}
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Help us keep our information accurate by suggesting updates or
                reporting issues
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  Your feedback or suggested changes:
                </Label>
                <Textarea
                  id="feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Please describe what needs to be updated, corrected, or added. For example: 'This perk is no longer available', 'Contact information has changed', 'Missing information about...', etc."
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
                <Button
                  variant="outline"
                  onClick={() => setFeedbackDialog(false)}
                  disabled={isSubmittingFeedback}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
