import { asUrl, getSourceUrl, getThingAll, setThing, Thing, ThingPersisted, WithResourceInfo } from "@inrupt/solid-client";
import { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadedCachedDataset } from "../hooks/dataset";
import { ThingAdder } from "./ThingAdder";
import { ThingViewer } from "./ThingViewer";
import { LoggedIn } from "./LoggedIn";

interface Props {
  dataset: LoadedCachedDataset;
}

export const DatasetViewer: FC<Props> = (props) => {
  const [thingToRestore, setThingToRestore] = useState<ThingPersisted>();
  const things = getThingAll(props.dataset.data).sort(getThingSorter(props.dataset.data));

  useEffect(() => {
    if (!thingToRestore) {
      return;
    }

    const updatedDataset = setThing(props.dataset.data, thingToRestore);
    props.dataset.save(updatedDataset).then(() => {
      setThingToRestore(undefined);
    });
  }, [thingToRestore]);

  const onUpdateThing = (changedThing: ThingPersisted) => {
    // The restoration needs to be triggered after the updated SolidDataset has been passed to
    // DatasetViewer, otherwise solid-client will think this is just a local change that it can undo:
    const undo = () => { setThingToRestore(changedThing) };
    // FIXME:
    // solid-client at the time of writing has a bug that results in it trying to recreate all Quads
    // when adding a Thing to a different SolidDatase than the one it was initially fetched from.
    // This breaks when it includes blank nodes. In lieu of that being fixed in solid-client,
    // I've disabled undo for Things containing blank nodes, relying on an undocumented API in
    // solid-client to do so.
    // In other words, once it's fixed, revert the commit that introduced this comment:
    const containsBlankNodes = (thing: ThingPersisted): boolean => {
      return Array.from(thing).findIndex((quad) => quad.object.termType === "BlankNode") !== -1;
    };
    const undoButton = !containsBlankNodes(changedThing)
      ? <button onClick={e => {e.preventDefault(); undo();}} className="underline hover:no-underline focus:no-underline">Undo.</button>
      : null;

    toast(
      <>
        Saved. {undoButton}
      </>,
      { type: "info" },
    );
  };

  if (things.length === 0) {
    return (
      <div className="space-y-10 pb-10">
        <div className="rounded bg-yellow-200 p-5">
          This Resource is empty.
        </div>
        <LoggedIn>
          <ThingAdder dataset={props.dataset} onUpdate={onUpdateThing}/>
        </LoggedIn>
      </div>
    );
  }


  return (
    <>
      <div className="space-y-10 pb-10">
        {things.map(thing => (
          <div key={asUrl(thing as ThingPersisted)}>
            <ThingViewer dataset={props.dataset} thing={thing as ThingPersisted} onUpdate={onUpdateThing}/>
          </div>
        ))}
        <LoggedIn>
          <ThingAdder dataset={props.dataset} onUpdate={onUpdateThing}/>
        </LoggedIn>
      </div>
    </>
  );
};

function getThingSorter(resource: WithResourceInfo) {
  const resourceUrl = getSourceUrl(resource);
  return (a: Thing, b: Thing) => {
    const aUrl = asUrl(a, resourceUrl);
    const aUrlObj = new URL(aUrl);
    aUrlObj.hash = "";
    const bUrl = asUrl(b, resourceUrl);
    const bUrlObj = new URL(bUrl);
    bUrlObj.hash = "";
    if (aUrlObj.href === resourceUrl && bUrlObj.href !== resourceUrl) {
      return -1;
    }
    if (aUrlObj.href !== resourceUrl && bUrlObj.href === resourceUrl) {
      return 1;
    }
    if(aUrl.indexOf("#") === -1 && bUrl.indexOf("#") !== -1) {
      return -1;
    }
    if(aUrl.indexOf("#") !== -1 && bUrl.indexOf("#") === -1) {
      return 1;
    }
    return aUrl.localeCompare(bUrl);
  };
}
