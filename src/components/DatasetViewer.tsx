import { asUrl, getSourceUrl, getThingAll, ThingPersisted } from "@inrupt/solid-client";
import { FC } from "react";
import { LoadedCachedDataset } from "../hooks/dataset";
import { ThingViewer } from "./ThingViewer";

interface Props {
  dataset: LoadedCachedDataset;
}

export const DatasetViewer: FC<Props> = (props) => {
  const things = getThingAll(props.dataset.data);

  return (
    <>
      {things.map(thing => (
        <div key={asUrl(thing as ThingPersisted)} className="py-2">
          <ThingViewer dataset={props.dataset} thing={thing as ThingPersisted}/>
        </div>
      ))}
    </>
  );
};