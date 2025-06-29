"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  LogOut,
  Edit,
  X,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSettings, saveSettings } from "@/app/lib/settings";
import type { CategoryDefinition } from "../lib/storage";
import { IconSelector } from "@/app/components/icon-selector";
import {
  getUsers,
  deleteUser,
  updateUser,
  type User,
} from "@/app/lib/user-storage";
import { ApprovedEmailsManager } from "./approved-emails";
import { set } from "react-hook-form";
import { get } from "http";

interface PendingResource {
  id: string;
  category: string;
  name: string;
  data: any;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface Feedback {
  id: string;
  category: string;
  resourceName: string;
  resourceData: any;
  feedback: string;
  submittedAt: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  userEmail: string;
}

interface NewField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("add");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [pendingResources, setPendingResources] = useState<PendingResource[]>(
    []
  );
  const [selectedResource, setSelectedResource] =
    useState<PendingResource | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const [currentData, setCurrentData] = useState<any>({});
  const [optionsInput, setOptionsInput] = useState("");
  const [customCategories, setCustomCategories] = useState<
    CategoryDefinition[]
  >([]);
  const [categoryCounts, setCategoryCounts] = useState<{
    [key: string]: number;
  }>({});
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    label: "",
    description: "",
    icon: "Folder",
    color: "bg-gray-50 text-gray-600 border-gray-200",
  });
  const [adminSettings, setAdminSettings] = useState({
    adminEmail: "",
    emailNotificationsEnabled: true,
    web3FormsKey: "f543a6ac-166d-4f10-9d05-2cfc23c25a16",
  });
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [categoryFields, setCategoryFields] = useState<any[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<NewField>({
    name: "",
    label: "",
    type: "",
    required: false,
    options: [],
  });
  const [editingCategory, setEditingCategory] =
    useState<CategoryDefinition | null>(null);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [editCategoryData, setEditCategoryData] = useState({
    name: "",
    label: "",
    description: "",
    icon: "Folder",
    color: "bg-gray-50 text-gray-600 border-gray-200",
  });
  const [editCategoryFields, setEditCategoryFields] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryDefinition[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [resourceName, setResourceName] = useState("");
  const [editResourceNameId, setEditResourceNameId] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(true);

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

          setCategories(
            data.data.map((cat: any) => ({
              value: cat.id,
              label: cat.label,
              count: cat._count?.Resource || 0,
            }))
          );
        } else {
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    getCategories();
  }, []);

  // if (loading) return <p>Loading...</p>;

  useEffect(() => {
    // Check if user is authenticated
    const isAdmin = localStorage.getItem("isAdmin");
    const loginTime = localStorage.getItem("adminLoginTime");

    if (isAdmin === "true" && loginTime) {
      // Check if session is still valid (24 hours)
      const now = Date.now();
      const loginTimestamp = Number.parseInt(loginTime);
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours

      if (now - loginTimestamp < sessionDuration) {
        setIsAuthenticated(true);
        fetchPendingResources();
        fetchFeedback();
        fetchCustomCategories();
        loadCategoryCounts();
        fetchUsers();
      } else {
        handleLogout();
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminSettings();
    }
  }, [isAuthenticated]);

  const loadCategoryCounts = async () => {
    const counts: { [key: string]: number } = {};

    // Default categories
    const defaultCategories = [
      "camps",
      "schools",
      "medical-supplies",
      "hamaspik-programs",
      "contracted-programs",
      "perks",
    ];

    for (const category of defaultCategories) {
      try {
        // const response = await fetch(`/api/resources?category=${category}`);
        const response = {
          true: true,
          json: async () => ({ success: true, data: [] }),
        }; // Mock response for testing
        if (response) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            // counts[category] = result.data.length;
            counts[category] = 2;
          }
        }
      } catch (error) {
        counts[category] = 0;
      }
    }

    // Custom categories
    for (const category of customCategories) {
      try {
        // const response = await fetch(
        //   `/api/resources?category=${category.name}`
        // );
        const response = {
          true: true,
          json: async () => ({ success: true, data: [] }),
        };
        if (response) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            // counts[category.name] = result.data.length;
            counts[category.name] = 2;
          }
        }
      } catch (error) {
        counts[category.name] = 0;
      }
    }

    setCategoryCounts(counts);
  };

  useEffect(() => {
    if (customCategories.length > 0) {
      loadCategoryCounts();
    }
  }, [customCategories]);

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

        setCategories(
          data.data.map((cat: any) => ({
            value: cat.id,
            label: cat.label,
            count: cat._count?.Resource || 0,
          }))
        );
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingResources = async () => {
    try {
      const response = await fetch("/api/pending-resources");
      const result = await response.json();

      if (result.success) {
        setPendingResources(result.data);
      } else {
      }
    } catch (error) {}
  };

  const fetchFeedback = async () => {
    try {
      const response = await fetch("/api/submit-feedback");

      if (!response.ok) {
        return;
      }

      const result = await response.json();

      if (result.success) {
        setFeedbackList(result.data || []);
      } else {
        setFeedbackList([]);
      }
    } catch (error) {
      setFeedbackList([]);
    }
  };

  const fetchCustomCategories = async () => {
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

        setCustomCategories(transformedCategories);
      }
    } catch (error) {}
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminLoginTime");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    router.push("/login");
  };

  // const allCategories = [
  //   {
  //     id: "camps",
  //     name: "camps",
  //     label: "Camps",
  //     description: "Summer camps and recreational programs",
  //     icon: "Users",
  //     color: "bg-green-50 text-green-600 border-green-200",
  //     isDefault: true,
  //     fields: [
  //       { name: "campName", label: "Camp Name", type: "text", required: true },
  //       {
  //         name: "contactPerson",
  //         label: "Contact Person",
  //         type: "text",
  //         required: true,
  //       },
  //       { name: "phone", label: "Phone", type: "text", required: true },
  //       { name: "email", label: "Email", type: "email" },
  //       { name: "underAuspicesOf", label: "Under Auspices Of", type: "text" },
  //       {
  //         name: "gender",
  //         label: "Gender",
  //         type: "select",
  //         options: ["boys", "girls", "both", "mixed"],
  //       },
  //       { name: "ages", label: "Ages", type: "text" },
  //       { name: "description", label: "Description", type: "textarea" },
  //       { name: "location", label: "Location", type: "text" },
  //       { name: "integrated", label: "Integration Type", type: "text" },
  //       { name: "medicalNeeds", label: "Medical Needs", type: "text" },
  //       { name: "tuition", label: "Tuition", type: "text" },
  //       { name: "comments", label: "Comments", type: "textarea" },
  //     ],
  //   },
  //   {
  //     id: "schools",
  //     name: "schools",
  //     label: "Schools",
  //     description: "Educational institutions and schools",
  //     icon: "GraduationCap",
  //     color: "bg-blue-50 text-blue-600 border-blue-200",
  //     isDefault: true,
  //     fields: [
  //       { name: "name", label: "School Name", type: "text", required: true },
  //       { name: "location", label: "Location", type: "text", required: true },
  //       {
  //         name: "contactPerson",
  //         label: "Contact Person",
  //         type: "text",
  //         required: true,
  //       },
  //       { name: "phone", label: "Phone", type: "text", required: true },
  //       { name: "email", label: "Email", type: "email" },
  //       { name: "studentsServed", label: "Students Served", type: "textarea" },
  //     ],
  //   },
  //   {
  //     id: "medical-supplies",
  //     name: "medical-supplies",
  //     label: "Medical Supplies",
  //     description: "Medical supplies and equipment resources",
  //     icon: "Stethoscope",
  //     color: "bg-red-50 text-red-600 border-red-200",
  //     isDefault: true,
  //     fields: [
  //       {
  //         name: "resource",
  //         label: "Resource Name",
  //         type: "text",
  //         required: true,
  //       },
  //       {
  //         name: "contact",
  //         label: "Contact Info",
  //         type: "text",
  //         required: true,
  //       },
  //       { name: "email", label: "Email", type: "email" },
  //       { name: "notes", label: "Notes", type: "textarea" },
  //       { name: "moreItems", label: "Additional Items", type: "textarea" },
  //     ],
  //   },
  //   {
  //     id: "hamaspik-programs",
  //     name: "hamaspik-programs",
  //     label: "Hamaspik Programs",
  //     description: "Hamaspik organization programs and services",
  //     icon: "Heart",
  //     color: "bg-purple-50 text-purple-600 border-purple-200",
  //     isDefault: true,
  //     fields: [
  //       {
  //         name: "program",
  //         label: "Program Name",
  //         type: "text",
  //         required: true,
  //       },
  //       {
  //         name: "gender",
  //         label: "Gender",
  //         type: "select",
  //         options: ["Male", "Female", "Both"],
  //       },
  //       { name: "functioningLevel", label: "Functioning Level", type: "text" },
  //       { name: "location", label: "Location", type: "text" },
  //       { name: "daysOpen", label: "Days Open", type: "text" },
  //       { name: "contact", label: "Contact", type: "text" },
  //       { name: "runBy", label: "Run By", type: "text" },
  //     ],
  //   },
  //   {
  //     id: "contracted-programs",
  //     name: "contracted-programs",
  //     label: "Contracted Programs",
  //     description: "Active contracted programs and services",
  //     icon: "Building",
  //     color: "bg-orange-50 text-orange-600 border-orange-200",
  //     isDefault: true,
  //     fields: [
  //       { name: "name", label: "Program Name", type: "text", required: true },
  //       { name: "programType", label: "Program Type", type: "text" },
  //       { name: "location", label: "Location", type: "text" },
  //       { name: "phone", label: "Phone", type: "text" },
  //       { name: "email", label: "Email", type: "email" },
  //       {
  //         name: "gender",
  //         label: "Gender",
  //         type: "select",
  //         options: ["boys", "girls", "both"],
  //       },
  //       { name: "ages", label: "Ages", type: "text" },
  //       { name: "whoItsFor", label: "Who It's For", type: "textarea" },
  //       { name: "description", label: "Description", type: "textarea" },
  //       { name: "toSignUp", label: "How to Sign Up", type: "text" },
  //     ],
  //   },
  //   {
  //     id: "perks",
  //     name: "perks",
  //     label: "Perks",
  //     description: "Special perks and benefits available",
  //     icon: "Gift",
  //     color: "bg-pink-50 text-pink-600 border-pink-200",
  //     isDefault: true,
  //     fields: [
  //       { name: "title", label: "Perk Title", type: "text", required: true },
  //       {
  //         name: "description",
  //         label: "Description",
  //         type: "textarea",
  //         required: true,
  //       },
  //       { name: "details", label: "Details", type: "textarea" },
  //     ],
  //   },
  //   ...customCategories.map((cat) => ({
  //     ...cat,
  //     isDefault: false,
  //     icon: cat.icon || "Folder", // Ensure icon is always present
  //   })),
  // ];

  // const categories = [
  //   { value: "camps", label: "Camps" },
  //   { value: "schools", label: "Schools" },
  //   { value: "medical-supplies", label: "Medical Supplies" },
  //   { value: "hamaspik-programs", label: "Hamaspik Programs" },
  //   { value: "contracted-programs", label: "Contracted Programs" },
  //   { value: "perks", label: "Perks" },
  //   ...customCategories.map((cat) => ({ value: cat.id, label: cat.label })),
  // ];

  // const getFormFields = (category: string) => {
  //   // Check if it's a custom category
  //   const customCategory = customCategories.find((cat) => cat.id === category);
  //   if (customCategory) {
  //     return customCategory.fields;
  //   }

  //   switch (category) {
  //     case "camps":
  //       return [
  //         {
  //           name: "campName",
  //           label: "Camp Name",
  //           type: "text",
  //           required: true,
  //         },
  //         {
  //           name: "contactPerson",
  //           label: "Contact Person",
  //           type: "text",
  //           required: true,
  //         },
  //         { name: "phone", label: "Phone", type: "text", required: true },
  //         { name: "email", label: "Email", type: "email" },
  //         { name: "underAuspicesOf", label: "Under Auspices Of", type: "text" },
  //         {
  //           name: "gender",
  //           label: "Gender",
  //           type: "select",
  //           options: ["boys", "girls", "both", "mixed"],
  //         },
  //         { name: "ages", label: "Ages", type: "text" },
  //         { name: "description", label: "Description", type: "textarea" },
  //         { name: "location", label: "Location", type: "text" },
  //         { name: "integrated", label: "Integration Type", type: "text" },
  //         { name: "medicalNeeds", label: "Medical Needs", type: "text" },
  //         { name: "tuition", label: "Tuition", type: "text" },
  //         { name: "comments", label: "Comments", type: "textarea" },
  //       ];
  //     case "schools":
  //       return [
  //         { name: "name", label: "School Name", type: "text", required: true },
  //         { name: "location", label: "Location", type: "text", required: true },
  //         {
  //           name: "contactPerson",
  //           label: "Contact Person",
  //           type: "text",
  //           required: true,
  //         },
  //         { name: "phone", label: "Phone", type: "text", required: true },
  //         { name: "email", label: "Email", type: "email" },
  //         {
  //           name: "studentsServed",
  //           label: "Students Served",
  //           type: "textarea",
  //         },
  //       ];
  //     case "medical-supplies":
  //       return [
  //         {
  //           name: "resource",
  //           label: "Resource Name",
  //           type: "text",
  //           required: true,
  //         },
  //         {
  //           name: "contact",
  //           label: "Contact Info",
  //           type: "text",
  //           required: true,
  //         },
  //         { name: "email", label: "Email", type: "email" },
  //         { name: "notes", label: "Notes", type: "textarea" },
  //         { name: "moreItems", label: "Additional Items", type: "textarea" },
  //       ];
  //     case "hamaspik-programs":
  //       return [
  //         {
  //           name: "program",
  //           label: "Program Name",
  //           type: "text",
  //           required: true,
  //         },
  //         {
  //           name: "gender",
  //           label: "Gender",
  //           type: "select",
  //           options: ["Male", "Female", "Both"],
  //         },
  //         {
  //           name: "functioningLevel",
  //           label: "Functioning Level",
  //           type: "text",
  //         },
  //         { name: "location", label: "Location", type: "text" },
  //         { name: "daysOpen", label: "Days Open", type: "text" },
  //         { name: "contact", label: "Contact", type: "text" },
  //         { name: "runBy", label: "Run By", type: "text" },
  //       ];
  //     case "contracted-programs":
  //       return [
  //         { name: "name", label: "Program Name", type: "text", required: true },
  //         { name: "programType", label: "Program Type", type: "text" },
  //         { name: "location", label: "Location", type: "text" },
  //         { name: "phone", label: "Phone", type: "text" },
  //         { name: "email", label: "Email", type: "email" },
  //         {
  //           name: "gender",
  //           label: "Gender",
  //           type: "select",
  //           options: ["boys", "girls", "both"],
  //         },
  //         { name: "ages", label: "Ages", type: "text" },
  //         { name: "whoItsFor", label: "Who It's For", type: "textarea" },
  //         { name: "description", label: "Description", type: "textarea" },
  //         { name: "toSignUp", label: "How to Sign Up", type: "text" },
  //       ];
  //     case "perks":
  //       return [
  //         { name: "title", label: "Perk Title", type: "text", required: true },
  //         {
  //           name: "description",
  //           label: "Description",
  //           type: "textarea",
  //           required: true,
  //         },
  //         { name: "details", label: "Details", type: "textarea" },
  //       ];
  //     default:
  //       return [];
  //   }
  // };

  const getFormFields = (id: string) => {
    const selectedCategory = allCategories.find((cat) => cat.id === id);
    if (!selectedCategory) return [];
    return selectedCategory.fields.map((field) => ({
      id: field.id || "",
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options ?? [],
    }));
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (name: string, value: string, id: string) => {
    setEditFormData((prev: any) => {
      const updatedFields = (prev.ResourceField || []).map((field: any) => {
        if (field.fieldId === id) {
          return {
            ...field,
            name, // If you want to update name as well
            value,
          };
        }
        return field;
      });

      return {
        ...prev,
        ResourceField: updatedFields,
      };
    });
  };

  const forceRefreshAllData = async () => {
    // Refresh custom categories
    await fetchCustomCategories();

    // Refresh category counts
    await loadCategoryCounts();

    // Refresh current category data if one is selected
    if (selectedCategory) {
      await refreshData(selectedCategory);
    }

    toast({
      title: "Data Refreshed",
      description: "All data has been refreshed from the latest storage.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = formFields.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) => !formData[field.name]
    );

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields: ${missingFields
          .map((f) => f.label)
          .join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (!resourceName) {
      toast({
        title: "Missing Resource Name",
        description: "Please enter a name for the resource.",
        variant: "destructive",
      });
      return;
    }

    // Convert formData to array of { name, id, value }
    const payload = formFields.map((field) => ({
      name: field.name,
      id: field.id || "", // Make sure each field has an id; fallback to "" if not
      value: formData[field.name] || "",
    }));

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add",
          category: selectedCategory,
          resourceName,
          data: payload,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Resource Added Successfully!",
          description: result.message,
        });

        // Clear form
        setFormData({});
        setSelectedCategory("");
        setResourceName("");

        // Force refresh all data immediately
        await forceRefreshAllData();

        // Small delay to ensure data is synced, then refresh again
        setTimeout(async () => {
          await forceRefreshAllData();
        }, 500);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: string, item: any, index: number) => {
    setEditingItem({ ...item, index, category });
    setEditFormData({ ...item });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formatData = {
      categoryId: editingItem.category,
      resourceId: editFormData.id,
      fields: editFormData.ResourceField?.map((f: any) => ({
        name: f.name,
        id: f.fieldId || "",
        value: f.value || "",
      })),
    };

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          category: editingItem.category,
          index: editingItem.index,
          data: formatData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Resource Updated Successfully!",
          description: result.message,
        });

        setIsEditDialogOpen(false);
        setEditingItem(null);
        setEditFormData({});
        await getCategories();

        // Force immediate data refresh with multiple attempts

        // Refresh the data for the current category immediately

        await refreshData(editingItem.category);

        // Update category counts
        await loadCategoryCounts();

        // Force refresh all data
        await forceRefreshAllData();

        // Trigger storage event for cross-tab sync
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("refreshData"));
        }

        // Additional refresh after a short delay to ensure persistence
        setTimeout(async () => {
          await refreshData(editingItem.category);
          await loadCategoryCounts();
        }, 1000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (category: string, index: number, item: any) => {
    if (
      confirm(`Are you sure you want to delete"? This action cannot be undone.`)
    ) {
      try {
        const response = await fetch("/api/resources", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete",
            category: item.id,
            index,
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast({
            title: "Resource Deleted",
            description: result.message,
          });

          // Refresh the data for the current category
          await refreshData(category);
          await loadCategoryCounts();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete resource. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const openReviewDialog = (resource: PendingResource) => {
    setSelectedResource(resource);
    setIsReviewDialogOpen(true);
    setAdminNotes("");
  };

  const getItemDisplayName = (item: any, category: string) => {
    // Check if it's a custom category
    const customCategory = customCategories.find((cat) => cat.id === category);

    if (customCategory) {
      // Use the first field as the display name
      const firstField = customCategory.fields[0];
      return item.name || "Unknown";
    }

    switch (category) {
      case "camps":
        return item.campName;
      case "schools":
        return item.name;
      case "medical-supplies":
        return item.resource;
      case "hamaspik-programs":
        return item.program;
      case "contracted-programs":
        return item.name;
      case "perks":
        return item.title;
      default:
        return "Unknown";
    }
  };

  const getResourceDisplayName = (resource: PendingResource) => {
    return getItemDisplayName(resource.data, resource.category);
  };

  const fetchCurrentData = async (category: string) => {
    try {
      const response = await fetch(`/api/resources?category=${category}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
    } catch (error) {}
    return [];
  };

  const refreshData = async (category: string) => {
    try {
      // Add cache buster to ensure fresh data
      const response = await fetch(
        `/api/resources?category=${category}&_t=${Date.now()}`
      );
      const result = await response.json();

      if (result.success) {
        setCurrentData((prev) => ({ ...prev, [category]: result.data }));
        return result.data;
      } else {
      }
    } catch (error) {}
    return [];
  };

  useEffect(() => {
    if (selectedCategory) {
      refreshData(selectedCategory);
    }
  }, [selectedCategory]);

  const getCurrentCategoryData = (category: string) => {
    return currentData[category] || [];
  };

  const loadAdminSettings = () => {
    try {
      const settings = getSettings();
      setAdminSettings({
        adminEmail: settings.adminEmail || "",
        emailNotificationsEnabled: settings.emailNotifications ?? true,
        web3FormsKey: settings.web3FormsKey || "",
      });
    } catch (error) {}
  };

  const handleSaveSettings = async () => {
    try {
      saveSettings({
        adminEmail: adminSettings.adminEmail,
        emailNotifications: adminSettings.emailNotificationsEnabled,
        web3FormsKey: adminSettings.web3FormsKey,
      });

      toast({
        title: "Settings Saved",
        description:
          "Your notification settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestEmail = async () => {
    if (!adminSettings.adminEmail) {
      toast({
        title: "Email Required",
        description: "Please set an admin email address first.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingEmail(true);

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "test",
          email: adminSettings.adminEmail,
          data: {},
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Test Email Sent!",
          description: `Check your inbox at ${adminSettings.adminEmail}`,
        });
      } else {
        toast({
          title: "Email Failed",
          description:
            "Failed to send test email. Please check your email address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const recoverData = async () => {
    try {
      // Try to restore perks data specifically
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "recover",
          category: "perks",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Data Recovered",
          description: "Perks data has been restored successfully.",
        });

        // Refresh all data
        await loadCategoryCounts();
        if (selectedCategory) {
          await refreshData(selectedCategory);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Recovery Failed",
        description: "Failed to recover data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddField = () => {
    if (!newField.name || !newField.label) {
      toast({
        title: "Missing Information",
        description: "Please provide both field name and label.",
        variant: "destructive",
      });
      return;
    }

    const field = {
      ...newField,
      options: newField.type === "SELECT" ? newField.options : undefined,
    };

    setCategoryFields((prev) => [...prev, field]);
    setNewField({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    });
    setIsAddingField(false);

    toast({
      title: "Field Added",
      description: `Field "${newField.label}" has been added to the category.`,
    });
  };

  const handleRemoveField = (index: number) => {
    setCategoryFields((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "Field Removed",
      description: "Field has been removed from the category.",
    });
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setEditCategoryData({
      name: category.name,
      label: category.label,
      description: category.description,
      icon: category.icon,
      color: category.color,
    });

    if (Array.isArray(category.fields)) {
      setEditCategoryFields([...category.fields]); // Ensure we copy the fields array
    } else {
      setEditCategoryFields([]);
    }
    setIsEditCategoryDialogOpen(true);
  };

  const handleCreateCategory = async () => {
    // Validate essential fields
    if (!newCategoryData.name || !newCategoryData.label) {
      toast({
        title: "Missing Information",
        description: "Please provide both category name and label.",
        variant: "destructive",
      });
      return;
    }

    const requestBody = {
      action: "create",
      name: newCategoryData.name,
      label: newCategoryData.label,
      description: newCategoryData.description,
      icon: newCategoryData.icon || "Folder",
      color:
        newCategoryData.color || "bg-gray-50 text-gray-600 border-gray-200",
      categoryFields: categoryFields.map((field) => ({
        name: field.name,
        label: field.label,
        type: field.type,
        options: field.options || [],
        required: field.required || false,
      })),
    };

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Category Created",
          description: `${newCategoryData.label} category has been created successfully.`,
        });

        // Reset form
        setNewCategoryData({
          name: "",
          label: "",
          description: "",
          icon: "Folder",
          color: "bg-gray-50 text-gray-600 border-gray-200",
        });
        setCategoryFields([]);

        await getCategories();

        // Refresh data
        await fetchCustomCategories?.();
        await loadCategoryCounts?.();
      } else {
        throw new Error(result.message || "Unknown error occurred");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create category: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          categoryId: editingCategory.id,
          categoryData: {
            ...editCategoryData,
            fields: editCategoryFields,
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Category Updated",
          description: "Category has been updated successfully.",
        });

        setAllCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingCategory.id
              ? {
                  ...cat,
                  ...editCategoryData,
                  fields: editCategoryFields,
                }
              : cat
          )
        );

        setIsEditCategoryDialogOpen(false);
        setEditingCategory(null);
        await fetchCustomCategories();
        await loadCategoryCounts();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleDeleteCustomCategory = async (categoryId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete",
            categoryId,
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast({
            title: "Category Deleted",
            description: "Category has been deleted successfully.",
          });
          await getCategories();
          await fetchCustomCategories();
          await loadCategoryCounts();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete category. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleApproveResource = async (resourceId: string) => {
    try {
      const response = await fetch("/api/pending-resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          resourceId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Resource Approved",
          description:
            "The resource has been approved and added to the system.",
        });

        setPendingResources((prev) => prev.filter((r) => r.id !== resourceId));
        await loadCategoryCounts();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectResource = async (resourceId: string) => {
    try {
      const response = await fetch("/api/pending-resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reject",
          resourceId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Resource Rejected",
          description: "The resource has been rejected.",
        });

        setPendingResources((prev) => prev.filter((r) => r.id !== resourceId));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkFeedbackReviewed = async (feedbackId: string) => {
    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_status",
          feedbackId,
          status: "REVIEWED",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Feedback Updated",
          description: "Feedback has been marked as reviewed.",
        });

        setFeedbackList((prev) =>
          prev.map((f) =>
            f.id === feedbackId ? { ...f, status: "REVIEWED" } : f
          )
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feedback status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkFeedbackResolved = async (feedbackId: string) => {
    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_status",
          feedbackId,
          status: "RESOLVED",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Feedback Resolved",
          description: "Feedback has been marked as resolved.",
        });

        setFeedbackList((prev) =>
          prev.map((f) =>
            f.id === feedbackId ? { ...f, status: "RESOLVED" } : f
          )
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feedback status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      } else {
      }
    } catch (error) {}
  };

  const handleResourceAdminNote = async (
    e: React.FormEvent<HTMLFormElement>,
    selectedResource: PendingResource
  ) => {
    e.preventDefault();

    // Approve the resource and add admin notes
    try {
      const response = await fetch("/api/pending-resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "approve",
          resourceId: selectedResource.id,
          adminNotes,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast({
          title: "Resource Approved",
          description:
            "The resource has been approved and added to the system.",
        });
        setPendingResources((prev) =>
          prev.filter((r) => r.id !== selectedResource.id)
        );
        await loadCategoryCounts();
        setIsReviewDialogOpen(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUserStatusUpdate = async (
    userId: string,
    newStatus: "active" | "inactive"
  ) => {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "User Status Updated",
          description: `User status has been updated to ${newStatus}.`,
        });
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, isActive: newStatus === "active" ? true : false }
              : user
          )
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "User Deleted",
          description: "The user has been deleted successfully.",
        });
        setUsers((prev) => prev.filter((user) => user.id !== userId));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditResourceName = async (item: any) => {
    if (!resourceName) {
      return;
    }

    const formatData = {
      resourceId: item.id,
      resourceName,
    };

    try {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateResourceName",
          data: formatData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Resource Updated Successfully!",
          description: result.message,
        });

        console.log(result, "result in handleEditResourceName");

        await getCategories();

        // Force refresh all data
        await forceRefreshAllData();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update resource. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  const formFields = selectedCategory ? getFormFields(selectedCategory) : [];

  const editFormFields = editingItem ? getFormFields(editingItem.category) : [];

  const pendingCount = pendingResources.filter(
    (r) => r.status === "pending"
  ).length;
  const getEditFieldValue = (name: string) => {
    return (
      editFormData?.ResourceField?.find((f) => f.name === name)?.value || ""
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">Manage community resources</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="add">Add Resources</TabsTrigger>
            <TabsTrigger value="manage">Manage Resources</TabsTrigger>
            <TabsTrigger value="categories">Manage Categories</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approvals
              {pendingCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 p-0 text-xs"
                >
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="feedback" className="relative">
              User Feedback
              {feedbackList.filter((f) => f.status === "PENDING").length >
                0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {feedbackList.filter((f) => f.status === "PENDING").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="approved-emails">Approved Emails</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Existing tabs content... */}

          {/* Add this new tab content */}
          <TabsContent value="approved-emails">
            <ApprovedEmailsManager />
          </TabsContent>

          {/* Rest of the tabs content... */}

          {/* Add Resources Tab */}
          <TabsContent value="add">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Resource
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            {category.label} (
                            {categoryCounts[category.value] || 0} items)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resourceName">
                      Resource Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="resourceName"
                      type="text"
                      onChange={(e) => setResourceName(e.target.value)}
                      required
                    />
                  </div>
                  {selectedCategory && formFields.length > 0 && (
                    <>
                      {formFields.map((field) => (
                        <div key={field.name} className="space-y-2">
                          <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>

                          {field.type === "TEXTAREA" ? (
                            <Textarea
                              id={field.name}
                              value={formData[field.name] || ""}
                              onChange={(e) =>
                                handleInputChange(field.name, e.target.value)
                              }
                              required={field.required}
                              rows={3}
                            />
                          ) : field.type === "SELECT" ? (
                            <Select
                              value={formData[field.name] || ""}
                              onValueChange={(value) =>
                                handleInputChange(field.name, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={`Select ${field.label.toLowerCase()}`}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
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
                            />
                          )}
                        </div>
                      ))}

                      <Button type="submit" className="w-full">
                        <Save className="w-4 h-4 mr-2" />
                        Add Resource
                      </Button>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Resources Tab */}
          <TabsContent value="manage">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="manage-category">
                  Select Category to Manage
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label} {""} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Manage{" "}
                      {
                        categories.find((c) => c.value === selectedCategory)
                          ?.label
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getCurrentCategoryData(selectedCategory).map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              {editResourceNameId === item.id ? (
                                <div className="flex items-center space-x-3 mr-3">
                                  <Input
                                    value={resourceName}
                                    onChange={(e) =>
                                      setResourceName(e.target.value)
                                    }
                                    className="flex-1 w-1/2"
                                    placeholder="Resource Name"
                                    required
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleEditResourceName(item);
                                      setEditResourceNameId(null);
                                    }}
                                  >
                                    Save
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-3">
                                  <h3 className="font-medium text-gray-900">
                                    {getItemDisplayName(item, selectedCategory)}
                                  </h3>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditResourceNameId(item.id);
                                      setResourceName(
                                        getItemDisplayName(
                                          item,
                                          selectedCategory
                                        )
                                      );
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                              {/* <p className="text-sm text-gray-500">
                                {selectedCategory === "camps" &&
                                  `Contact: ${item.contactPerson}`}
                                {selectedCategory === "schools" &&
                                  `Location: ${item.location}`}
                                {selectedCategory === "medical-supplies" &&
                                  `Contact: ${item.contact}`}
                                {selectedCategory === "hamaspik-programs" &&
                                  `Location: ${item.location}`}
                                {selectedCategory === "contracted-programs" &&
                                  `Type: ${item.programType}`}
                                {selectedCategory === "perks" &&
                                  item.description}
                              </p> */}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEdit(selectedCategory, item, index)
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleDelete(selectedCategory, index, item)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Manage Categories Tab */}
          <TabsContent value="categories">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Category Name</Label>
                        <Input
                          id="categoryName"
                          value={newCategoryData.name}
                          onChange={(e) =>
                            setNewCategoryData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., therapy-services"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryLabel">Display Label</Label>
                        <Input
                          id="categoryLabel"
                          value={newCategoryData.label}
                          onChange={(e) =>
                            setNewCategoryData((prev) => ({
                              ...prev,
                              label: e.target.value,
                            }))
                          }
                          placeholder="e.g., Therapy Services"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Textarea
                        id="categoryDescription"
                        value={newCategoryData.description}
                        onChange={(e) =>
                          setNewCategoryData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Brief description of this category"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryIcon">Category Icon</Label>
                      <IconSelector
                        selectedIcon={newCategoryData.icon}
                        onIconSelect={(iconName) =>
                          setNewCategoryData((prev) => ({
                            ...prev,
                            icon: iconName,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryColor">Category Color</Label>
                      <Select
                        value={newField.type}
                        onValueChange={(value) =>
                          setNewCategoryData((prev) => ({
                            ...prev,
                            color: `bg-${value}-50 text-${value}-600 border-${value}-200`,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fields Management */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Category Fields</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingField(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Field
                        </Button>
                      </div>

                      {/* Default Fields */}
                      <div className="space-y-2">
                        <div className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">Title</span>
                              <span className="text-sm text-gray-500 ml-2">
                                (Text, Required)
                              </span>
                            </div>
                            <Badge variant="outline">Default</Badge>
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">Description</span>
                              <span className="text-sm text-gray-500 ml-2">
                                (Textarea, Required)
                              </span>
                            </div>
                            <Badge variant="outline">Default</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {categoryFields.map((field, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <span className="font-medium">{field.label}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({field.type},{" "}
                              {field.required ? "Required" : "Optional"})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveField(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      {/* Add Field Form */}
                      {isAddingField && (
                        <div className="p-4 border rounded-lg bg-blue-50">
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="fieldName">Field Name</Label>
                                <Input
                                  id="fieldName"
                                  value={newField.name}
                                  onChange={(e) =>
                                    setNewField((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g., contactPhone"
                                />
                              </div>
                              <div>
                                <Label htmlFor="fieldLabel">Field Label</Label>
                                <Input
                                  id="fieldLabel"
                                  value={newField.label}
                                  onChange={(e) =>
                                    setNewField((prev) => ({
                                      ...prev,
                                      label: e.target.value,
                                    }))
                                  }
                                  placeholder="e.g., Contact Phone"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="fieldType">Field Type</Label>
                                <Select
                                  value={newField.type}
                                  onValueChange={(value) =>
                                    setNewField((prev) => ({
                                      ...prev,
                                      type: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="TEXT">Text</SelectItem>
                                    <SelectItem value="EMAIL">Email</SelectItem>
                                    <SelectItem value="PHONE">Phone</SelectItem>
                                    <SelectItem value="TEXTAREA">
                                      Textarea
                                    </SelectItem>
                                    <SelectItem value="SELECT">
                                      Select
                                    </SelectItem>
                                    <SelectItem value="NUMBER">
                                      Number
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2 pt-6">
                                <input
                                  type="checkbox"
                                  id="fieldRequired"
                                  checked={newField.required}
                                  onChange={(e) =>
                                    setNewField((prev) => ({
                                      ...prev,
                                      required: e.target.checked,
                                    }))
                                  }
                                />
                                <Label htmlFor="fieldRequired">Required</Label>
                              </div>
                            </div>
                            {newField.type === "SELECT" && (
                              <div>
                                <Label htmlFor="fieldOptions">
                                  Options (comma-separated)
                                </Label>
                                <Input
                                  id="fieldOptions"
                                  value={optionsInput}
                                  onChange={(e) => {
                                    const input = e.target.value;
                                    setOptionsInput(input); // allow comma input
                                    setNewField((prev) => ({
                                      ...prev,
                                      options: input
                                        .split(",")
                                        .map((opt) => opt.trim())
                                        .filter((opt) => opt),
                                    }));
                                  }}
                                  placeholder="Option 1, Option 2, Option 3"
                                />
                              </div>
                            )}
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleAddField}
                              >
                                Add Field
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsAddingField(false);
                                  setNewField({
                                    name: "",
                                    label: "",
                                    type: "text",
                                    required: false,
                                    options: [],
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button onClick={handleCreateCategory}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Category
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {category.label}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <Badge variant="secondary">
                              {categoryCounts[category.name] || 0} items
                            </Badge>
                            <Badge variant="outline">
                              {category.fields?.length || 0} fields
                            </Badge>
                            {category.isDefault && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!category.isDefault && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleDeleteCustomCategory(category.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pending Approvals Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Pending Resource Approvals
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingCount} pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingResources.length > 0 ? (
                  <div className="space-y-4">
                    {pendingResources
                      .filter((resource) => resource.status === "pending")
                      .map((resource) => (
                        <div
                          key={resource.id}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">
                                {resource.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2">
                                Category:{" "}
                                {
                                  categories.find(
                                    (c) => c.value === resource.category
                                  )?.label
                                }
                              </p>
                              <p className="text-xs text-gray-400">
                                Submitted:{" "}
                                {new Date(
                                  resource.submittedAt
                                ).toLocaleDateString()}
                              </p>
                              <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                                <strong>Resource Details:</strong>
                                <pre className="mt-1 whitespace-pre-wrap">
                                  {JSON.stringify(resource.data, null, 2)}
                                </pre>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleApproveResource(resource.id)
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                  handleRejectResource(resource.id)
                                }
                              >
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReviewDialog(resource)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No pending approvals at this time.</p>
                  </div>
                )}
                {/* Debug section - remove this after testing */}
                {/* {process.env.NODE_ENV === "development" && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-bold">
                      Debug: Pending Resources ({pendingResources.length})
                    </h3>
                    <pre className="text-xs mt-2">
                      {JSON.stringify(pendingResources, null, 2)}
                    </pre>
                    <Button
                      onClick={fetchPendingResources}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Refresh Pending Resources
                    </Button>
                  </div>
                )} */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  User Feedback
                  {feedbackList.filter((f) => f.status === "PENDING").length >
                    0 && (
                    <Badge variant="secondary" className="ml-2">
                      {
                        feedbackList.filter((f) => f.status === "PENDING")
                          .length
                      }{" "}
                      new
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackList.length > 0 ? (
                  <div className="space-y-4">
                    {feedbackList.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900">
                                {feedback.resourceName}
                              </h3>
                              <Badge
                                variant={
                                  feedback.status === "PENDING"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {feedback.status}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                User: {feedback.userEmail || "Anonymous User"}
                              </p>
                              <p className="text-sm text-gray-500 mb-2">
                                Category:{" "}
                                {
                                  categories.find(
                                    (c) => c.value === feedback.category
                                  )?.label
                                }
                              </p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded text-sm mb-3">
                              <strong>Feedback:</strong>
                              <p className="mt-1">{feedback.feedback}</p>
                            </div>
                            <p className="text-xs text-gray-400">
                              Submitted:{" "}
                              {new Date(
                                feedback.submittedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {feedback.status === "PENDING" && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    handleMarkFeedbackReviewed(feedback.id)
                                  }
                                >
                                  Mark Reviewed
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleMarkFeedbackResolved(feedback.id)
                                  }
                                >
                                  Mark Resolved
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No feedback submitted yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Manage Users
                  <Badge variant="secondary" className="ml-2">
                    {users.length} total users
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {user.email}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">
                            Created:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                          {user.lastLogin && (
                            <p className="text-sm text-gray-500">
                              Last login:{" "}
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </p>
                          )}
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUserStatusUpdate(
                              user.id,
                              user.isActive ? "inactive" : "active"
                            )
                          }
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            handleDeleteUser(user.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No users found.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simplified Settings Tab */}
          <TabsContent value="settings">
            <Card className="max-w-lg mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email Address</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={adminSettings.adminEmail}
                      onChange={(e) =>
                        setAdminSettings((prev) => ({
                          ...prev,
                          adminEmail: e.target.value,
                        }))
                      }
                      placeholder="admin@example.com"
                    />
                    <p className="text-sm text-gray-500">
                      This email will receive notifications for:
                    </p>
                    <ul className="text-sm text-gray-500 list-disc list-inside ml-4 space-y-1">
                      <li>New resources submitted by users</li>
                      <li>User feedback and suggestions</li>
                      <li>Resource updates and modifications</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={handleSaveSettings} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Email Settings
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleTestEmail}
                      disabled={!adminSettings.adminEmail || isTestingEmail}
                    >
                      {isTestingEmail ? "Sending..." : "Test Email"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog For Manage resource*/}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Edit{" "}
                {editingItem &&
                  getItemDisplayName(editingItem, editingItem.category)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            {editingItem && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editFormFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={`edit-${field.name}`}>
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>

                    {field.type === "TEXTAREA" ? (
                      <Textarea
                        id={`edit-${field.name}`}
                        defaultValue={getEditFieldValue(field.name)}
                        onChange={(e) =>
                          handleEditInputChange(
                            field.name,
                            e.target.value,
                            field.id
                          )
                        }
                        required={field.required}
                        rows={3}
                      />
                    ) : field.type === "SELECT" ? (
                      <Select
                        defaultValue={getEditFieldValue(field.name)}
                        onValueChange={(value) =>
                          handleEditInputChange(field.name, value, field.id)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select ${field.label.toLowerCase()}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={`edit-${field.name}`}
                        type={field.type}
                        defaultValue={getEditFieldValue(field.name)}
                        onChange={(e) =>
                          handleEditInputChange(
                            field.name,
                            e.target.value,
                            field.id
                          )
                        }
                        required={field.required}
                      />
                    )}
                  </div>
                ))}

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Resource</DialogTitle>
              <Button
                variant="ghost"
                onClick={() => setIsReviewDialogOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogHeader>
            {selectedResource && (
              <form
                onSubmit={(e) => handleResourceAdminNote(e, selectedResource)}
                className="space-y-4"
              >
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900">
                    {getResourceDisplayName(selectedResource)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Category:{" "}
                    {
                      categories.find(
                        (c) => c.value === selectedResource.category
                      )?.label
                    }
                  </p>
                  <p className="text-xs text-gray-400">
                    Submitted:{" "}
                    {new Date(
                      selectedResource.submittedAt
                    ).toLocaleDateString()}
                  </p>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <strong>Resource Details:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {JSON.stringify(selectedResource.data, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes or feedback here..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsReviewDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Approve</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog
          open={isEditCategoryDialogOpen}
          onOpenChange={setIsEditCategoryDialogOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <Button
                variant="ghost"
                onClick={() => setIsEditCategoryDialogOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogHeader>
            {editingCategory && (
              <form onSubmit={handleUpdateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editCategoryName">Category Name</Label>
                  <Input
                    id="editCategoryName"
                    value={editCategoryData.name}
                    onChange={(e) =>
                      setEditCategoryData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., therapy-services"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategoryLabel">Display Label</Label>
                  <Input
                    id="editCategoryLabel"
                    value={editCategoryData.label}
                    onChange={(e) =>
                      setEditCategoryData((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    placeholder="e.g., Therapy Services"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCategoryDescription">Description</Label>
                  <Textarea
                    id="editCategoryDescription"
                    value={editCategoryData.description}
                    onChange={(e) =>
                      setEditCategoryData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of this category"
                    rows={2}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Category Fields</Label>
                  </div>
                  {editCategoryFields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{field.label}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({field.type},{" "}
                          {field.required ? "Required" : "Optional"})
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditCategoryFields((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                          toast({
                            title: "Field Removed",
                            description:
                              "Field has been removed from the category.",
                          });
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditCategoryDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
