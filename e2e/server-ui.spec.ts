import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

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

test("deleting a Resource that pretends to contain another Resource", async ({
  page,
}) => {
  async function createMaliciousFile(): Promise<string> {
    const random = Math.random().toString();
    await writeFile(
      resolve(
        __dirname,
        `./community-solid-server/mock-pod/del/malicious${random}.ttl`
      ),
      `
      @prefix ldp: <http://www.w3.org/ns/ldp#>.
      @prefix me: <>.
      me:
          a ldp:BasicContainer, ldp:Container;
          ldp:contains <./dont-delete-me.ttl>.
      `
    );
    return `malicious${random}.ttl`;
  }
  const fileName = await createMaliciousFile();
  await page.goto(`/del/${fileName}`);

  const deleteButton = await page.getByRole("button", {
    name: "Delete resource",
  });
  await deleteButton.click();

  const confirmationInput = await page.getByRole("textbox");
  await confirmationInput.type(fileName);
  await confirmationInput.press("Enter");

  await page.goto("/del/dont-delete-me.ttl");

  // Finding this message means that the file did not get delete,
  // and hence that a previous recursive deletion vulnerability did not
  // reoccur:
  const emptyResourceNotice = await page.getByText("This resource is empty.");
  await expect(emptyResourceNotice).toBeVisible();
});
