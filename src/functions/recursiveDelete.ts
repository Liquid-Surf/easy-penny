import {
  deleteFile,
  deleteSolidDataset,
  getContainedResourceUrlAll,
  getSolidDataset,
  getSourceUrl,
  isContainer,
  SolidDataset,
  UrlString,
  WithResourceInfo,
} from "@inrupt/solid-client";

type DeleteOptions = Parameters<typeof deleteSolidDataset>[1];
type OwnOptions = {
  onPrepareDelete?: (url: UrlString) => void;
};
export async function deleteRecursively(
  dataset: SolidDataset & WithResourceInfo,
  options: DeleteOptions,
  ownOptions: OwnOptions = {}
) {
  const containedResourceUrls = getContainedChildrenUrls(dataset);
  const containedDatasets = await Promise.all(
    containedResourceUrls.map(async (resourceUrl) => {
      try {
        return await getSolidDataset(resourceUrl, options);
      } catch (e) {
        // The Resource might not have been a SolidDataset;
        // we can delete it directly:
        if (typeof ownOptions.onPrepareDelete === "function") {
          ownOptions.onPrepareDelete(resourceUrl);
        }
        await deleteFile(resourceUrl, options);
        return null;
      }
    }),
  );
  await Promise.all(
    containedDatasets.map(async (containedDataset) => {
      if (containedDataset === null) {
        return;
      }
      return await deleteRecursively(containedDataset, options, ownOptions);
    }),
  );
  if (typeof ownOptions.onPrepareDelete === "function") {
    ownOptions.onPrepareDelete(getSourceUrl(dataset));
  }
  return await deleteSolidDataset(dataset, options);
}

function getContainedChildrenUrls(
  container: SolidDataset & WithResourceInfo,
): UrlString[] {
  if (!isContainer(container)) {
    return [];
  }

  const containerUrl = getSourceUrl(container);
  function isValidChild(childUrl: UrlString | null): childUrl is UrlString {
    return childUrl !== null && childUrl.startsWith(containerUrl);
  }

  const childrenUrls = getContainedResourceUrlAll(container)
    .map((url) => {
      try {
        return new URL(url).href;
      } catch {
        return null;
      }
    })
    .filter(isValidChild);

  return childrenUrls;
}
