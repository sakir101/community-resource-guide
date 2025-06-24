"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Heart,
  MapPin,
  Calendar,
  MessageSquare,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface HamaspikProgram {
  program: string;
  gender: string;
  functioningLevel: string;
  location: string;
  daysOpen: string;
  contact: string;
  runBy: string;
}

export default function HamaspikProgramsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAge, setSelectedAge] = useState("all");
  const [hamaspikData, setHamaspikData] = useState<HamaspikProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedProgramForFeedback, setSelectedProgramForFeedback] =
    useState<HamaspikProgram | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { toast } = useToast();

  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedFunctioningLevel, setSelectedFunctioningLevel] =
    useState("all");
  const [selectedDays, setSelectedDays] = useState("all");

  // Fetch hamaspik programs data from API
  useEffect(() => {
    const fetchHamaspikPrograms = async () => {
      try {
        const response = await fetch(
          "/api/resources?category=hamaspik-programs"
        );
        const result = await response.json();
        if (result.success) {
          setHamaspikData(result.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchHamaspikPrograms();
  }, []);

  // Add after the useEffect
  const getAvailableAges = () => {
    const ages = new Set<string>();
    hamaspikData.forEach((program) => {
      if (program.gender) {
        const genderLower = program.gender.toLowerCase();
        if (
          genderLower.includes("3") ||
          genderLower.includes("4") ||
          genderLower.includes("5")
        )
          ages.add("3-9");
        if (
          genderLower.includes("9") ||
          genderLower.includes("10") ||
          genderLower.includes("11")
        )
          ages.add("9-15");
        if (
          genderLower.includes("15") ||
          genderLower.includes("16") ||
          genderLower.includes("17")
        )
          ages.add("15-21");
        if (genderLower.includes("21") || genderLower.includes("adult"))
          ages.add("21+");
      }
    });
    return [
      { value: "all", label: "All Ages" },
      ...Array.from(ages).map((age) => ({
        value: age,
        label: age === "21+" ? "21+ years" : `${age} years`,
      })),
    ];
  };

  const getAvailableGenders = () => {
    const genders = new Set<string>();
    hamaspikData.forEach((program) => {
      if (program.gender) {
        const genderLower = program.gender.toLowerCase();
        if (genderLower.includes("male") || genderLower.includes("boys"))
          genders.add("male");
        if (genderLower.includes("female") || genderLower.includes("girls"))
          genders.add("female");
        if (genderLower.includes("both") || genderLower.includes("mixed"))
          genders.add("both");
      }
    });
    return [
      { value: "all", label: "All Genders" },
      ...Array.from(genders).map((gender) => ({
        value: gender,
        label:
          gender === "male" ? "Male" : gender === "female" ? "Female" : "Both",
      })),
    ];
  };

  const getAvailableLocations = () => {
    const locations = new Set<string>();
    hamaspikData.forEach((program) => {
      if (program.location) {
        const locationLower = program.location.toLowerCase();
        if (locationLower.includes("bp") || locationLower.includes("boro park"))
          locations.add("bp");
        if (locationLower.includes("williamsburg"))
          locations.add("williamsburg");
        if (locationLower.includes("flatbush")) locations.add("flatbush");
        if (locationLower.includes("crown heights"))
          locations.add("crown-heights");
        if (locationLower.includes("far rockaway"))
          locations.add("far-rockaway");
        if (locationLower.includes("staten island"))
          locations.add("staten-island");
      }
    });
    return [
      { value: "all", label: "All Locations" },
      ...Array.from(locations).map((location) => ({
        value: location,
        label:
          location === "bp"
            ? "Boro Park"
            : location === "williamsburg"
            ? "Williamsburg"
            : location === "flatbush"
            ? "Flatbush"
            : location === "crown-heights"
            ? "Crown Heights"
            : location === "far-rockaway"
            ? "Far Rockaway"
            : "Staten Island",
      })),
    ];
  };

  const getAvailableFunctioningLevels = () => {
    const levels = new Set<string>();
    hamaspikData.forEach((program) => {
      if (program.functioningLevel) {
        const levelLower = program.functioningLevel.toLowerCase();
        if (levelLower.includes("high")) levels.add("high");
        if (levelLower.includes("mid")) levels.add("mid");
        if (levelLower.includes("low")) levels.add("low");
        if (levelLower.includes("various") || levelLower.includes("all"))
          levels.add("various");
      }
    });
    return [
      { value: "all", label: "All Levels" },
      ...Array.from(levels).map((level) => ({
        value: level,
        label:
          level === "high"
            ? "High Functioning"
            : level === "mid"
            ? "Mid Functioning"
            : level === "low"
            ? "Low Functioning"
            : "Various Levels",
      })),
    ];
  };

  const getAvailableDays = () => {
    const days = new Set<string>();
    hamaspikData.forEach((program) => {
      if (program.daysOpen) {
        const daysLower = program.daysOpen.toLowerCase();
        if (daysLower.includes("monday-friday")) days.add("weekdays");
        if (daysLower.includes("sunday-friday")) days.add("sunday-friday");
        if (daysLower.includes("sunday-thursday")) days.add("sunday-thursday");
        if (daysLower.includes("all") || daysLower.includes("24/7"))
          days.add("all-week");
        if (daysLower.includes("flexible") || daysLower.includes("as needed"))
          days.add("flexible");
      }
    });
    return [
      { value: "all", label: "All Schedules" },
      ...Array.from(days).map((day) => ({
        value: day,
        label:
          day === "weekdays"
            ? "Weekdays Only"
            : day === "sunday-friday"
            ? "Sunday-Friday"
            : day === "sunday-thursday"
            ? "Sunday-Thursday"
            : day === "all-week"
            ? "All Week"
            : "Flexible",
      })),
    ];
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedProgramForFeedback || !feedbackText.trim()) return;

    setIsSubmittingFeedback(true);

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "hamaspik-programs",
          resourceName: selectedProgramForFeedback.program,
          resourceData: selectedProgramForFeedback,
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
        setSelectedProgramForFeedback(null);
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

  const openFeedbackDialog = (program: HamaspikProgram) => {
    setSelectedProgramForFeedback(program);
    setFeedbackDialog(true);
    setFeedbackText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading hamaspik programs...</div>
      </div>
    );
  }

  // Replace static arrays
  const ageRanges = getAvailableAges();
  const genderOptions = getAvailableGenders();
  const locationOptions = getAvailableLocations();
  const functioningLevelOptions = getAvailableFunctioningLevels();
  const daysOptions = getAvailableDays();

  const clearAllFilters = () => {
    setSelectedAge("all");
    setSelectedGender("all");
    setSelectedLocation("all");
    setSelectedFunctioningLevel("all");
    setSelectedDays("all");
    setSearchTerm("");
  };

  const matchesGenderFilter = (
    gender: string,
    selectedGender: string
  ): boolean => {
    if (selectedGender === "all") return true;
    if (!gender) return false;

    const genderLower = gender.toLowerCase();

    switch (selectedGender) {
      case "male":
        return genderLower.includes("male") || genderLower.includes("boys");
      case "female":
        return genderLower.includes("female") || genderLower.includes("girls");
      case "both":
        return genderLower.includes("both") || genderLower.includes("mixed");
      default:
        return true;
    }
  };

  const matchesLocationFilter = (
    location: string,
    selectedLocation: string
  ): boolean => {
    if (selectedLocation === "all") return true;
    if (!location) return false;

    const locationLower = location.toLowerCase();

    switch (selectedLocation) {
      case "bp":
        return (
          locationLower.includes("bp") || locationLower.includes("boro park")
        );
      case "williamsburg":
        return locationLower.includes("williamsburg");
      case "flatbush":
        return locationLower.includes("flatbush");
      case "crown-heights":
        return locationLower.includes("crown heights");
      case "far-rockaway":
        return locationLower.includes("far rockaway");
      case "staten-island":
        return locationLower.includes("staten island");
      default:
        return true;
    }
  };

  const matchesFunctioningLevelFilter = (
    functioningLevel: string,
    selectedLevel: string
  ): boolean => {
    if (selectedLevel === "all") return true;
    if (!functioningLevel) return false;

    const levelLower = functioningLevel.toLowerCase();

    switch (selectedLevel) {
      case "high":
        return levelLower.includes("high");
      case "mid":
        return levelLower.includes("mid");
      case "low":
        return levelLower.includes("low");
      case "various":
        return levelLower.includes("various") || levelLower.includes("all");
      default:
        return true;
    }
  };

  const matchesDaysFilter = (
    daysOpen: string,
    selectedDays: string
  ): boolean => {
    if (selectedDays === "all") return true;
    if (!daysOpen) return false;

    const daysLower = daysOpen.toLowerCase();

    switch (selectedDays) {
      case "weekdays":
        return daysLower.includes("monday-friday");
      case "sunday-friday":
        return daysLower.includes("sunday-friday");
      case "sunday-thursday":
        return daysLower.includes("sunday-thursday");
      case "all-week":
        return daysLower.includes("all") || daysLower.includes("24/7");
      case "flexible":
        return (
          daysLower.includes("flexible") || daysLower.includes("as needed")
        );
      default:
        return true;
    }
  };

  const filteredPrograms = hamaspikData.filter((program) => {
    const matchesSearch = Object.values(program).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesAge =
      selectedAge === "all" ||
      (program.gender &&
        program.gender
          .toLowerCase()
          .includes(selectedAge.toLowerCase().split("-")[0])) ||
      program.gender.toLowerCase().includes("ages") ||
      (selectedAge === "21+" && program.gender.includes("21"));

    const matchesGender = matchesGenderFilter(program.gender, selectedGender);
    const matchesLocation = matchesLocationFilter(
      program.location,
      selectedLocation
    );
    const matchesFunctioningLevel = matchesFunctioningLevelFilter(
      program.functioningLevel,
      selectedFunctioningLevel
    );
    const matchesDays = matchesDaysFilter(program.daysOpen, selectedDays);

    return (
      matchesSearch &&
      matchesAge &&
      matchesGender &&
      matchesLocation &&
      matchesFunctioningLevel &&
      matchesDays
    );
  });

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hamaspik Programs
          </h1>
          <p className="text-gray-600">
            Hamaspik organization programs and services
          </p>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="ml-auto text-blue-600"
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Age Range
                </label>
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Gender
                </label>
                <Select
                  value={selectedGender}
                  onValueChange={setSelectedGender}
                >
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Location
                </label>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Functioning Level
                </label>
                <Select
                  value={selectedFunctioningLevel}
                  onValueChange={setSelectedFunctioningLevel}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {functioningLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Days Open
                </label>
                <Select value={selectedDays} onValueChange={setSelectedDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOptions.map((option) => (
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
            Showing {filteredPrograms.length} of {hamaspikData.length} programs
          </p>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPrograms.map((program, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-purple-600 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    {program.program}
                  </CardTitle>
                  <Badge variant="outline">{program.gender}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Program Details */}
                <div className="space-y-2">
                  {program.functioningLevel && (
                    <p className="text-sm">
                      <strong>Level:</strong> {program.functioningLevel}
                    </p>
                  )}
                  {program.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{program.location}</span>
                    </div>
                  )}
                  {program.daysOpen && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{program.daysOpen}</span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {program.contact && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Contact:</strong> {program.contact}
                    </p>
                  </div>
                )}

                {/* Run By */}
                {program.runBy && (
                  <p className="text-sm">
                    <strong>Run By:</strong> {program.runBy}
                  </p>
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
            <p className="text-gray-500">
              No programs found matching your search.
            </p>
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Suggest Update for {selectedProgramForFeedback?.program}
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
                  placeholder="Please describe what needs to be updated, corrected, or added. For example: 'Contact information has changed to...', 'Program schedule has been updated', 'Missing information about...', etc."
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

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Additional Information
          </h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>
              • Most programs have transportation from all areas including Boro
              Park, Flatbush, Crown Heights, Staten Island, and Far Rockaway
            </li>
            <li>
              • Programs offer full day services on legal holidays, Chol HaMoed,
              and Isru Chag
            </li>
            <li>• Shabbatons are offered 2-3 times per year</li>
            <li>
              • Fit with Friends program has Shabbos programs in Flatbush and
              Far Rockaway
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
