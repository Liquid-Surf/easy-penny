import { test, expect } from "@playwright/test";

test("browsing a Resource", async ({ page }) => {
  await page.goto("/container/malicious.ttl");

  const headings = await page.getByRole("heading");

  await expect(headings).toHaveCount(6);

  const pageTitle = await headings.nth(0);
  await expect(pageTitle).toHaveText("Penny");

  const locationBar = await headings.nth(1);
  await expect(locationBar).toContainText(
    "localhost:3000/container/malicious.ttl"
  );

  const thingsHeading = await headings.nth(2);
  await expect(thingsHeading).toHaveText("Things");

  const thing1 = await headings.nth(3);
  await expect(thing1).toHaveText("malicious.ttl");

  const thing2 = await headings.nth(4);
  await expect(thing2).toHaveText("foo:javascript:alert(1)");

  const dangerZoneHeading = await headings.nth(5);
  await expect(dangerZoneHeading).toHaveText("Danger Zone");

  const parentContainerLink = await page
    .getByRole("link", { name: "container" })
    .first();
  await parentContainerLink.click();

  const containedResourceLink = await page.getByRole("link", {
    name: "/malicious.ttl",
  });
  await expect(containedResourceLink).toBeVisible();
});
