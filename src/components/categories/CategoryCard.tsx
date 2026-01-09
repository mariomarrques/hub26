import { Link } from "react-router-dom";
import { Category, mockProducts } from "@/data/mockData";
import { normalizeSearch } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const productCount = mockProducts.filter(
    (p) => normalizeSearch(p.category) === normalizeSearch(category.name)
  ).length;

  return (
    <Link
      to={`/categoria/${category.slug}`}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {category.name}
            </h3>
            <p className="text-sm text-white/70">
              {category.description}
            </p>
            <p className="text-xs text-white/50 mt-1">
              {productCount} {productCount === 1 ? "produto" : "produtos"}
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
