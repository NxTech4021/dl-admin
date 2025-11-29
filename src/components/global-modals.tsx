"use client";

import React from "react";
import { useModals } from "@/contexts/modal-context";
import SeasonCreateModal from "@/components/modal/season-create-modal";

export function GlobalModals() {
  const {
    isSeasonCreateOpen,
    closeSeasonCreate,
    isPlayerCreateOpen,
    closePlayerCreate,
    isMatchCreateOpen,
    closeMatchCreate,
  } = useModals();

  return (
    <>
      {/* Season Create Modal */}
      <SeasonCreateModal
        open={isSeasonCreateOpen}
        onOpenChange={closeSeasonCreate}
        leagueId=""
        categories={[]}
        onSeasonCreated={async () => {
          closeSeasonCreate();
        }}
      />

      {/* Player Create Modal - Placeholder */}
      {isPlayerCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Player</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Player creation modal coming soon.
            </p>
            <button
              onClick={closePlayerCreate}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Match Create Modal - Placeholder */}
      {isMatchCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create Match</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Match creation modal coming soon.
            </p>
            <button
              onClick={closeMatchCreate}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
