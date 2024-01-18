import {
  createThing,
  getSourceUrl,
  ThingPersisted,
} from "@inrupt/solid-client";
import React, { FC, FormEventHandler, useState } from "react";
import { MdAdd, MdCheck } from "react-icons/md";
import { LoadedCachedDataset } from "../../hooks/dataset";
import { useL10n } from "../../hooks/l10n";
import { useNavigationBlock } from "../../hooks/navigationBlock";
import { ClientLocalized } from "../ClientLocalized";
import { ThingViewer } from "../viewers/ThingViewer";

interface Props {
  dataset: LoadedCachedDataset;
  onUpdate: (previousThing: ThingPersisted) => void;
}

export const ThingAdder: FC<Props> = (props) => {
  const [thingUrl, setThingUrl] = useState(
    getSourceUrl(props.dataset.data) + `#${Date.now()}`,
  );
  const [phase, setPhase] = useState<
    "initial" | "setThingUrl" | "addPredicate"
  >("initial");
  const l10n = useL10n();

  useNavigationBlock(phase !== "initial");

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
        collapsed={false}
      />
    );
  }

  if (phase === "setThingUrl") {
    const onSubmit: FormEventHandler = (event) => {
      event.preventDefault();
      setPhase("addPredicate");
    };
    return (
      <div className="text-2xl rounded-xl bg-gray-700 text-white p-5 font-bold">
        <form onSubmit={onSubmit} className="flex space-x-2 items-center">
          <ClientLocalized id="thing-add-url-label">
            <label className="sr-only" htmlFor="newThingUrl">
              Thing URL:
            </label>
          </ClientLocalized>
          <ClientLocalized
            id="thing-add-url-input"
            attrs={{ placeholder: true, title: true }}
          >
            <input
              type="url"
              className="bg-white text-gray-900 text-lg flex-grow p-2 rounded focus:outline-none focus:ring-4 focus:ring-blue-500"
              placeholder="https://…"
              name="newThingUrl"
              id="newThingUrl"
              required={true}
              value={thingUrl}
              onChange={(e) => {
                e.preventDefault();
                setThingUrl(e.target.value);
              }}
              autoFocus={true}
            />
          </ClientLocalized>
          <button
            type="submit"
            aria-label={l10n.getString("thing-add-url-submit")}
            className="p-2 border-2 border-gray-700 focus:outline-none focus:border-white hover:border-white rounded hover:bg-white hover:text-gray-900"
          >
            <MdCheck />
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <button
        className="border-2 border-gray-200 border-dashed text-gray-500 hover:text-gray-900 focus:text-gray-900 hover:border-gray-900 focus:border-gray-900 focus:outline-none hover:border-solid focus:border-solid rounded p-2 flex items-center space-x-2 w-full"
        onClick={(e) => {
          e.preventDefault();
          setPhase("setThingUrl");
        }}
      >
        <MdAdd aria-hidden={true} />{" "}
        <ClientLocalized id="thing-add-button">
          <span>New Thing</span>
        </ClientLocalized>
      </button>
    </>
  );
};
