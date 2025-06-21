"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  GraduationCap,
  Stethoscope,
  Heart,
  Building,
  Gift,
  Search,
  Activity,
  AlertCircle,
  Archive,
  Award,
  Backpack,
  BadgeCheck,
  BadgeHelp,
  BadgeInfo,
  Bike,
  Book,
  BookOpen,
  Bookmark,
  Box,
  Briefcase,
  Bus,
  Calendar,
  Camera,
  Car,
  CheckCircle,
  Clipboard,
  Clock,
  Cloud,
  Code,
  Coffee,
  Compass,
  CreditCard,
  Database,
  Droplet,
  Edit,
  Eye,
  FileText,
  Film,
  Flag,
  Folder,
  Globe,
  Headphones,
  Home,
  Image,
  Inbox,
  Info,
  Key,
  Laptop,
  Layers,
  Layout,
  LifeBuoy,
  List,
  Lock,
  Mail,
  Map,
  MapPin,
  MessageCircle,
  MessageSquare,
  Mic,
  Monitor,
  Moon,
  Music,
  Package,
  Paperclip,
  Phone,
  PieChart,
  Play,
  Plus,
  Printer,
  Radio,
  Save,
  Send,
  Server,
  Settings,
  Share,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Speaker,
  Star,
  Sun,
  Tablet,
  Tag,
  Target,
  Terminal,
  ThumbsUp,
  PenToolIcon as Tool,
  Trash,
  Trophy,
  Truck,
  Tv,
  Umbrella,
  User,
  Video,
  Wallet,
  Watch,
  Wifi,
  Zap,
} from "lucide-react";
import { Header } from "./components/header";
import { FloatingAddButton } from "./components/floating-add-button";
import { useToast } from "@/hooks/use-toast";

const iconMap = {
  // Default icons
  Users,
  GraduationCap,
  Stethoscope,
  Heart,
  Building,
  Gift,

  // All available icons from IconSelector
  Activity: Activity,
  AlertCircle: AlertCircle,
  Archive: Archive,
  Award: Award,
  Backpack: Backpack,
  BadgeCheck: BadgeCheck,
  BadgeHelp: BadgeHelp,
  BadgeInfo: BadgeInfo,
  Bike: Bike,
  Book: Book,
  BookOpen: BookOpen,
  Bookmark: Bookmark,
  Box: Box,
  Briefcase: Briefcase,
  Building: Building,
  Bus: Bus,
  Calendar: Calendar,
  Camera: Camera,
  Car: Car,
  CheckCircle: CheckCircle,
  Clipboard: Clipboard,
  Clock: Clock,
  Cloud: Cloud,
  Code: Code,
  Coffee: Coffee,
  Compass: Compass,
  CreditCard: CreditCard,
  Database: Database,
  Droplet: Droplet,
  Edit: Edit,
  Eye: Eye,
  FileText: FileText,
  Film: Film,
  Flag: Flag,
  Folder: Folder,
  Gift: Gift,
  Globe: Globe,
  GraduationCap: GraduationCap,
  Headphones: Headphones,
  Heart: Heart,
  Home: Home,
  Image: Image,
  Inbox: Inbox,
  Info: Info,
  Key: Key,
  Laptop: Laptop,
  Layers: Layers,
  Layout: Layout,
  LifeBuoy: LifeBuoy,
  List: List,
  Lock: Lock,
  Mail: Mail,
  Map: Map,
  MapPin: MapPin,
  MessageCircle: MessageCircle,
  MessageSquare: MessageSquare,
  Mic: Mic,
  Monitor: Monitor,
  Moon: Moon,
  Music: Music,
  Package: Package,
  Paperclip: Paperclip,
  Phone: Phone,
  PieChart: PieChart,
  Play: Play,
  Plus: Plus,
  Printer: Printer,
  Radio: Radio,
  Save: Save,
  Search: Search,
  Send: Send,
  Server: Server,
  Settings: Settings,
  Share: Share,
  Shield: Shield,
  ShoppingBag: ShoppingBag,
  ShoppingCart: ShoppingCart,
  Smartphone: Smartphone,
  Speaker: Speaker,
  Star: Star,
  Stethoscope: Stethoscope,
  Sun: Sun,
  Tablet: Tablet,
  Tag: Tag,
  Target: Target,
  Terminal: Terminal,
  ThumbsUp: ThumbsUp,
  Tool: Tool,
  Trash: Trash,
  Trophy: Trophy,
  Truck: Truck,
  Tv: Tv,
  Umbrella: Umbrella,
  User: User,
  Users: Users,
  Video: Video,
  Wallet: Wallet,
  Watch: Watch,
  Wifi: Wifi,
  Zap: Zap,
};

