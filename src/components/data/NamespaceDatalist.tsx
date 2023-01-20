import { UrlString } from "@inrupt/solid-client";
import * as knownPredicates from "rdf-namespaces";
import { FC } from "react";

interface Props {
  id: string;
}
const allKnownPredicates = Array.from(
  new Set(
    Object.values(knownPredicates)
      .map((namespace) => Object.values(namespace))
      .flat()
  )
);

export const NamespaceDatalist: FC<Props> = (props) => {
  return (
    <datalist id={props.id}>
      {allKnownPredicates.map((predicate) => (
        <option key={predicate + "_knownPredicate"} value={predicate} />
      ))}
    </datalist>
  );
};
