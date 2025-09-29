"use client"
import { Button } from "@/components/ui/button"
import type { TaskCategory } from "@/components/state/auth-context"

interface CategorySelectorProps {
  selectedCategory: TaskCategory
  onCategoryChange: (category: TaskCategory) => void
}

const categories: TaskCategory[] = ["Preliminary", "Ignite Propel", "Venture Quest", "Comprehensive"]

export function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "ghost"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            className={`rounded-full transition-all duration-200 ${
              selectedCategory === category
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  )
}
