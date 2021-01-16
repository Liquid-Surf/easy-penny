import { getUrlAll, UrlString } from "@inrupt/solid-client";
import { space } from "rdf-namespaces";
import { FC } from "react";
import Link from "next/link";
import { useProfile } from "../../hooks/profile";

interface Props {
  url: UrlString;
};

export const Url: FC<Props> = (props) => {
  const profile = useProfile();

  const matchingStorage = profile
    ? getUrlAll(profile.data, space.storage).find(storageUrl => props.url.substring(0, storageUrl.length) === storageUrl)
    : undefined;

  const shortUrl = matchingStorage
    ? props.url.substring(matchingStorage.length - 1)
    : props.url;

  if (matchingStorage) {
    return (
      <Link href={`/explore/${encodeURIComponent(props.url)}#${encodeURIComponent(props.url)}`}>
        <a>{shortUrl}</a>
      </Link>
    );
  }

  return (
    <a href={props.url} target="_blank" rel="noopener noreferrer">
      {props.url}
    </a>
  );
};
