import {
  getSolidDataset,
  getThing,
  getUrl,
  UrlString,
} from "@inrupt/solid-client";
import { solid } from "rdf-namespaces";

export async function fetchIdp(webId: UrlString): Promise<string | null> {
  try {
    const webIdDoc = await getSolidDataset(webId);
    const webIdThing = getThing(webIdDoc, webId);
    if (!webIdThing) {
      return null;
    }
    return getUrl(webIdThing, solid.oidcIssuer);
  } catch (_e) {
    return null;
  }
}
