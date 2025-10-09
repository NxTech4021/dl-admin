"use client";

import { IconTag, IconEdit } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Category } from "./types";

interface CategoryCardProps {
  categories: Category[];
  onEditCategory?: (category: Category) => void; // <-- callback prop
}

export function CategoryCard({ categories, onEditCategory }: CategoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTag className="size-5" />
          Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length > 0 ? (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20">
                    <IconTag className="size-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {category.genderRestriction.toLowerCase()} • {category.matchFormat || 'Standard format'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {onEditCategory && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditCategory(category)}
                    >
                      <IconEdit className="size-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <IconTag className="size-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No categories yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
