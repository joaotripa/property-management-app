"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { CategoryOption, TransactionType } from "@/types/transactions";

interface CategoryFilterProps {
  categories: CategoryOption[];
  selectedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
  disabled?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  disabled = false,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  const getDisplayText = () => {
    if (selectedCategoryIds.length === 0) return "All Categories";
    if (selectedCategoryIds.length === 1) {
      return categories.find((c) => c.id === selectedCategoryIds[0])?.name;
    }
    return `${selectedCategoryIds.length} categories selected`;
  };

  const incomeCategories = categories
    .filter((c) => c.type === TransactionType.INCOME)
    .sort((a, b) => a.name.localeCompare(b.name));

  const expenseCategories = categories
    .filter((c) => c.type === TransactionType.EXPENSE)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between bg-transparent hover:bg-transparent hover:text-foreground font-normal"
          disabled={disabled}
        >
          <span>{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Income</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {incomeCategories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                className="capitalize"
                checked={selectedCategoryIds.includes(category.id)}
                onCheckedChange={() => onToggleCategory(category.id)}
              >
                {category.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Expense</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {expenseCategories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                className="capitalize"
                checked={selectedCategoryIds.includes(category.id)}
                onCheckedChange={() => onToggleCategory(category.id)}
              >
                {category.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
