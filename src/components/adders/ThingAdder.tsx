import { createThing, getSourceUrl, ThingPersisted } from "@inrupt/solid-client";
import { FC, FormEventHandler, useState } from "react";
import { MdAdd, MdCheck } from "react-icons/md";
import { LoadedCachedDataset } from "../../hooks/dataset";
import { ThingViewer } from "../viewers/ThingViewer";

interface Props {
  dataset: LoadedCachedDataset;
  onUpdate: (previousThing: ThingPersisted) => void;
}

export const ThingAdder: FC<Props> = (props) => {
  const [thingUrl, setThingUrl] = useState(getSourceUrl(props.dataset.data) + `#${Date.now()}`);
  const [phase, setPhase] = useState<"initial" | "setThingUrl" | "addPredicate">("initial");

  if (phase === "addPredicate") {
    const onSetPredicate = (updatedThing: ThingPersisted) => {
      setThingUrl(getSourceUrl(props.dataset.data) + `#${Date.now()}`);
      setPhase("initial");
      props.onUpdate(updatedThing);
    };
    return (
      <ThingViewer
        dataset={props.dataset}
        thing={createThing({ url: thingUrl })}
        onUpdate={onSetPredicate}
      />
    );
  }

  if (phase === "setThingUrl") {
    const onSubmit: FormEventHandler = (event) => {
      event.preventDefault();
      setPhase("addPredicate");
    }
    return (
      <div className="text-2xl rounded-xl bg-coolGray-700 text-white p-5 font-bold">
        <form
          onSubmit={onSubmit}
          className="flex space-x-2 items-center"
        >
          <label className="sr-only" htmlFor="newThingUrl">Thing URL:</label>
          <input
            type="url"
            className="bg-white text-coolGray-900 text-lg flex-grow p-2 rounded focus:outline-none focus:ring-4 focus:ring-blue-500"
            placeholder="https://…"
            name="newThingUrl"
            id="newThingUrl"
            required={true}
            list="knownPredicates"
            value={thingUrl}
            onChange={e => {e.preventDefault(); setThingUrl(e.target.value);}}
            autoFocus={true}
          />
          <button type="submit" aria-label="Add" className="p-2 border-2 border-coolGray-700 focus:outline-none focus:border-white hover:border-white rounded hover:bg-white hover:text-coolGray-900"><MdCheck/></button>
        </form>
      </div>
    );
  }

  return (
    <>
      <button
        className="border-2 border-coolGray-200 border-dashed text-coolGray-500 hover:text-coolGray-900 focus:text-coolGray-900 hover:border-coolGray-900 focus:border-coolGray-900 focus:outline-none hover:border-solid focus:border-solid rounded p-2 flex items-center space-x-2 w-full"
        onClick={e => {e.preventDefault(); setPhase("setThingUrl")}}
      >
        <MdAdd aria-hidden={true}/> New Thing
      </button>
    </>
  );
};