interface Category {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

export default function MainResourcePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   checkAuthentication();
  //   if (isUserAuthenticated) {
  //     loadCategories();
  //   }
  // }, [isUserAuthenticated]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();

        if (data.success) {
          const transformedCategories: Category[] = data.data.map(
            (cat: any) => ({
              id: cat.id,
              name: cat.name,
              label: cat.label,
              description: cat.description,
              icon: cat.icon,
              color: cat.color,
              count: cat._count.Resource,
            })
          );

          setCategories(transformedCategories);
        } else {
          console.error("Failed:", data.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    getCategories();

    checkAuthentication();
    if (isUserAuthenticated) {
      getCategories();
    }
  }, [isUserAuthenticated]);

  const checkAuthentication = () => {
    const userAuth = localStorage.getItem("isUserAuthenticated");
    const userLoginTime = localStorage.getItem("userLoginTime");

    if (userAuth === "true" && userLoginTime) {
      const now = Date.now();
      const loginTimestamp = Number.parseInt(userLoginTime);
      const sessionDuration = 24 * 60 * 60 * 1000;

      if (now - loginTimestamp < sessionDuration) {
        setIsUserAuthenticated(true);
      } else {
        setIsUserAuthenticated(false);
        localStorage.removeItem("isUserAuthenticated");
        localStorage.removeItem("userLoginTime");
        localStorage.removeItem("currentUserId");
        localStorage.removeItem("currentUserEmail");
      }
    } else {
      setIsUserAuthenticated(false);
    }
    setIsLoading(false);
  };

  // const loadCategories = async () => {
  //   try {
  //     // Load default categories with counts
  //     const defaultCategories = [
  //       {
  //         id: "medical-supplies",
  //         name: "medical-supplies",
  //         label: "Medical Supplies & Resources",
  //         description: "Medical supplies and equipment resources",
  //         icon: "Stethoscope",
  //         color: "bg-red-50 text-red-600 border-red-200",
  //         count: 0,
  //       },
  //       {
  //         id: "camps",
  //         name: "camps",
  //         label: "Camps",
  //         description: "Summer camps and recreational programs",
  //         icon: "Users",
  //         color: "bg-green-50 text-green-600 border-green-200",
  //         count: 0,
  //       },
  //       {
  //         id: "schools",
  //         name: "schools",
  //         label: "Schools",
  //         description: "Educational institutions and schools",
  //         icon: "GraduationCap",
  //         color: "bg-blue-50 text-blue-600 border-blue-200",
  //         count: 0,
  //       },
  //       {
  //         id: "hamaspik-programs",
  //         name: "hamaspik-programs",
  //         label: "Hamaspik Programs",
  //         description: "Hamaspik organization programs and services",
  //         icon: "Heart",
  //         color: "bg-purple-50 text-purple-600 border-purple-200",
  //         count: 0,
  //       },
  //       {
  //         id: "contracted-programs",
  //         name: "contracted-programs",
  //         label: "Contracted Programs",
  //         description: "Active contracted programs and services",
  //         icon: "Building",
  //         color: "bg-orange-50 text-orange-600 border-orange-200",
  //         count: 0,
  //       },
  //       {
  //         id: "perks",
  //         name: "perks",
  //         label: "Perks",
  //         description: "Special perks and benefits available",
  //         icon: "Gift",
  //         color: "bg-pink-50 text-pink-600 border-pink-200",
  //         count: 0,
  //       },
  //     ];

  //     // Load resource counts for each category with better error handling
  //     for (const category of defaultCategories) {
  //       try {
  //         const response = await fetch(
  //           `/api/resources?category=${category.name}`
  //         );

  //         // Check if response is ok and content-type is JSON
  //         if (response.ok) {
  //           const contentType = response.headers.get("content-type");
  //           if (contentType && contentType.includes("application/json")) {
  //             const result = await response.json();
  //             if (result.success && Array.isArray(result.data)) {
  //               category.count = result.data.length;
  //             }
  //           } else {
  //             console.warn(
  //               `Non-JSON response for ${category.name}:`,
  //               await response.text()
  //             );
  //           }
  //         } else {
  //           console.warn(
  //             `Failed to load count for ${category.name}: ${response.status}`
  //           );
  //         }
  //       } catch (error) {
  //         console.error(`Error loading count for ${category.name}:`, error);
  //         // Continue with count = 0 for this category
  //       }
  //     }

  //     // Load custom categories with better error handling
  //     try {
  //       const response = await fetch("/api/categories?includeDefault=false");
  //       if (response.ok) {
  //         const contentType = response.headers.get("content-type");
  //         if (contentType && contentType.includes("application/json")) {
  //           const result = await response.json();
  //           console.log("Custom categories API response:", result);
  //           if (result.success && Array.isArray(result.data)) {
  //             const customCategories = result.data.map((cat: any) => ({
  //               ...cat,
  //               count: 0, // Will be loaded separately
  //             }));

