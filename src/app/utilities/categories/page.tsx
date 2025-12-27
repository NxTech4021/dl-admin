import React, { useState, lazy, Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { IconPlus, IconTags } from "@tabler/icons-react";
import { CategoriesDataTable } from "@/components/data-table/categories-data-table";
import { AnimatedContainer } from "@/components/ui/animated-container";

const CategoryCreateModal = lazy(() => import("@/components/modal/category-create-modal"));

export default function Page() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCategoryCreated = async () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <SiteHeader title="Categories" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconTags}
            title="Categories"
            description="Manage tournament categories and their configurations"
            actions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                <IconPlus className="mr-2 size-4" />
                Create Category
              </Button>
            }
          />

          {/* Data Table */}
          <AnimatedContainer delay={0.1}>
            <div className="flex-1 pb-6">
              <CategoriesDataTable refreshTrigger={refreshTrigger} />
            </div>
          </AnimatedContainer>
        </div>
      </div>

      {/* Create Category Modal */}
      <Suspense fallback={null}>
        <CategoryCreateModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onCategoryCreated={handleCategoryCreated}
        />
      </Suspense>
    </>
  );
}
