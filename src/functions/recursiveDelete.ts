import { deleteSolidDataset, getContainedResourceUrlAll, getSolidDataset, SolidDataset, WithResourceInfo } from "@inrupt/solid-client";

type DeleteOptions = Parameters<typeof deleteSolidDataset>[1];
export async function deleteRecursively(dataset: SolidDataset & WithResourceInfo, options: DeleteOptions) {
  const containedResourceUrls = getContainedResourceUrlAll(dataset);
  const containedDatasets = await Promise.all(containedResourceUrls.map(async resourceUrl => {
    return await getSolidDataset(resourceUrl, options);
  }));
  await Promise.all(containedDatasets.map(async containedDataset => {
    return await deleteRecursively(containedDataset, options);
  }));
  return await deleteSolidDataset(dataset, options);
}
