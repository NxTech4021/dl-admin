import { createFileRoute, Link } from "@tanstack/react-router";
import { IconChevronLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { PlayerProfile } from "@/components/player-profile";

export const Route = createFileRoute("/_authenticated/players/$playerId/")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { playerId } = Route.useParams();

  return (
    <>
      <SiteHeader
        items={[
          { label: "Players", href: "/players" },
          { label: "Player Profile" },
        ]}
      />
      <div className="flex flex-1 flex-col p-8">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link to="/players">
              <IconChevronLeft className="mr-1 size-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Player Profile</h1>
            <p className="text-sm text-muted-foreground">
              View and manage player information
            </p>
          </div>
        </div>

        <div className="flex-1">
          <PlayerProfile playerId={playerId} />
        </div>
      </div>
    </>
  );
}