  //             // Load counts for custom categories
  //             for (const category of customCategories) {
  //               try {
  //                 console.log(
  //                   `Loading count for custom category: ${category.name}`
  //                 );
  //                 const response = await fetch(
  //                   `/api/resources?category=${category.name}`
  //                 );
  //                 if (response.ok) {
  //                   const contentType = response.headers.get("content-type");
  //                   if (
  //                     contentType &&
  //                     contentType.includes("application/json")
  //                   ) {
  //                     const result = await response.json();
  //                     console.log(`Count result for ${category.name}:`, result);
  //                     if (result.success && Array.isArray(result.data)) {
  //                       category.count = result.data.length;
  //                     }
  //                   }
  //                 }
  //               } catch (error) {
  //                 console.error(
  //                   `Error loading count for ${category.name}:`,
  //                   error
  //                 );
  //               }
  //             }

  //             setCategories([...defaultCategories, ...customCategories]);
  //           } else {
  //             setCategories(defaultCategories);
  //           }
  //         } else {
  //           console.warn("Non-JSON response from categories API");
  //           setCategories(defaultCategories);
  //         }
  //       } else {
  //         console.warn(`Categories API failed: ${response.status}`);
  //         setCategories(defaultCategories);
  //       }
  //     } catch (error) {
  //       console.error("Error loading custom categories:", error);
  //       setCategories(defaultCategories);
  //     }
  //   } catch (error) {
  //     console.error("Error loading categories:", error);
  //     // Fallback to default categories with zero counts
  //     setCategories([
  //       {
  //         id: "medical-supplies",
  //         name: "medical-supplies",
  //         label: "Medical Supplies & Resources",
  //         description: "Medical supplies and equipment resources",
  //         icon: "Stethoscope",
  //         color: "bg-red-50 text-red-600 border-red-200",
  //         count: 0,
  //       },
  //       {
  //         id: "camps",
  //         name: "camps",
  //         label: "Camps",
  //         description: "Summer camps and recreational programs",
  //         icon: "Users",
  //         color: "bg-green-50 text-green-600 border-green-200",
  //         count: 0,
  //       },
  //       {
  //         id: "schools",
  //         name: "schools",
  //         label: "Schools",
  //         description: "Educational institutions and schools",
  //         icon: "GraduationCap",
  //         color: "bg-blue-50 text-blue-600 border-blue-200",
  //         count: 0,
  //       },
  //       {
  //         id: "hamaspik-programs",
  //         name: "hamaspik-programs",
  //         label: "Hamaspik Programs",
  //         description: "Hamaspik organization programs and services",
  //         icon: "Heart",
  //         color: "bg-purple-50 text-purple-600 border-purple-200",
  //         count: 0,
  //       },
  //       {
  //         id: "contracted-programs",
  //         name: "contracted-programs",
  //         label: "Contracted Programs",
  //         description: "Active contracted programs and services",
  //         icon: "Building",
  //         color: "bg-orange-50 text-orange-600 border-orange-200",
  //         count: 0,
  //       },
  //       {
  //         id: "perks",
  //         name: "perks",
  //         label: "Perks",
  //         description: "Special perks and benefits available",
  //         icon: "Gift",
  //         color: "bg-pink-50 text-pink-600 border-pink-200",
  //         count: 0,
  //       },
  //     ]);
  //   }
  // };

  const filteredCategories = categories.filter((category) =>
    category.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isUserAuthenticated) {
    // Redirect to auth page
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Resource Guide
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive guide to resources, programs, and services
          </p>
          <p className="text-gray-500 mb-8">
            Browse by category or search within each section to find what you
            need
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCategories.map((category) => {
            const IconComponent =
              iconMap[category.icon as keyof typeof iconMap] || Users;

            return (
              <Card
                key={category.id}
                className="h-full hover:shadow-lg transition-all duration-200 border"
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-3 mx-auto`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {category.label}
                  </CardTitle>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <p className="text-center text-sm font-medium text-gray-700">
                    {category.count} resources available
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    asChild
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    <Link href={`/${category.id}`}>View Resources</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <FloatingAddButton />

      {/* Footer Section */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-6">
            {/* Logo and Company Info */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <img
                src="/images/hamaspik-logo.png"
                alt="Hamaspik of Kings County Logo"
                className="w-16 h-16"
              />
              <div className="text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Hamaspik of Kings County
                </h3>
                <p className="text-sm text-gray-600 max-w-md">
                  Providing services, support, and hope to people going through
                  challenges so they can lead a fulfilling, productive life.
                </p>
              </div>
            </div>

            {/* Website Link */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <a
                href="https://hamaspikkings.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Visit Our Website
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <p className="text-xs text-gray-500">
                © 2024 Hamaspik of Kings County
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
