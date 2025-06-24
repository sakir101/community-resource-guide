"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Search,
  Phone,
  Mail,
  Stethoscope,
  MessageSquare,
  Filter,
} from "lucide-react";
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

interface MedicalSupply {
  resource: string;
  contact: string;
  email: string;
  notes: string;
  moreItems: string;
}

export default function MedicalSuppliesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicalSuppliesData, setMedicalSuppliesData] = useState<
    MedicalSupply[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedSupplyForFeedback, setSelectedSupplyForFeedback] =
    useState<MedicalSupply | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { toast } = useToast();

  const [selectedSupplyType, setSelectedSupplyType] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState("all");

  // Fetch medical supplies data from API
  useEffect(() => {
    const fetchMedicalSupplies = async () => {
      try {
        const response = await fetch(
          "/api/resources?category=medical-supplies"
        );
        const result = await response.json();
        if (result.success) {
          setMedicalSuppliesData(result.data);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalSupplies();
  }, []);

  // Add after the useEffect
  const getAvailableSupplyTypes = () => {
    const types = new Set<string>();
    medicalSuppliesData.forEach((supply) => {
      const text = `${supply.notes} ${supply.resource}`.toLowerCase();
      if (text.includes("diaper") || text.includes("incontinence"))
        types.add("incontinence");
      if (
        text.includes("stroller") ||
        text.includes("wheelchair") ||
        text.includes("mobility")
      )
        types.add("mobility");
      if (
        text.includes("oxygen") ||
        text.includes("equipment") ||
        text.includes("bed")
      )
        types.add("medical-equipment");
      if (text.includes("feeding") || text.includes("tube"))
        types.add("feeding");
      if (text.includes("oxygen") || text.includes("respiratory"))
        types.add("respiratory");
      if (text.includes("transport") || text.includes("medical transport"))
        types.add("transportation");
    });
    return [
      { value: "all", label: "All Supply Types" },
      ...Array.from(types).map((type) => ({
        value: type,
        label:
          type === "incontinence"
            ? "Incontinence Supplies"
            : type === "mobility"
            ? "Mobility Equipment"
            : type === "medical-equipment"
            ? "Medical Equipment"
            : type === "feeding"
            ? "Feeding Supplies"
            : type === "respiratory"
            ? "Respiratory Equipment"
            : "Transportation",
      })),
    ];
  };

  const getAvailableAreas = () => {
    const areas = new Set<string>();
    medicalSuppliesData.forEach((supply) => {
      const text = supply.resource.toLowerCase();
      if (text.includes("brooklyn") || text.includes("718"))
        areas.add("brooklyn");
      if (text.includes("manhattan") || text.includes("212"))
        areas.add("manhattan");
      if (text.includes("queens")) areas.add("queens");
      if (text.includes("bronx")) areas.add("bronx");
      if (text.includes("staten")) areas.add("staten-island");
      if (text.includes("long island") || text.includes("516"))
        areas.add("long-island");
      if (text.includes("nationwide") || text.includes("national"))
        areas.add("nationwide");
    });
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
            : "Nationwide",
      })),
    ];
  };

  const getAvailablePaymentTypes = () => {
    const payments = new Set<string>();
    medicalSuppliesData.forEach((supply) => {
      const text = supply.notes.toLowerCase();
      if (text.includes("medicaid") || text.includes("insurance"))
        payments.add("medicaid");
      if (text.includes("insurance") || text.includes("covered"))
        payments.add("insurance");
      if (text.includes("private") || text.includes("pay"))
        payments.add("private-pay");
      if (text.includes("free") || text.includes("no cost"))
        payments.add("free");
    });
    return [
      { value: "all", label: "All Payment Types" },
      ...Array.from(payments).map((payment) => ({
        value: payment,
        label:
          payment === "medicaid"
            ? "Medicaid Accepted"
            : payment === "insurance"
            ? "Insurance Accepted"
            : payment === "private-pay"
            ? "Private Pay"
            : "Free Services",
      })),
    ];
  };

  // Replace static arrays
  const supplyTypeOptions =
    medicalSuppliesData.length > 0
      ? getAvailableSupplyTypes()
      : [{ value: "all", label: "All Supply Types" }];
  const areaOptions =
    medicalSuppliesData.length > 0
      ? getAvailableAreas()
      : [{ value: "all", label: "All Areas" }];
  const paymentOptions =
    medicalSuppliesData.length > 0
      ? getAvailablePaymentTypes()
      : [{ value: "all", label: "All Payment Types" }];

  const handleFeedbackSubmit = async () => {
    if (!selectedSupplyForFeedback || !feedbackText.trim()) return;

    setIsSubmittingFeedback(true);

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "medical-supplies",
          resourceName: selectedSupplyForFeedback.resource,
          resourceData: selectedSupplyForFeedback,
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
        setSelectedSupplyForFeedback(null);
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

  const openFeedbackDialog = (supply: MedicalSupply) => {
    setSelectedSupplyForFeedback(supply);
    setFeedbackDialog(true);
    setFeedbackText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading medical supplies...</div>
      </div>
    );
  }

  const clearAllFilters = () => {
    setSelectedSupplyType("all");
    setSelectedArea("all");
    setSelectedPayment("all");
    setSearchTerm("");
  };

  const matchesSupplyType = (
    notes: string,
    resource: string,
    selectedType: string
  ): boolean => {
    if (selectedType === "all") return true;

    const text = `${notes} ${resource}`.toLowerCase();

    switch (selectedType) {
      case "incontinence":
        return (
          text.includes("diaper") ||
          text.includes("incontinence") ||
          text.includes("pull up") ||
          text.includes("liner")
        );
      case "mobility":
        return (
          text.includes("stroller") ||
          text.includes("wheelchair") ||
          text.includes("walker") ||
          text.includes("mobility")
        );
      case "medical-equipment":
        return (
          text.includes("oxygen") ||
          text.includes("equipment") ||
          text.includes("bed") ||
          text.includes("chair")
        );
      case "feeding":
        return (
          text.includes("feeding") ||
          text.includes("tube") ||
          text.includes("enteral")
        );
      case "respiratory":
        return (
          text.includes("oxygen") ||
          text.includes("respiratory") ||
          text.includes("breathing")
        );
      case "transportation":
        return (
          text.includes("transport") ||
          text.includes("car") ||
          text.includes("medical transport")
        );
      default:
        return true;
    }
  };

  const matchesAreaFilter = (
    resource: string,
    selectedArea: string
  ): boolean => {
    if (selectedArea === "all") return true;

    const text = resource.toLowerCase();

    switch (selectedArea) {
      case "brooklyn":
        return text.includes("brooklyn") || text.includes("718");
      case "manhattan":
        return text.includes("manhattan") || text.includes("212");
      case "queens":
        return text.includes("queens") || text.includes("718");
      case "bronx":
        return text.includes("bronx");
      case "staten-island":
        return text.includes("staten");
      case "long-island":
        return text.includes("long island") || text.includes("516");
      case "nationwide":
        return text.includes("nationwide") || text.includes("national");
      default:
        return true;
    }
  };

  const matchesPaymentFilter = (
    notes: string,
    selectedPayment: string
  ): boolean => {
    if (selectedPayment === "all") return true;

    const text = notes.toLowerCase();

    switch (selectedPayment) {
      case "medicaid":
        return text.includes("medicaid") || text.includes("insurance");
      case "insurance":
        return text.includes("insurance") || text.includes("covered");
      case "private-pay":
        return (
          text.includes("private") ||
          text.includes("pay") ||
          text.includes("cost")
        );
      case "free":
        return text.includes("free") || text.includes("no cost");
      default:
        return true;
    }
  };

  const filteredSupplies = medicalSuppliesData.filter((supply) => {
    const matchesSearch = Object.values(supply).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesType = matchesSupplyType(
      supply.notes,
      supply.resource,
      selectedSupplyType
    );
    const matchesArea = matchesAreaFilter(supply.resource, selectedArea);
    const matchesPayment = matchesPaymentFilter(supply.notes, selectedPayment);

    return matchesSearch && matchesType && matchesArea && matchesPayment;
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
            Medical Supplies & Resources
          </h1>
          <p className="text-gray-600">
            Medical supplies and equipment resources
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search medical supplies..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Supply Type
                </label>
                <Select
                  value={selectedSupplyType}
                  onValueChange={setSelectedSupplyType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supplyTypeOptions.map((option) => (
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
                  Payment
                </label>
                <Select
                  value={selectedPayment}
                  onValueChange={setSelectedPayment}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentOptions.map((option) => (
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
            Showing {filteredSupplies.length} of {medicalSuppliesData.length}{" "}
            resources
          </p>
        </div>

        {/* Supplies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSupplies.map((supply, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-red-600 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2" />
                  {supply.resource}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  {supply.contact && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{supply.contact}</span>
                    </div>
                  )}
                  {supply.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-blue-600">{supply.email}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {supply.notes && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">{supply.notes}</p>
                  </div>
                )}

                {/* Additional Items */}
                {supply.moreItems && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Additional Services:</strong> {supply.moreItems}
                    </p>
                  </div>
                )}
                {/* Feedback Button */}
                <div className="pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFeedbackDialog(supply)}
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

        {filteredSupplies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No medical supplies found matching your search.
            </p>
          </div>
        )}
        {/* Feedback Dialog */}
        <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Suggest Update for {selectedSupplyForFeedback?.resource}
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
                  placeholder="Please describe what needs to be updated, corrected, or added. For example: 'Contact information has changed to...', 'This supplier no longer provides this service', 'Missing information about...', etc."
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
