import { UrlString } from "@inrupt/solid-client";
import { FC, FormEventHandler, lazy, Suspense, useState } from "react";
import { MdCheck } from "react-icons/md";
import { VscLink } from "react-icons/vsc";

const NamespaceDatalist = lazy(() => import("./NamespaceDatalist").then(module => ({ default: module.NamespaceDatalist })));

interface Props {
  onSubmit: (predicate: UrlString) => void;
};

export const PredicateForm: FC<Props> = (props) => {
  const [newPredicate, setNewPredicate] = useState("");
  const onSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    props.onSubmit(newPredicate);
    setNewPredicate("");
  };
  return (
    <form
      onSubmit={onSubmit}
      className="flex space-x-2 items-center"
    >
      <Suspense fallback={null}>
        <NamespaceDatalist id="knownPredicates"/>
      </Suspense>
      <label className="text-coolGray-500 p-2 w-10" htmlFor="newPredicate"><VscLink aria-label="Property URL"/></label>
      <input
        type="url"
        className="flex-grow p-2 rounded focus:outline-none focus:ring-2 focus:ring-coolGray-700"
        placeholder="https://…"
        name="newPredicate"
        id="newPredicate"
        required={true}
        list="knownPredicates"
        value={newPredicate}
        onChange={e => {e.preventDefault(); setNewPredicate(e.target.value);}}
      />
      <button type="submit" aria-label="Add" className="p-3 focus:outline-none focus:ring-2 focus:ring-coolGray-700 rounded"><MdCheck/></button>
    </form>
  );
};
