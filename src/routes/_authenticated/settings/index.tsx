import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteHeader } from "@/components/site-header";
import { PageHeader } from "@/components/ui/page-header";
import { IconSettings, IconClock, IconBug } from "@tabler/icons-react";
import { InactivitySettingsCard } from "@/components/settings/inactivity-settings-card";
import { BugReportSettingsCard } from "@/components/settings/bug-report-settings-card";
import { AppControlsCard } from "@/components/settings/app-controls-card";
import {
  settingsContainerVariants,
  settingsCardVariants,
  defaultTransition,
} from "@/lib/animation-variants";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageHeader
            icon={IconSettings}
            title="Settings"
            description="Configure system-wide settings and preferences"
          />

          <div className="flex-1 px-4 lg:px-6 pb-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={settingsContainerVariants}
              className="grid gap-6"
            >
              <motion.section
                variants={settingsCardVariants}
                transition={defaultTransition}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <IconClock className="size-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Player Inactivity</h2>
                </div>
                <InactivitySettingsCard />
              </motion.section>

              <motion.section
                variants={settingsCardVariants}
                transition={defaultTransition}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <IconBug className="size-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Bug Reports</h2>
                </div>
                <BugReportSettingsCard />
              </motion.section>

              <motion.section
                variants={settingsCardVariants}
                transition={defaultTransition}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <IconBug className="size-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">App Controls</h2>
                </div>
                <AppControlsCard />
              </motion.section>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
