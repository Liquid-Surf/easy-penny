import { asUrl, getSourceUrl, getThing, getThingAll, isContainer, removeThing, SolidDataset, Thing, ThingPersisted, UrlString, WithResourceInfo } from "@inrupt/solid-client";
import { FC } from "react";
import { MdRemove } from "react-icons/md";
import { PredicateViewer } from "./PredicateViewer";
import { LoadedCachedDataset } from "../hooks/dataset";
import { LoggedIn } from "./LoggedIn";

interface Props {
  dataset: LoadedCachedDataset;
  thing: ThingPersisted;
}

// Stand-in for what will hopefully be a solid-client function
function toRdfJsDataset(thing: Thing) {
  return thing;
}

export const ThingViewer: FC<Props> = (props) => {
  const rdfJsDataset = toRdfJsDataset(props.thing);
  const predicates = Array.from(new Set(Array.from(rdfJsDataset).map(quad => quad.predicate.value)));
  const viewers = predicates.map(predicate => (<PredicateViewer key={predicate} {...props} predicate={predicate}/>));

  // TODO: Move this to the DatasetViewer and add an Undo function
  const deleteThing = () => {
    const updatedDataset = removeThing(props.dataset.data, props.thing);
    props.dataset.save(updatedDataset);
  };

  const resourceUrl = getSourceUrl(props.dataset.data);
  const thingUrl = asUrl(props.thing);
  const resourcePartStart = isContainer(props.dataset.data)
    ? resourceUrl.substring(0, resourceUrl.lastIndexOf("/")).lastIndexOf("/")
    : resourceUrl.lastIndexOf("/");

  let noise = "";
  let signal = thingUrl;
  // If this Thing is in the same Container as the containing Resource,
  // only display a relative URL
  if (thingUrl.substring(0, resourceUrl.length) === resourceUrl) {
    const hashIndex = thingUrl.indexOf("#");
    if (hashIndex === resourceUrl.length) {
      const resourceName = resourceUrl.substring(resourcePartStart);
      const resourcePart = thingUrl.substring(resourcePartStart);
      noise = resourcePart.indexOf("#") > 0 ? resourceName : "";
      signal = resourcePart.indexOf("#") > 0 ? resourcePart.substring(resourcePart.indexOf("#")) : resourceName;
    } else {
      signal = thingUrl.substring(resourcePartStart + 1);
      if ((new URL(resourceUrl)).pathname === "/") {
        signal = thingUrl.substring((new URL(resourceUrl)).origin.length);
      }
    }
  }
  const title = <><span className="text-coolGray-400 font-normal">{noise}</span>{signal}</>;

  return (
    <div
      className="bg-coolGray-50 rounded-xl relative"
      id={encodeURIComponent(asUrl(props.thing))}
    >
      <h3 className="text-2xl p-2 rounded-t-xl bg-coolGray-700 text-white p-5 font-bold">
        {title}
      </h3>
      <div className="p-5">
        {viewers}
      </div>
      <LoggedIn>
        <button
          onClick={(e) => {e.preventDefault(); deleteThing();}}
          aria-label="Remove this Thing"
          className="object-right-top absolute -top-0.5 -right-0.5 bg-white hover:bg-red-700 hover:text-white p-1 -m-3 rounded-full border-coolGray-50 hover:border-red-700 border-4"
        >
          <MdRemove/>
        </button>
      </LoggedIn>
    </div>
  );
};