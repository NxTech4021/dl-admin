import React, { useState, lazy, Suspense, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { IconPlus, IconDownload, IconBrandCashapp, IconRefresh } from "@tabler/icons-react";
import { SponsorsDataTable } from "@/components/data-table/sponsors-data-table";
import { AnimatedContainer, AnimatedFilterBar } from "@/components/ui/animated-container";
import { SearchInput } from "@/components/ui/search-input";

const CreateSponsorModal = lazy(() => import("@/components/modal/sponsor-create-modal").then((mod) => ({ default: mod.CreateSponsorModal })));

export default function Page() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSponsorCreated = async () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <>
      <SiteHeader title="Sponsors" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          {/* Page Header */}
          <AnimatedContainer>
            <div className="px-4 lg:px-6 py-6 border-b border-border/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconBrandCashapp className="size-6 text-muted-foreground" />
                    <div>
                      <h1 className="text-2xl font-semibold">Sponsors</h1>
                      <p className="text-sm text-muted-foreground">
                        Manage sponsorship packages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <IconDownload className="mr-2 size-4" />
                      Export
                    </Button>
                    <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                      <IconPlus className="mr-2 size-4" />
                      Create Sponsor
                    </Button>
                  </div>
                </div>

                {/* Filter Bar */}
                <AnimatedFilterBar>
                  <div className="flex items-center gap-2 w-full">
                    <SearchInput
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search sponsors..."
                      className="w-[220px]"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Clear
                      </Button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      <Button variant="outline" size="sm" onClick={handleRefresh} className="cursor-pointer">
                        <IconRefresh className="mr-2 size-4" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </AnimatedFilterBar>
              </div>
            </div>
          </AnimatedContainer>

          {/* Data Table */}
          <AnimatedContainer delay={0.1}>
            <div className="flex-1 px-4 lg:px-6 pb-6">
              <SponsorsDataTable refreshTrigger={refreshTrigger} searchQuery={searchQuery} />
            </div>
          </AnimatedContainer>
        </div>
      </div>

      <Suspense fallback={null}>
        <CreateSponsorModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSponsorCreated={handleSponsorCreated}
        />
      </Suspense>
    </>
  );
}
