import { Localized, useLocalization } from "@fluent/react";
import { getLinkedResourceUrlAll, hasServerResourceInfo, UrlString } from "@inrupt/solid-client";
import Link from "next/link";
import React, { FC } from "react";
import { getExplorePath } from "../../functions/integrate";
import { isLoaded, LoadedCachedDataset, useDataset } from "../../hooks/dataset";
import { ClientLocalized } from "../ClientLocalized";
import { SectionHeading } from "../ui/headings";

interface Props {
  dataset: LoadedCachedDataset;
}

export const LinkedResourcesViewer: FC<Props> = (props) => {
  const linkedResourceUrls = hasServerResourceInfo(props.dataset.data) ? getLinkedResourceUrlAll(props.dataset.data) : {};
  const acrUrl = linkedResourceUrls["http://www.w3.org/ns/solid/acp#accessControl"]?.[0] ?? null;
  const acr = useDataset(acrUrl);
  const aclUrl = linkedResourceUrls.acl?.[0] ?? null;
  const acl = useDataset(aclUrl);
  const { l10n } = useLocalization();

  const linkedResourceLabels: Record<UrlString, string> = {};

  // An ACL, even if linked, might not exist, so we try to fetch it before linking:
  if (isLoaded(acl)) {
    linkedResourceLabels[aclUrl] = l10n.getString("linked-resources-acl-label");
  }
  // The current user might not have access to the ACR, so we try to fetch it before linking:
  if (isLoaded(acr)) {
    linkedResourceLabels[acrUrl] = l10n.getString("linked-resources-acr-label");
  }

  if (Object.keys(linkedResourceLabels).length === 0) {
    return null;
  }

  const resourceLinks = Object.keys(linkedResourceLabels).map(linkedResourceUrl => {
    return (
      <Link key={linkedResourceUrl} href={getExplorePath(linkedResourceUrl)}>
        <a className="bg-coolGray-700 text-white p-5 rounded hover:bg-coolGray-900 block focus:ring-2 focus:ring-offset-2 focus:ring-coolGray-700 focus:outline-none focus:ring-opacity-50">
          {linkedResourceLabels[linkedResourceUrl]}
        </a>
      </Link>
    );
  });

  return (
    <>
      <ClientLocalized id="linked-resources-heading">
        <SectionHeading>
          Linked Resources
        </SectionHeading>
      </ClientLocalized>
      <div className="space-y-10 pb-10">
        {resourceLinks}
      </div>
    </>
  );
};