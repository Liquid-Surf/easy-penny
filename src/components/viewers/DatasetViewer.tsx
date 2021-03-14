import { asUrl, FetchError, getContainedResourceUrlAll, getSourceUrl, getThingAll, isContainer, setThing, SolidDataset, Thing, ThingPersisted, WithResourceInfo } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { FC, MouseEventHandler, ReactText, useEffect, useRef, useState } from "react";
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
  const things = getThingAll(props.dataset.data).sort(getThingSorter(props.dataset.data)) as ThingPersisted[];
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const deletionToast = useRef<ReactText | null>(null);
  const [collapsedThings, setCollapsedThings] = useState<string[]>(getContainedResourceUrlAll(props.dataset.data));

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
        { onPrepareDelete: (urlToDelete => {
          const deletionMessage = <>Deleting <samp>{urlToDelete}</samp>&hellip;</>;
          if (!deletionToast.current) {
            deletionToast.current = toast(deletionMessage);
          } else {
            toast.update(deletionToast.current, { render: deletionMessage });
          }
        }) },
      );
      const deletionMessage = getContainedResourceUrlAll(props.dataset.data).length > 0
        ? <>Deleted <samp>{getSourceUrl(props.dataset.data)}</samp> and its children.</>
        : <>Deleted <samp>{getSourceUrl(props.dataset.data)}</samp>.</>
      if (!deletionToast.current) {
        toast(deletionMessage, { type: "info" });
      } else {
        toast.update(deletionToast.current, { render: deletionMessage, type: "info" });
        deletionToast.current = null;
      }
      props.dataset.revalidate();
    } catch(e) {
      let deletionMessage;
      if (e instanceof FetchError && e.statusCode === 403) {
        deletionMessage = "You are not allowed to delete this resource.";
      } else {
        deletionMessage = "Could not delete the resource.";
      }
      if (!deletionToast.current) {
        toast(deletionMessage, { type: "error" });
      } else {
        toast.update(deletionToast.current, { render: deletionMessage, type: "error" });
        deletionToast.current = null;
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
  const deletionModal = isRequestingDeletion
    ? (
      <ConfirmOperation
        confirmString={resourceName}
        onConfirm={onConfirmDelete}
        onCancel={() => setIsRequestingDeletion(false)}
      >
        <h2 className="text-2xl pb-2">Are you sure?</h2>
        <div className="py-2">{warning}</div>
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

  const getCollapseHandler = (thing: ThingPersisted) => {
    return (collapse: boolean, all: boolean) => {
      if (all) {
        if (collapse) {
          setCollapsedThings(things.map(thing => asUrl(thing)));
        } else {
          setCollapsedThings([]);
        }
      } else {
        const thingUrl = asUrl(thing);
        if (collapse) {
          setCollapsedThings(collapsedThings => collapsedThings.concat(thingUrl));
        } else {
          setCollapsedThings(collapsedThings => collapsedThings.filter(collapsedThingUrl => collapsedThingUrl !== thingUrl));
        }
      }
    };
  };

  return (
    <>
      <SectionHeading>
        Things
      </SectionHeading>
      <div className="space-y-10 pb-10">
        {things.map(thing => (
          <div key={asUrl(thing) + "_thing"}>
            <ThingViewer
              dataset={props.dataset}
              thing={thing}
              onUpdate={onUpdateThing}
              collapsed={collapsedThings.includes(asUrl(thing ))}
              onCollapse={getCollapseHandler(thing)}
            />
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

function getThingSorter(resource: SolidDataset & WithResourceInfo) {
  const resourceUrl = getSourceUrl(resource);
  const containedResourceUrls = getContainedResourceUrlAll(resource);
  return (a: Thing, b: Thing) => {
    const aUrl = asUrl(a, resourceUrl);
    const aUrlObj = new URL(aUrl);
    aUrlObj.hash = "";
    const bUrl = asUrl(b, resourceUrl);
    const bUrlObj = new URL(bUrl);
    bUrlObj.hash = "";
    // Sort actual Things before Things representing Contained Resources
    // (because they actually contain non-obvious data):
    if (!containedResourceUrls.includes(aUrlObj.href) && containedResourceUrls.includes(bUrlObj.href)) {
      return -1;
    }
    if (containedResourceUrls.includes(aUrlObj.href) && !containedResourceUrls.includes(bUrlObj.href)) {
      return 1;
    }
    // Sort the Thing representing the Resource itself before other Things:
    if (aUrlObj.href === resourceUrl && bUrlObj.href !== resourceUrl) {
      return -1;
    }
    if (aUrlObj.href !== resourceUrl && bUrlObj.href === resourceUrl) {
      return 1;
    }
    // Sort Things representing Resources before Things inside Resources:
    if(aUrl.indexOf("#") === -1 && bUrl.indexOf("#") !== -1) {
      return -1;
    }
    if(aUrl.indexOf("#") !== -1 && bUrl.indexOf("#") === -1) {
      return 1;
    }
    // Sort Things within the same Resource next to each other:
    return aUrl.localeCompare(bUrl);
  };
}
