import { ThingPersisted } from "@inrupt/solid-client";
import React, { FC, useState } from "react";
import { MdAdd } from "react-icons/md";
import { PredicateForm } from "../data/PredicateForm";
import { ObjectAdder } from "./ObjectAdder";
import { PredicateUrl } from "../viewers/PredicateUrl";
import { ClientLocalized } from "../ClientLocalized";
import { LoadedCachedDataset } from "../../hooks/dataset";
import { useNavigationBlock } from "../../hooks/navigationBlock";

interface Props {
  dataset: LoadedCachedDataset;
  thing: ThingPersisted;
  onUpdate: (previousThing: ThingPersisted) => void;
}

export const PredicateAdder: FC<Props> = (props) => {
  const [predicate, setPredicate] = useState("");
  const [phase, setPhase] = useState<"initial" | "setPredicate" | "setObject">(
    "initial",
  );

  useNavigationBlock(phase !== "initial" || predicate !== "");

  if (phase === "setObject") {
    const onSetObject = (previousThing: ThingPersisted) => {
      setPhase("initial");
      props.onUpdate(previousThing);
    };
    return (
      <div className="p-5">
        <PredicateUrl url={predicate} />
        <ObjectAdder
          dataset={props.dataset}
          thing={props.thing}
          predicate={predicate}
          onUpdate={onSetObject}
        />
      </div>
    );
  }

  if (phase === "setPredicate") {
    return (
      <div className="p-5">
        <PredicateForm
          onSubmit={(predicate) => {
            setPredicate(predicate);
            setPhase("setObject");
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="p-5">
        <button
          className="border-2 border-gray-200 border-dashed text-gray-500 hover:text-gray-900 focus:text-gray-900 hover:border-gray-900 focus:border-gray-900 focus:outline-none hover:border-solid focus:border-solid hover:bg-gray-100 rounded p-2 flex items-center space-x-2 w-full"
          onClick={(e) => {
            e.preventDefault();
            setPhase("setPredicate");
          }}
        >
          <MdAdd aria-hidden={true} />{" "}
          <ClientLocalized id="predicate-add-button">
            <span>New property</span>
          </ClientLocalized>
        </button>
      </div>
    </>
  );
};
