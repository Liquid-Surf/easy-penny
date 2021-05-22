import { useLocalization } from "@fluent/react";
import { AclDataset, addUrl, createAclFromFallbackAcl, createSolidDataset, createThing, getLinkedResourceUrlAll, getSolidDatasetWithAcl, getSourceUrl, hasAccessibleAcl, hasFallbackAcl, hasServerResourceInfo, saveAclFor, setThing, UrlString } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import Link from "next/link";
import { rdf, acl } from "rdf-namespaces";
import React, { FC, useState } from "react";
import { MdAdd } from "react-icons/md";
import { toast } from "react-toastify";
import { getExplorePath } from "../../functions/integrate";
import { isLoaded, LoadedCachedDataset, useDataset } from "../../hooks/dataset";
import { useSessionInfo } from "../../hooks/sessionInfo";
import { ClientLocalized } from "../ClientLocalized";
import { SectionHeading } from "../ui/headings";
import { Spinner } from "../ui/Spinner";

interface Props {
  dataset: LoadedCachedDataset;
}

export const LinkedResourcesViewer: FC<Props> = (props) => {
  const linkedResourceUrls = hasServerResourceInfo(props.dataset.data) ? getLinkedResourceUrlAll(props.dataset.data) : {};
  const acrUrl = linkedResourceUrls["http://www.w3.org/ns/solid/acp#accessControl"]?.[0] ?? null;
  const sessionInfo = useSessionInfo();
  const acrDataset = useDataset(acrUrl);
  const aclUrl = linkedResourceUrls.acl?.[0] ?? null;
  const aclDataset = useDataset(aclUrl);
  const { l10n } = useLocalization();
  const [isInitialisingAcl, setIsInitialisingAcl] = useState(false);

  const linkedResourceLabels: Record<UrlString, string> = {};

  // An ACL, even if linked, might not exist, so we try to fetch it before linking:
  // (Note that ESS lists an ACL as its own ACL, so ignore it in that case.)
  if (isLoaded(aclDataset) && aclUrl !== getSourceUrl(props.dataset.data)) {
    linkedResourceLabels[aclUrl] = l10n.getString("linked-resources-acl-label");
  }
  // The current user might not have access to the ACR, so we try to fetch it before linking:
  if (isLoaded(acrDataset)) {
    linkedResourceLabels[acrUrl] = l10n.getString("linked-resources-acr-label");
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

  let initialisationLinks = [];
  // If no ACL exists, but the server does point to one, it can be initialised:
  if (sessionInfo && !aclDataset.data && aclUrl && hasAccessibleAcl(props.dataset.data)) {
    if (isInitialisingAcl) {
      initialisationLinks.push(
        <div
          key={`acl-initialiser-${getSourceUrl(props.dataset.data)}`}
          className="w-full flex items-center space-x-2 p-5 rounded border-4 border-dashed border-coolGray-200 text-coolGray-500"
        >
          <Spinner/>
        </div>
      );
    } else {
      const initialiseAcl = async () => {
        setIsInitialisingAcl(true);
        let firstControl = createThing();
        firstControl = addUrl(firstControl, rdf.type, acl.Authorization);
        firstControl = addUrl(firstControl, acl.accessTo, getSourceUrl(props.dataset.data));
        firstControl = addUrl(firstControl, acl.mode, acl.Read);
        firstControl = addUrl(firstControl, acl.mode, acl.Write);
        firstControl = addUrl(firstControl, acl.mode, acl.Control);
        firstControl = addUrl(firstControl, acl.agent, sessionInfo!.webId);
        const resourceWithAcl = await getSolidDatasetWithAcl(getSourceUrl(props.dataset.data), { fetch: fetch });
        if (!hasAccessibleAcl(resourceWithAcl)) {
          setIsInitialisingAcl(false);
          toast(l10n.getString("linked-resources-acl-add-toast-error-not-allowed"), { type: "error" });
          return;
        }
        let newAcl = hasFallbackAcl(resourceWithAcl)
          ? createAclFromFallbackAcl(resourceWithAcl)
          : setThing(createSolidDataset(), firstControl);
        // The type assertion is necessary because solid-client's type parameter
        // is unnecessarily strict - will report upstream.
        try {
          await saveAclFor(resourceWithAcl, newAcl as AclDataset, { fetch: fetch });
          aclDataset.revalidate();
          toast(l10n.getString("linked-resources-acl-add-toast-success"), { type: "info" });
        } catch(e) {
          toast(l10n.getString("linked-resources-acl-add-toast-error-other"), { type: "error" });
        }
        setIsInitialisingAcl(false);
      }
      initialisationLinks.push((
        <button
          key={`acl-initialiser-${getSourceUrl(props.dataset.data)}`}
          className="w-full flex items-center space-x-2 p-5 rounded border-4 border-dashed border-coolGray-200 text-coolGray-500 focus:text-coolGray-900 focus:border-coolGray-900 hover:text-coolGray-900 hover:border-coolGray-900 hover:bg-coolGray-100 focus:outline-none"
          onClick={(e) => { e.preventDefault(); initialiseAcl() }}
        >
          <MdAdd aria-hidden="true" className="text-3xl"/>
          <ClientLocalized id="linked-resources-acl-add"><span>Add Access Control List</span></ClientLocalized>
        </button>
      ));
    }
  }

  if (Object.keys(linkedResourceLabels).length === 0 && initialisationLinks.length === 0) {
    return null;
  }

  return (
    <>
      <ClientLocalized id="linked-resources-heading">
        <SectionHeading>
          Linked Resources
        </SectionHeading>
      </ClientLocalized>
      <div className="space-y-10 pb-10">
        {resourceLinks}
        {initialisationLinks}
      </div>
    </>
  );
};