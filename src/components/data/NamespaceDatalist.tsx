import * as knownPredicates from "rdf-namespaces";
import { FC } from "react";

interface Props {
  id: string;
};

export const NamespaceDatalist: FC<Props> = (props) => {
  const allKnownPredicates = Object.values(knownPredicates).map(namespace => Object.values(namespace)).flat();
  return (
    <datalist id={props.id}>
      {allKnownPredicates.map(predicate => <option key={predicate as unknown as string} value={predicate as unknown as string}/>)}
    </datalist>
  );
};
