interface CategoryBadgeProps {
  category: string;
}

const categoryColors: Record<string, string> = {
  "Product Updates": "bg-blue-100 text-blue-700 border-blue-200",
  "Tax Tips": "bg-green-100 text-green-700 border-green-200",
  "Property Management": "bg-purple-100 text-purple-700 border-purple-200",
  "Investment Strategy": "bg-orange-100 text-orange-700 border-orange-200",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] || categoryColors.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${colorClass}`}
    >
      {category}
    </span>
  );
}
