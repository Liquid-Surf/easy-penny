import { asUrl, getSourceUrl, getThingAll, setThing, Thing, ThingPersisted, WithResourceInfo } from "@inrupt/solid-client";
import { FC, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadedCachedDataset } from "../hooks/dataset";
import { ThingViewer } from "./ThingViewer";

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

    toast(
      <>
        Removed. <button onClick={e => {e.preventDefault(); undo();}}>Undo.</button>
      </>,
      { type: "info" },
    );
  };

  if (things.length === 0) {
    return (
      <div className="pb-10">
        <div className="rounded bg-yellow-200 p-5">
          This Resource is empty.
        </div>
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
