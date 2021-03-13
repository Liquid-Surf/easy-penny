import { asUrl, FetchError, getContainedResourceUrlAll, getSourceUrl, getThingAll, isContainer, setThing, Thing, ThingPersisted, WithResourceInfo } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { FC, MouseEventHandler, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoadedCachedDataset } from "../../hooks/dataset";
import { ThingAdder } from "../adders/ThingAdder";
import { ThingViewer } from "./ThingViewer";
import { LoggedIn } from "../session/LoggedIn";
import { ConfirmOperation } from "../ConfirmOperation";
import { SectionHeading } from "../ui/headings";
import { VscTrash } from "react-icons/vsc";
import { deleteRecursively } from "../../functions/recursiveDelete";

interface Props {
  dataset: LoadedCachedDataset;
}

export const DatasetViewer: FC<Props> = (props) => {
  const [thingToRestore, setThingToRestore] = useState<ThingPersisted>();
  const things = getThingAll(props.dataset.data).sort(getThingSorter(props.dataset.data));
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const [currentlyDeleting, setCurrentlyDeleting] = useState<string>();

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
        Saved. <button onClick={e => {e.preventDefault(); undo();}} className="underline hover:no-underline focus:no-underline">Undo.</button>
      </>,
      { type: "info" },
    );
  };

  const onConfirmDelete = async () => {
    try {
      await deleteRecursively(
        props.dataset.data,
        { fetch: fetch },
        { onPrepareDelete: (urlToDelete => setCurrentlyDeleting(urlToDelete)) },
      );
      setCurrentlyDeleting(undefined);
      toast("Resource deleted.", { type: "info" });
      props.dataset.revalidate();
    } catch(e) {
      if (e instanceof FetchError && e.statusCode === 403) {
        toast("You are not allowed to delete this resource.", { type: "error" });
      } else {
        toast("Could not delete the resource.", { type: "error" });
      }
    }
  };

  const resourceUrl = getSourceUrl(props.dataset.data);
  const resourcePartStart = isContainer(props.dataset.data)
    ? resourceUrl.substring(0, resourceUrl.lastIndexOf("/")).lastIndexOf("/")
    : resourceUrl.lastIndexOf("/");
  const resourceName = resourceUrl.substring(resourcePartStart + 1);
  const warning = getContainedResourceUrlAll(props.dataset.data).length > 0
    ? <>Are you sure you want to attempt to delete this Container Resource and its children? This can not be undone.</>
    : <>Are you sure you want to delete this Resource? This can not be undone.</>;
  const inProgress = typeof currentlyDeleting === "string"
    ? <div
        className="bg-yellow-100 border-yellow-200 border-2 rounded p-2"
        aria-live="polite"
      >Deleting <samp>{currentlyDeleting}</samp>&hellip;</div>
    : null;
  const deletionModal = isRequestingDeletion
    ? (
      <ConfirmOperation
        confirmString={resourceName}
        onConfirm={onConfirmDelete}
        onCancel={() => setIsRequestingDeletion(false)}
      >
        <h2 className="text-2xl pb-2">Are you sure?</h2>
        <div className="py-2">{warning}</div>
        {inProgress}
      </ConfirmOperation>
    )
    : null;

  const onDeleteFile: MouseEventHandler = (event) => {
    event.preventDefault();

    setIsRequestingDeletion(true);
  };

  const dangerZone = <>
    <LoggedIn>
      <div className="pb-10">
        <SectionHeading>
          Danger Zone
        </SectionHeading>
        {deletionModal}
        <button
          className="w-full md:w-1/2 p-5 rounded border-4 border-red-700 text-red-700 focus:text-white hover:text-white flex items-center space-x-2 text-lg focus:bg-red-700 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-700 focus:outline-none focus:ring-opacity-50"
          onClick={onDeleteFile}
        >
          <VscTrash aria-hidden="true"/>
          <span>Delete resource</span>
        </button>
      </div>
    </LoggedIn>
    </>;

  if (things.length === 0) {
    return (
      <>
        <div className="space-y-10 pb-10">
          <div className="rounded bg-yellow-200 p-5">
            This Resource is empty.
          </div>
          <LoggedIn>
            <ThingAdder dataset={props.dataset} onUpdate={onUpdateThing}/>
          </LoggedIn>
        </div>
        {dangerZone}
      </>
    );
  }


  return (
    <>
      <SectionHeading>
        Things
      </SectionHeading>
      <div className="space-y-10 pb-10">
        {things.map(thing => (
          <div key={asUrl(thing as ThingPersisted) + "_thing"}>
            <ThingViewer dataset={props.dataset} thing={thing as ThingPersisted} onUpdate={onUpdateThing}/>
          </div>
        ))}
        <LoggedIn>
          <ThingAdder dataset={props.dataset} onUpdate={onUpdateThing}/>
        </LoggedIn>
      </div>
      {dangerZone}
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
