import { deleteFile, deleteSolidDataset, getContainedResourceUrlAll, getSolidDataset, SolidDataset, WithResourceInfo } from "@inrupt/solid-client";

type DeleteOptions = Parameters<typeof deleteSolidDataset>[1];
export async function deleteRecursively(dataset: SolidDataset & WithResourceInfo, options: DeleteOptions) {
  const containedResourceUrls = getContainedResourceUrlAll(dataset);
  const containedDatasets = await Promise.all(containedResourceUrls.map(async resourceUrl => {
    try {
      return await getSolidDataset(resourceUrl, options);
    } catch(e) {
      // The Resource might not have been a SolidDataset;
      // we can delete it directly:
      await deleteFile(resourceUrl, options);
      return null;
    }
  }));
  await Promise.all(containedDatasets.map(async containedDataset => {
    if (containedDataset === null) {
      return;
    }
    return await deleteRecursively(containedDataset, options);
  }));
  return await deleteSolidDataset(dataset, options);
}
