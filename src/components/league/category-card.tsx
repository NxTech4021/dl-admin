"use client";

import { IconTag, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Category } from "./types";

interface CategoryCardProps {
  categories: Category[];
  onEditCategory?: (category: Category) => void; 
  onAddCategory?: () => void; // new prop
  onDeleteCategory?: (categoryId: string) => void;
}

export function CategoryCard({
  categories,
  onEditCategory,
  onAddCategory,
  onDeleteCategory,
}: CategoryCardProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <IconTag className="size-5" />
          Categories
        </CardTitle>
        {onAddCategory && (
          <Button 
          variant="outline"
          size="sm" 
          onClick={onAddCategory}>
            <IconPlus className="size-4 mr-2" />
            Create Category
          </Button>
        )}
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
                  {onDeleteCategory && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <IconTrash className="size-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this category? This will also affect any seasons using this category.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground"
                            onClick={() => onDeleteCategory(category.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
