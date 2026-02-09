import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

if (!EMAIL || !PASSWORD) {
  throw new Error(
    "E2E_EMAIL and E2E_PASSWORD environment variables must be set"
  );
}

test.describe("Create League with Inline Sponsor", () => {
  test("fill league form with inline sponsor creation", async ({
    page,
  }) => {
    // ─── Step 1: Login ───
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "e2e/screenshots/01-login-page.png" });

    await page.fill("#email", EMAIL);
    await page.fill("#password", PASSWORD);
    await page.screenshot({ path: "e2e/screenshots/02-login-filled.png" });

    await page.click('button[type="submit"]');
    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.screenshot({ path: "e2e/screenshots/03-dashboard.png" });

    // ─── Step 2: Navigate to Leagues ───
    // Click on the league link in the sidebar
    await page.click('a[href="/league"]');
    await page.waitForURL("**/league");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "e2e/screenshots/04-league-page.png" });

    // ─── Step 3: Open Create League modal ───
    // Click the "Create League" button in the page header
    await page.click('button:has-text("Create League")');
    await page.waitForSelector('[role="dialog"]');
    await page.screenshot({ path: "e2e/screenshots/05-create-league-modal.png" });

    // ─── Step 4: Fill basic league info ───
    await page.fill("#leagueName", "E2E Test League");

    // Select Sport
    await page.click(
      '[role="dialog"] >> text=Select a sport'
    );
    await page.click('[role="option"]:has-text("Tennis")');

    // Select Location
    await page.click('[role="dialog"] >> text=Select location');
    await page.click('[role="option"]:has-text("Kuala Lumpur")');

    await page.screenshot({
      path: "e2e/screenshots/06-basic-info-filled.png",
    });

    // ─── Step 5: Enable sponsorship ───
    await page.click("#hasSponsor");
    // Wait for sponsor search field to appear
    await page.waitForSelector("#existingSponsor");
    await page.screenshot({
      path: "e2e/screenshots/07-sponsor-enabled.png",
    });

    // ─── Step 6: Click "Create New Sponsor" ───
    await page.click('button:has-text("Create New Sponsor")');
    // Wait for inline form to appear
    await page.waitForSelector('text=New Sponsor');
    await page.screenshot({
      path: "e2e/screenshots/08-inline-sponsor-form.png",
    });

    // ─── Step 7: Fill sponsor details ───
    // Sponsor Name
    await page.fill(
      '[role="dialog"] input[placeholder="e.g. Nike Malaysia"]',
      "E2E Test Sponsor"
    );

    // Package Tier - click the select trigger inside the inline form
    await page.click('[role="dialog"] >> text=Select tier');
    await page.click('[role="option"]:has-text("Gold")');

    // Contract Amount
    await page.fill(
      '[role="dialog"] input[placeholder="e.g. 10000.00"]',
      "5000"
    );

    await page.screenshot({
      path: "e2e/screenshots/09-sponsor-form-filled.png",
    });

    // ─── Step 8: Save Sponsor ───
    await page.click('button:has-text("Save Sponsor")');

    // Wait for the sponsor to be saved and auto-selected
    // The inline form should disappear and the search input should show the sponsor name
    await page.waitForSelector("#existingSponsor", { timeout: 10000 });
    // Verify the sponsor name is auto-filled
    const sponsorInput = page.locator("#existingSponsor");
    await expect(sponsorInput).toHaveValue("E2E Test Sponsor", {
      timeout: 10000,
    });
    await page.screenshot({
      path: "e2e/screenshots/10-sponsor-auto-selected.png",
    });

    // ─── Step 9: Add description ───
    await page.fill("#description", "League created via E2E test with inline sponsor creation.");
    await page.screenshot({
      path: "e2e/screenshots/11-form-complete.png",
    });

    // ─── Step 10: Create the league ───
    // NOTE: Uncomment the lines below to actually submit.
    // Kept commented to avoid creating test data on every run.
    //
    // await page.click('button:has-text("Create League")');
    // await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 10000 });
    // await page.screenshot({ path: "e2e/screenshots/12-league-created.png" });

    // Instead, verify the form is valid and the button is enabled
    const createButton = page.locator(
      '[role="dialog"] button:has-text("Create League")'
    );
    await expect(createButton).toBeEnabled();
    await page.screenshot({
      path: "e2e/screenshots/12-ready-to-submit.png",
    });
  });
});
