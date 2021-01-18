import { ThingPersisted } from "@inrupt/solid-client";
import { FC, lazy, useState, Suspense } from "react";
import { MdAdd } from "react-icons/md";
import { LoadedCachedDataset } from "../hooks/dataset";
import { PredicateForm } from "./data/PredicateForm";
import { ObjectAdder } from "./ObjectAdder";
import { PredicateUrl } from "./PredicateUrl";

interface Props {
  dataset: LoadedCachedDataset;
  thing: ThingPersisted;
  onUpdate: (updatedThing: ThingPersisted) => void;
}

export const PredicateAdder: FC<Props> = (props) => {
  const [predicate, setPredicate] = useState("");
  const [phase, setPhase] = useState<"initial" | "setPredicate" | "setObject">("initial");

  if (phase === "setObject") {
    const onSetObject = (updatedThing: ThingPersisted) => {
      setPhase("initial");
      props.onUpdate(updatedThing);
    };
    return (
      <div className="p-5">
        <PredicateUrl url={predicate}/>
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
        <PredicateForm onSubmit={(predicate) => {setPredicate(predicate); setPhase("setObject"); }}/>
      </div>
    );
  }

  return (
    <>
      <div className="p-5">
        <button
          className="border-2 border-coolGray-200 border-dashed text-coolGray-500 hover:text-coolGray-900 focus:text-coolGray-900 hover:border-coolGray-900 focus:border-coolGray-900 focus:outline-none hover:border-solid focus:border-solid rounded p-2 flex items-center space-x-2 w-full"
          onClick={e => {e.preventDefault(); setPhase("setPredicate")}}
        >
          <MdAdd/> New property
        </button>
      </div>
    </>
  );
};

interface ButtonProps {
  icon: JSX.Element;
  onClick: () => void;
};
const AddButton: FC<ButtonProps> = (props) => {
  return (
    <button
      className="flex items-center p-1 border-coolGray-200 text-coolGray-500 hover:text-coolGray-900 focus:text-coolGray-900 hover:border-coolGray-900 focus:border-coolGray-900 focus:outline-none border-dashed hover:border-solid focus:border-solid border-2 rounded"
      onClick={(e) => {e.preventDefault(); props.onClick();}}
    >
      <span className="px-1">{props.icon}</span>
      <span className="px-1">{props.children}</span>
    </button>
  );
};
