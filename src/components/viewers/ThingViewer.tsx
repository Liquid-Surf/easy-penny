import { asUrl, FetchError, getSourceUrl, getThing, getThingAll, isContainer, removeThing, SolidDataset, Thing, ThingPersisted, UrlString, WithResourceInfo } from "@inrupt/solid-client";
import { FC, MouseEventHandler } from "react";
import { VscTrash } from "react-icons/vsc";
import { PredicateViewer } from "./PredicateViewer";
import { LoadedCachedDataset } from "../../hooks/dataset";
import { LoggedIn } from "../session/LoggedIn";
import { toast } from "react-toastify";
import { PredicateAdder } from "../adders/PredicateAdder";
import { MdContentCopy } from "react-icons/md";

interface Props {
  dataset: LoadedCachedDataset;
  thing: ThingPersisted;
  onUpdate: (previousThing: ThingPersisted) => void;
}

// Stand-in for what will hopefully be a solid-client function
// NOTE THAT THIS CURRENTLY RELIES ON AN INTERNAL API TO WORK,
// AND WILL THEREFORE BREAK IN A NON-MAJOR RELEASE OF SOLID-CLIENT:
function toRdfJsDataset(thing: Thing) {
  return thing;
}

export const ThingViewer: FC<Props> = (props) => {
  const rdfJsDataset = toRdfJsDataset(props.thing);
  const predicates = Array.from(new Set(Array.from(rdfJsDataset).map(quad => quad.predicate.value))).sort();
  const viewers = predicates.map(predicate => (<PredicateViewer key={predicate + "_predicate"} {...props} predicate={predicate} onUpdate={props.onUpdate}/>));

  const deleteThing = async () => {
    const updatedDataset = removeThing(props.dataset.data, props.thing);
    try {
      await props.dataset.save(updatedDataset);
      props.onUpdate(props.thing);
    } catch (e) {
      if (e instanceof FetchError && e.statusCode === 403) {
        toast("You do not have permission to do that.", { type: "error" });
      } else {
        throw e;
      }
    }
  };

  const resourceUrl = getSourceUrl(props.dataset.data);
  const thingUrl = asUrl(props.thing);
  const resourcePartStart = isContainer(props.dataset.data)
    ? resourceUrl.substring(0, resourceUrl.lastIndexOf("/")).lastIndexOf("/")
    : resourceUrl.lastIndexOf("/");

  let noise = "";
  let signal = thingUrl;
  // The following logic has quite a few branch, so to clarify it,
  // in the comments let's assume the following Resource URL:
  //     https://some.pod/container/resource/
  // By default, we just display the full URL of the Thing.
  // Hoever, if this Thing is in the same Container as the containing Resource
  // (though it might be inside a child Container), we display a relative URL.
  // So the Thing's URL might be:
  // - https://some.pod/container/resource/#thing, or
  // - https://some.pod/container/resource/child, or
  // - https://some.pod/container/resource/child#thing
  if (thingUrl.substring(0, resourceUrl.length) === resourceUrl) {
    const hashIndex = thingUrl.indexOf("#");
    // If this is a Thing directly in the current Resource, e.g.
    //     https://some.pod/container/resource/#thing:
    if (hashIndex === resourceUrl.length) {
      // Display the Resource name subdued...
      noise = resourceUrl.substring(resourcePartStart + 1);
      // ...and the Thing name prominently:
      signal = thingUrl.substring(thingUrl.indexOf("#"));
    } else {
      // If this is a Thing inside a child Resource, or a Thing representing this Resource itself,
      // display the path relative to the current Container
      // (i.e. starting with the current Container's name).
      // So the Thing's URL might be:
      // - https://some.pod/container/resource/child, or
      // - https://some.pod/container/resource/child#thing, or
      // - https://some.pod/container/resource/, or
      signal = thingUrl.substring(resourcePartStart + 1);
      if ((new URL(resourceUrl)).pathname === "/") {
        // Unless we're at the root Container, in which case `resourcePartStart` is not, in fact,
        // the last `/` before the Resource, but the first one in `https://`.
        // Thus, we explicitly cut off the origin (but keep a `/` in front) in that case.
        signal = thingUrl.substring((new URL(resourceUrl)).origin.length);
      }
    }
  }
  const copyThingUrl: MouseEventHandler = async (event) => {
    event.preventDefault();
    await navigator.clipboard.writeText(asUrl(props.thing));
    toast("Thing URL copied to clipboard.", { type: "info" });
  };
  const clipboardLink = (
    <a
      href={asUrl(props.thing)}
      title="Copy this Thing's URL"
      aria-hidden="true"
      onClick={copyThingUrl}
      className="text-coolGray-400 p-2 rounded hover:text-white focus:text-white focus:ring-2 focus:ring-white focus:outline-none"
    >
      <MdContentCopy />
    </a>
  );
  const title = <><span><span className="text-coolGray-400 font-normal">{noise}</span>{signal}</span> {clipboardLink}</>;

  return (
    <div
      className="bg-coolGray-50 rounded-xl relative pb-5"
      id={encodeURIComponent(asUrl(props.thing))}
    >
      <h3 className="flex items-center text-lg md:text-xl lg:text-2xl rounded-t-xl bg-coolGray-700 text-white p-5 font-bold break-words">
        {title}
      </h3>
      <div className="px-5 pt-5">
        {viewers}
      </div>
      <LoggedIn>
        <PredicateAdder {...props}/>
        <button
          onClick={(e) => {e.preventDefault(); deleteThing();}}
          aria-label={`Delete "${asUrl(props.thing)}"`}
          title={`Delete "${asUrl(props.thing)}"`}
          className="object-right-top absolute -top-0.5 -right-0.5 bg-white hover:bg-red-700 hover:text-white p-1 -m-3 rounded-full border-coolGray-50 hover:border-red-700 focus:border-red-700 border-4 focus:outline-none"
        >
          <VscTrash/>
        </button>
      </LoggedIn>
    </div>
  );
};