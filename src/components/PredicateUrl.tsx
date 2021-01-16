import { getUrlAll, UrlString } from "@inrupt/solid-client";
import { space } from "rdf-namespaces";
import { FC } from "react";
import Link from "next/link";
import { useProfile } from "../hooks/profile";

interface Props {
  url: UrlString;
};

export const PredicateUrl: FC<Props> = (props) => {
  const importantSeparatorIndex = Math.max(props.url.lastIndexOf("/"), props.url.lastIndexOf("#"));
  const noise = props.url.substring(0, importantSeparatorIndex + 1);
  const signal = props.url.substring(importantSeparatorIndex + 1);

  return (
    <>
      <abbr title={noise + signal}>
        {signal}
      </abbr>
    </>
  );
};