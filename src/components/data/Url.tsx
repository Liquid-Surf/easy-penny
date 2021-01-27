import { getUrlAll, UrlString } from "@inrupt/solid-client";
import { space } from "rdf-namespaces";
import { FC } from "react";
import Link from "next/link";
import { useProfile } from "../../hooks/profile";
import { getExplorePath } from "../../functions/integrate";

interface Props {
  url: UrlString;
  /**
   * If this URL was found in a specific Resource, passing it here will make links to Resources
   * in the same origin open in Penny as well.
   */
  sourceUrl?: UrlString;
};

export const Url: FC<Props> = (props) => {
  const profile = useProfile();

  const browsableOrigins = profile
    ? getUrlAll(profile.data, space.storage)
    : [];

  if (props.sourceUrl) {
    browsableOrigins.push((new URL(props.sourceUrl)).origin + "/");
  }

  const matchingOrigin = browsableOrigins.find(storageUrl => props.url.substring(0, storageUrl.length) === storageUrl);

  const shortUrl = matchingOrigin
    ? props.url.substring(matchingOrigin.length - 1)
    : props.url;

  if (matchingOrigin) {
    return (
      <Link href={getExplorePath(props.url, encodeURIComponent(props.url))}>
        <a className="focus:underline focus:text-coolGray-700 focus:outline-none break-words">{shortUrl}</a>
      </Link>
    );
  }

  return (
    <a
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className="focus:underline focus:text-coolGray-700 focus:outline-none break-words"
        >
      {props.url}
    </a>
  );
};
