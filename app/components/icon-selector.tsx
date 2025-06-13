"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"

// Define the props for the IconSelector component
interface IconSelectorProps {
  selectedIcon: string
  onIconSelect: (iconName: string) => void
  className?: string
}

// Create a list of available icons from Lucide
const availableIcons = [
  "Activity",
  "AlertCircle",
  "Archive",
  "Award",
  "Backpack",
  "BadgeCheck",
  "BadgeHelp",
  "BadgeInfo",
  "Bike",
  "Book",
  "BookOpen",
  "Bookmark",
  "Box",
  "Briefcase",
  "Building",
  "Bus",
  "Calendar",
  "Camera",
  "Car",
  "CheckCircle",
  "Clipboard",
  "Clock",
  "Cloud",
  "Code",
  "Coffee",
  "Compass",
  "CreditCard",
  "Database",
  "Droplet",
  "Edit",
  "Eye",
  "FileText",
  "Film",
  "Flag",
  "Folder",
  "Gift",
  "Globe",
  "GraduationCap",
  "Headphones",
  "Heart",
  "Home",
  "Image",
  "Inbox",
  "Info",
  "Key",
  "Laptop",
  "Layers",
  "Layout",
  "LifeBuoy",
  "Link",
  "List",
  "Lock",
  "Mail",
  "Map",
  "MapPin",
  "MessageCircle",
  "MessageSquare",
  "Mic",
  "Monitor",
  "Moon",
  "Music",
  "Package",
  "Paperclip",
  "Phone",
  "PieChart",
  "Play",
  "Plus",
  "Printer",
  "Radio",
  "Save",
  "Search",
  "Send",
  "Server",
  "Settings",
  "Share",
  "Shield",
  "ShoppingBag",
  "ShoppingCart",
  "Smartphone",
  "Speaker",
  "Star",
  "Stethoscope",
  "Sun",
  "Tablet",
  "Tag",
  "Target",
  "Terminal",
  "ThumbsUp",
  "Tool",
  "Trash",
  "Trophy",
  "Truck",
  "Tv",
  "Umbrella",
  "User",
  "Users",
  "Video",
  "Wallet",
  "Watch",
  "Wifi",
  "Zap",
]

export function IconSelector({ selectedIcon, onIconSelect, className }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  // Filter icons based on search term
  const filteredIcons = availableIcons.filter((icon) => icon.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get the selected icon component
  const SelectedIconComponent = selectedIcon ? (Icons as any)[selectedIcon] : Icons.Folder

  return (
    <div className={cn("relative", className)}>
      <div
        className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {SelectedIconComponent && <SelectedIconComponent className="w-5 h-5" />}
        <span>{selectedIcon || "Select an icon"}</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-80 max-h-96 bg-white border rounded-md shadow-lg mt-1 overflow-hidden flex flex-col">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search icons..."
              className="w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-y-auto p-2 grid grid-cols-4 gap-2">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((iconName) => {
                const IconComponent = (Icons as any)[iconName]
                return (
                  <div
                    key={iconName}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-2 rounded-md cursor-pointer hover:bg-gray-100",
                      selectedIcon === iconName && "bg-blue-50 border border-blue-200",
                    )}
                    onClick={() => {
                      onIconSelect(iconName)
                      setIsOpen(false)
                    }}
                  >
                    {IconComponent && <IconComponent className="w-6 h-6 mb-1" />}
                    <span className="text-xs text-center truncate w-full">{iconName}</span>
                    {selectedIcon === iconName && (
                      <div className="absolute top-1 right-1">
                        <Check className="w-3 h-3 text-blue-500" />
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="col-span-4 p-4 text-center text-gray-500">No icons found matching "{searchTerm}"</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
