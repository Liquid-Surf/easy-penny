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
      <div className="space-y-10 pb-10">
        {things.map(thing => (
          <div key={asUrl(thing as ThingPersisted)}>
            <ThingViewer dataset={props.dataset} thing={thing as ThingPersisted}/>
          </div>
        ))}
      </div>
    </>
  );
};