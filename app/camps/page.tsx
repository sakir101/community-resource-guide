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
  Phone,
  Mail,
  MapPin,
  Users,
  Calendar,
  Filter,
  MessageSquare,
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
import { campsData as staticCampsData } from "@/app/data/camps";

interface Camp {
  contactPerson: string;
  phone: string;
  campName: string;
  underAuspicesOf: string;
  gender: string;
  ages: string;
  description: string;
  language: string;
  medicalNeeds: string;
  location: string;
  integrated: string;
  applicationsOpen: string;
  email: string;
  comments: string;
  tuition: string;
  fundingSources: string;
  scholarships: string;
}

export default function CampsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedCampType, setSelectedCampType] = useState("all");
  const [selectedMedicaid, setSelectedMedicaid] = useState("all");
  const [campsData, setCampsData] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedCampForFeedback, setSelectedCampForFeedback] =
    useState<Camp | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { toast } = useToast();

  // Fetch camps data from API or use static data
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const response = await fetch("/api/resources?category=camps");
        const result = await response.json();
        if (result.success) {
          setCampsData(result.data);
        } else {
          // Fallback to static data if API fails
          setCampsData(staticCampsData);
        }
      } catch (error) {
        // Fallback to static data if API fails
        setCampsData(staticCampsData);
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, []);

  // Helper functions - moved to top
  const parseAgeRange = (
    ageText: string
  ): { min: number; max: number } | null => {
    if (!ageText) return null;

    // Extract all numbers from the age text
    const numbers = ageText.match(/\d+/g)?.map(Number) || [];

    if (numbers.length === 0) return null;

    // If we have numbers, find min and max
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    return { min, max };
  };

  const isAgeInRange = (ageText: string, selectedRange: string): boolean => {
    if (selectedRange === "all") return true;
    if (!ageText) return false;

    const campAgeRange = parseAgeRange(ageText);
    if (!campAgeRange) return false;

    switch (selectedRange) {
      case "3-5":
        return campAgeRange.min <= 5 && campAgeRange.max >= 3;
      case "5-9":
        return campAgeRange.min <= 9 && campAgeRange.max >= 5;
      case "9-13":
        return campAgeRange.min <= 13 && campAgeRange.max >= 9;
      case "13-18":
        return campAgeRange.min <= 18 && campAgeRange.max >= 13;
      case "18+":
        return campAgeRange.max >= 18;
      default:
        return true;
    }
  };

  const matchesGender = (
    campGender: string,
    selectedGender: string
  ): boolean => {
    if (selectedGender === "all") return true;
    if (!campGender) return false;

    const genderLower = campGender.toLowerCase();

    switch (selectedGender) {
      case "boys":
        return genderLower.includes("boy") || genderLower.includes("male");
      case "girls":
        return genderLower.includes("girl") || genderLower.includes("female");
      case "both":
        return (
          genderLower.includes("both") ||
          genderLower.includes("mixed") ||
          (genderLower.includes("boy") && genderLower.includes("girl"))
        );
      default:
        return true;
    }
  };

  const matchesArea = (location: string, selectedArea: string): boolean => {
    if (selectedArea === "all") return true;
    if (!location) return false;

    const locationLower = location.toLowerCase();

    switch (selectedArea) {
      case "nyc":
        return (
          locationLower.includes("brooklyn") ||
          locationLower.includes("manhattan") ||
          locationLower.includes("queens") ||
          locationLower.includes("bronx") ||
          locationLower.includes("staten island") ||
          locationLower.includes("nyc") ||
          locationLower.includes("new york city") ||
          locationLower.includes("bp") ||
          locationLower.includes("boro park") ||
          locationLower.includes("flatbush") ||
          locationLower.includes("crown heights") ||
          locationLower.includes("williamsburg") ||
          locationLower.includes("far rockaway")
        );
      case "brooklyn":
        return (
          locationLower.includes("brooklyn") ||
          locationLower.includes("bp") ||
          locationLower.includes("boro park") ||
          locationLower.includes("flatbush") ||
          locationLower.includes("crown heights") ||
          locationLower.includes("williamsburg")
        );
      case "upstate":
        return (
          locationLower.includes("upstate") ||
          locationLower.includes("fallsburg") ||
          locationLower.includes("south fallsburg") ||
          locationLower.includes("liberty") ||
          locationLower.includes("woodbourne") ||
          locationLower.includes("parksville") ||
          locationLower.includes("ellenville") ||
          locationLower.includes("swan lake") ||
          locationLower.includes("wurtsboro") ||
          locationLower.includes("monroe") ||
          locationLower.includes("catskill") ||
          locationLower.includes("sullivan county") ||
          locationLower.includes("ulster county") ||
          (locationLower.includes("ny") &&
            !locationLower.includes("brooklyn") &&
            !locationLower.includes("queens") &&
            !locationLower.includes("manhattan") &&
            !locationLower.includes("bronx"))
        );
      case "out-of-state":
        return (
          locationLower.includes("canada") ||
          locationLower.includes("montreal") ||
          locationLower.includes("israel") ||
          (!locationLower.includes("ny") && !locationLower.includes("new york"))
        );
      default:
        return true;
    }
  };

  const matchesCampType = (
    comments: string,
    campName: string,
    selectedType: string
  ): boolean => {
    if (selectedType === "all") return true;

    const text = `${comments} ${campName}`.toLowerCase();

    switch (selectedType) {
      case "day":
        return (
          text.includes("day camp") ||
          text.includes("daycamp") ||
          text.includes("day program") ||
          (!text.includes("overnight") &&
            !text.includes("sleepaway") &&
            !text.includes("sleep away"))
        );
      case "overnight":
        return (
          text.includes("overnight") ||
          text.includes("sleepaway") ||
          text.includes("sleep away") ||
          text.includes("8 weeks") ||
          text.includes("full summer") ||
          text.includes("residential")
        );
      case "both":
        return (
          (text.includes("day") &&
            (text.includes("overnight") || text.includes("sleepaway"))) ||
          text.includes("both") ||
          text.includes("option")
        );
      default:
        return true;
    }
  };

  const matchesMedicaid = (
    fundingSources: string,
    tuition: string,
    scholarships: string,
    selectedMedicaid: string
  ): boolean => {
    if (selectedMedicaid === "all") return true;

    const text = `${fundingSources} ${tuition} ${scholarships}`.toLowerCase();

    switch (selectedMedicaid) {
      case "medicaid-accepted":
        return (
          text.includes("medicaid") ||
          text.includes("opwdd") ||
          text.includes("respite") ||
          text.includes("funding") ||
          text.includes("can use") ||
          text.includes("covered") ||
          text.includes("state funding")
        );
      case "private-pay":
        return (
          text.includes("tuition") ||
          text.includes("$") ||
          text.includes("fee") ||
          text.includes("cost") ||
          text.includes("price")
        );
      case "scholarships":
        return (
          text.includes("scholarship") ||
          text.includes("financial aid") ||
          text.includes("assistance") ||
          scholarships.toLowerCase().includes("yes")
        );
      default:
        return true;
    }
  };

  // Dynamic filter options - now these can use the helper functions above
  const getAvailableAges = () => {
    const ages = new Set<string>();
    campsData.forEach((camp) => {
      if (camp.ages) {
        const ageRange = parseAgeRange(camp.ages);
        if (ageRange) {
          if (ageRange.min <= 5 && ageRange.max >= 3) ages.add("3-5");
          if (ageRange.min <= 9 && ageRange.max >= 5) ages.add("5-9");
          if (ageRange.min <= 13 && ageRange.max >= 9) ages.add("9-13");
          if (ageRange.min <= 18 && ageRange.max >= 13) ages.add("13-18");
          if (ageRange.max >= 18) ages.add("18+");
        }
      }
    });
    return [
      { value: "all", label: "All Ages" },
      ...Array.from(ages).map((age) => ({
        value: age,
        label: age === "18+" ? "18+ years" : `${age} years`,
      })),
    ];
  };

  const getAvailableGenders = () => {
    const genders = new Set<string>();
    campsData.forEach((camp) => {
      if (camp.gender) {
        const genderLower = camp.gender.toLowerCase();
        if (genderLower.includes("boy") || genderLower.includes("male"))
          genders.add("boys");
        if (genderLower.includes("girl") || genderLower.includes("female"))
          genders.add("girls");
        if (
          genderLower.includes("both") ||
          genderLower.includes("mixed") ||
          (genderLower.includes("boy") && genderLower.includes("girl"))
        )
          genders.add("both");
      }
    });
    return [
      { value: "all", label: "All Genders" },
      ...Array.from(genders).map((gender) => ({
        value: gender,
        label:
          gender === "boys"
            ? "Boys"
            : gender === "girls"
            ? "Girls"
            : "Both/Mixed",
      })),
    ];
  };

  const getAvailableAreas = () => {
    const areas = new Set<string>();
    campsData.forEach((camp) => {
      if (camp.location) {
        const locationLower = camp.location.toLowerCase();
        if (
          locationLower.includes("brooklyn") ||
          locationLower.includes("bp") ||
          locationLower.includes("boro park") ||
          locationLower.includes("flatbush") ||
          locationLower.includes("crown heights") ||
          locationLower.includes("williamsburg")
        ) {
          areas.add("brooklyn");
        }
        if (
          locationLower.includes("manhattan") ||
          locationLower.includes("queens") ||
          locationLower.includes("bronx") ||
          locationLower.includes("staten island") ||
          locationLower.includes("nyc") ||
          locationLower.includes("far rockaway")
        ) {
          areas.add("nyc");
        }
        if (
          locationLower.includes("upstate") ||
          locationLower.includes("fallsburg") ||
          locationLower.includes("liberty") ||
          locationLower.includes("catskill")
        ) {
          areas.add("upstate");
        }
        if (
          locationLower.includes("canada") ||
          locationLower.includes("israel") ||
          (!locationLower.includes("ny") && !locationLower.includes("new york"))
        ) {
          areas.add("out-of-state");
        }
      }
    });
    return [
      { value: "all", label: "All Areas" },
      ...Array.from(areas).map((area) => ({
        value: area,
        label:
          area === "nyc"
            ? "NYC (5 Boroughs)"
            : area === "brooklyn"
            ? "Brooklyn"
            : area === "upstate"
            ? "Upstate NY"
            : "Out of State",
      })),
    ];
  };

  const getAvailableCampTypes = () => {
    const types = new Set<string>();
    campsData.forEach((camp) => {
      const text = `${camp.comments} ${camp.campName}`.toLowerCase();
      if (
        text.includes("day camp") ||
        text.includes("daycamp") ||
        (!text.includes("overnight") && !text.includes("sleepaway"))
      ) {
        types.add("day");
      }
      if (
        text.includes("overnight") ||
        text.includes("sleepaway") ||
        text.includes("8 weeks") ||
        text.includes("residential")
      ) {
        types.add("overnight");
      }
      if (
        (text.includes("day") &&
          (text.includes("overnight") || text.includes("sleepaway"))) ||
        text.includes("both") ||
        text.includes("option")
      ) {
        types.add("both");
      }
    });
    return [
      { value: "all", label: "All Camp Types" },
      ...Array.from(types).map((type) => ({
        value: type,
        label:
          type === "day"
            ? "Day Camp"
            : type === "overnight"
            ? "Overnight/Sleepaway"
            : "Both Options",
      })),
    ];
  };

  const getAvailablePaymentTypes = () => {
    const payments = new Set<string>();
    campsData.forEach((camp) => {
      const text =
        `${camp.fundingSources} ${camp.tuition} ${camp.scholarships}`.toLowerCase();
      if (
        text.includes("medicaid") ||
        text.includes("opwdd") ||
        text.includes("funding")
      ) {
        payments.add("medicaid-accepted");
      }
      if (
        text.includes("tuition") ||
        text.includes("$") ||
        text.includes("fee")
      ) {
        payments.add("private-pay");
      }
      if (text.includes("scholarship") || text.includes("financial aid")) {
        payments.add("scholarships");
      }
    });
    return [
      { value: "all", label: "All Payment Types" },
      ...Array.from(payments).map((payment) => ({
        value: payment,
        label:
          payment === "medicaid-accepted"
            ? "Medicaid/OPWDD Accepted"
            : payment === "private-pay"
            ? "Private Pay"
            : "Scholarships Available",
      })),
    ];
  };

  // Use these dynamic options in the filter dropdowns
  const ageRanges = getAvailableAges();
  const genderOptions = getAvailableGenders();
  const areaOptions = getAvailableAreas();
  const campTypeOptions = getAvailableCampTypes();
  const medicaidOptions = getAvailablePaymentTypes();

  const filteredCamps = campsData.filter((camp) => {
    const matchesSearch = Object.values(camp).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesAge = isAgeInRange(camp.ages, selectedAge);
    const matchesGenderFilter = matchesGender(camp.gender, selectedGender);
    const matchesAreaFilter = matchesArea(camp.location, selectedArea);
    const matchesCampTypeFilter = matchesCampType(
      camp.comments,
      camp.campName,
      selectedCampType
    );
    const matchesMedicaidFilter = matchesMedicaid(
      camp.fundingSources,
      camp.tuition,
      camp.scholarships,
      selectedMedicaid
    );

    return (
      matchesSearch &&
      matchesAge &&
      matchesGenderFilter &&
      matchesAreaFilter &&
      matchesCampTypeFilter &&
      matchesMedicaidFilter
    );
  });

  const clearAllFilters = () => {
    setSelectedAge("all");
    setSelectedGender("all");
    setSelectedArea("all");
    setSelectedCampType("all");
    setSelectedMedicaid("all");
    setSearchTerm("");
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedCampForFeedback || !feedbackText.trim()) return;

    setIsSubmittingFeedback(true);

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "camps",
          resourceName: selectedCampForFeedback.campName,
          resourceData: selectedCampForFeedback,
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
        setSelectedCampForFeedback(null);
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

  const openFeedbackDialog = (camp: Camp) => {
    setSelectedCampForFeedback(camp);
    setFeedbackDialog(true);
    setFeedbackText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading camps...</div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Camps</h1>
          <p className="text-gray-600">
            Summer camps and recreational programs for special needs children
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search camps..."
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
                  Area
                </label>
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Camp Type
                </label>
                <Select
                  value={selectedCampType}
                  onValueChange={setSelectedCampType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Payment
                </label>
                <Select
                  value={selectedMedicaid}
                  onValueChange={setSelectedMedicaid}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {medicaidOptions.map((option) => (
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
            Showing {filteredCamps.length} of {campsData.length} camps
          </p>
        </div>

        {/* Camps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCamps.map((camp, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-blue-600">
                    {camp.campName}
                  </CardTitle>
                  <Badge variant="outline">{camp.gender}</Badge>
                </div>
                <p className="text-sm text-gray-600">{camp.underAuspicesOf}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{camp.phone}</span>
                  </div>
                  {camp.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-blue-600">{camp.email}</span>
                    </div>
                  )}
                  {camp.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{camp.location}</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {camp.ages && (
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        <strong>Ages:</strong> {camp.ages}
                      </span>
                    </div>
                  )}
                  {camp.description && (
                    <p className="text-sm">
                      <strong>Serves:</strong> {camp.description}
                    </p>
                  )}
                  {camp.integrated && (
                    <p className="text-sm">
                      <strong>Setting:</strong> {camp.integrated}
                    </p>
                  )}
                  {camp.medicalNeeds && (
                    <p className="text-sm">
                      <strong>Medical:</strong> {camp.medicalNeeds}
                    </p>
                  )}
                  {camp.tuition && (
                    <p className="text-sm">
                      <strong>Tuition:</strong> {camp.tuition}
                    </p>
                  )}
                  {camp.fundingSources && (
                    <p className="text-sm">
                      <strong>Funding:</strong> {camp.fundingSources}
                    </p>
                  )}
                  {camp.applicationsOpen && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        <strong>Applications:</strong> {camp.applicationsOpen}
                      </span>
                    </div>
                  )}
                </div>

                {/* Comments */}
                {camp.comments && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">{camp.comments}</p>
                  </div>
                )}

                {/* Feedback Button */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFeedbackDialog(camp)}
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

        {filteredCamps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No camps found matching your search and filters.
            </p>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="mt-4"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Suggest Update for {selectedCampForFeedback?.campName}
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
                  placeholder="Please describe what needs to be updated, corrected, or added. For example: 'Phone number has changed to...', 'Camp no longer accepts new applications', 'Missing information about...', etc."
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
