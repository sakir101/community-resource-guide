"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryDefinition {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  fields: any[];
  isDefault?: boolean;
}

export default function SubmitResourcePage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [allCategories, setAllCategories] = useState<CategoryDefinition[]>([]);
  const { toast } = useToast();

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       console.log("Fetching categories from API...")
  //       const response = await fetch("/api/categories?includeDefault=true")
  //       console.log("API response status:", response.status)
  //       const result = await response.json()
  //       console.log("API result:", result)
  //       if (result.success) {
  //         console.log("Setting categories:", result.data)
  //         setAllCategories(result.data)
  //       } else {
  //         console.error("API returned error:", result.message)
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch categories:", error)
  //     }
  //   }

  //   fetchCategories()
  // }, [])

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();

        if (data.success) {
          const transformedCategories: CategoryDefinition[] = data.data.map(
            (cat: any) => ({
              id: cat.id,
              name: cat.name,
              label: cat.label,
              description: cat.description,
              icon: cat.icon,
              color: cat.color,
              createdAt: cat.createdAt,
              isDefault: cat.isDefault,
              fields: cat.categoryFields ?? [],
            })
          );

          setAllCategories(transformedCategories);
        } else {
          console.error("Failed:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    getCategories();
  }, []);

  const getFormFields = (category: string) => {
    const categoryInfo = allCategories.find(
      (cat) => cat.id === category || cat.name === category
    );
    if (categoryInfo && categoryInfo.fields) {
      return categoryInfo.fields;
    }
    return [];
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    // Clear any previous errors when user starts typing
    if (submitError) {
      setSubmitError("");
    }
  };

  const validateForm = () => {
    const fields = getFormFields(selectedCategory);
    const requiredFields = fields.filter((field) => field.required);

    for (const field of requiredFields) {
      if (!formData[field.name] || formData[field.name].trim() === "") {
        return `${field.label} is required`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        setSubmitError(validationError);
        setIsSubmitting(false);
        return;
      }

      console.log("Submitting form data:", {
        category: selectedCategory,
        data: formData,
      });

      // Convert formData to array of { name, id, value }
      const payload = formFields.map((field) => ({
        name: field.name,
        id: field.id || "", // Make sure each field has an id; fallback to "" if not
        value: formData[field.name] || "",
      }));

      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          category: selectedCategory,
          data: payload,
        }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let result;
      try {
        result = await response.json();
        console.log("API response:", result);
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error("Invalid response from server. Please try again.");
      }

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "Resource Submitted Successfully!",
          description: "Your resource has been submitted for admin approval.",
        });
      } else {
        throw new Error(result.message || "Failed to submit resource");
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "There was an error submitting your resource. Please try again.";
      setSubmitError(errorMessage);
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your resource has been submitted successfully. An administrator
              will review it and approve or reject it in the admin panel.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/submit-resource">Submit Another Resource</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formFields = getFormFields(selectedCategory);

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
            Submit New Resource
          </h1>
          <p className="text-gray-600">
            Help grow our community resource database by submitting a new
            resource for review
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Resource Submission Form
            </CardTitle>
            <p className="text-sm text-gray-600">
              All submissions will be reviewed by an administrator before being
              published
            </p>
          </CardHeader>
          <CardContent>
            {/* Error Display */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 font-medium">
                    Submission Failed
                  </h4>
                  <p className="text-red-700 text-sm mt-1">{submitError}</p>
                </div>
              </div>
            )}
            {/* Debug section - remove this after testing
            {process.env.NODE_ENV === "development" && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-bold">
                  Debug: Loaded Categories ({allCategories.length})
                </h3>
                <ul className="text-sm">
                  {allCategories.map((cat) => (
                    <li key={cat.id}>
                      {cat.label} (ID: {cat.id}, Default:{" "}
                      {cat.isDefault ? "Yes" : "No"})
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <>
                  {formFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>

                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.name}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.value)
                          }
                          required={field.required}
                          rows={3}
                          className={
                            submitError &&
                            field.required &&
                            !formData[field.name]
                              ? "border-red-300"
                              : ""
                          }
                        />
                      ) : field.type === "select" ? (
                        <Select
                          value={formData[field.name] || ""}
                          onValueChange={(value) =>
                            handleInputChange(field.name, value)
                          }
                        >
                          <SelectTrigger
                            className={
                              submitError &&
                              field.required &&
                              !formData[field.name]
                                ? "border-red-300"
                                : ""
                            }
                          >
                            <SelectValue
                              placeholder={`Select ${field.label.toLowerCase()}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) =>
                            handleInputChange(field.name, e.target.value)
                          }
                          required={field.required}
                          className={
                            submitError &&
                            field.required &&
                            !formData[field.name]
                              ? "border-red-300"
                              : ""
                          }
                        />
                      )}
                    </div>
                  ))}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Resource for Review"}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
