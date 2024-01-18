import { UrlString } from "@inrupt/solid-client";
import React, { FC, FormEventHandler, lazy, Suspense, useState } from "react";
import { MdCheck } from "react-icons/md";
import { VscLink } from "react-icons/vsc";
import { useL10n } from "../../hooks/l10n";
import { ClientLocalized } from "../ClientLocalized";

const NamespaceDatalist = lazy(() =>
  import("./NamespaceDatalist").then((module) => ({
    default: module.NamespaceDatalist,
  })),
);

interface Props {
  onSubmit: (predicate: UrlString) => void;
}

export const PredicateForm: FC<Props> = (props) => {
  const [newPredicate, setNewPredicate] = useState("");
  const l10n = useL10n();

  const onSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    props.onSubmit(newPredicate);
    setNewPredicate("");
  };
  return (
    <form onSubmit={onSubmit} className="flex space-x-2 items-center">
      <Suspense fallback={null}>
        <NamespaceDatalist id="knownPredicates" />
      </Suspense>
      <label className="text-gray-500 p-2 w-10" htmlFor="newPredicate">
        <VscLink aria-label={l10n.getString("predicate-add-url-label")} />
      </label>
      <ClientLocalized
        id="predicate-add-url-input"
        attrs={{ placeholder: true, title: true }}
      >
        <input
          type="url"
          className="flex-grow p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
          placeholder="https://…"
          name="newPredicate"
          id="newPredicate"
          required={true}
          list="knownPredicates"
          value={newPredicate}
          onChange={(e) => {
            e.preventDefault();
            setNewPredicate(e.target.value);
          }}
          autoFocus={true}
        />
      </ClientLocalized>
      <button
        type="submit"
        aria-label={l10n.getString("predicate-add-url-submit")}
        className="p-3 focus:outline-none focus:ring-2 focus:ring-gray-700 rounded"
      >
        <MdCheck />
      </button>
    </form>
  );
};
