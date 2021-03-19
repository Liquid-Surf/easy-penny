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
import { Localized, useLocalization } from "@fluent/react";

interface Props {
  dataset: LoadedCachedDataset;
}

export const DatasetViewer: FC<Props> = (props) => {
  const [thingToRestore, setThingToRestore] = useState<ThingPersisted>();
  const things = getThingAll(props.dataset.data).sort(getThingSorter(props.dataset.data)) as ThingPersisted[];
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const deletionToast = useRef<ReactText | null>(null);
  const [collapsedThings, setCollapsedThings] = useState<string[]>(getContainedResourceUrlAll(props.dataset.data));
  const { l10n } = useLocalization();

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
      <Localized
        id="dataset-update-toast-success"
        elems={{
          "undo-button": <button onClick={e => {e.preventDefault(); undo();}} className="underline hover:no-underline focus:no-underline"/>
        }}
      >
        <span>Saved.</span>
      </Localized>,
      { type: "info" },
    );
  };

  const onConfirmDelete = async () => {
    try {
      deletionToast.current = toast(
        <Localized
          id="dataset-delete-toast-prepare"
          elems={{"dataset-url": <samp/>}}
          vars={{"datasetUrl": decodeURIComponent(getSourceUrl(props.dataset.data))}}
        >
          <span>Preparing deletion of <samp>{decodeURIComponent(getSourceUrl(props.dataset.data))}</samp>&hellip;</span>
        </Localized>,
        { type: "info" },
      );
      await deleteRecursively(
        props.dataset.data,
        { fetch: fetch },
        { onPrepareDelete: (urlToDelete => {
          const deletionMessage = (
            <Localized
              id="dataset-delete-toast-process"
              elems={{"dataset-url": <samp/>}}
              vars={{"datasetUrl": decodeURIComponent(urlToDelete)}}
            >
                <span>Deleting <samp>{decodeURIComponent(urlToDelete)}</samp>&hellip;</span>
            </Localized>
          );
          if (!deletionToast.current) {
            deletionToast.current = toast(deletionMessage, { type: "info" });
          } else {
            toast.update(deletionToast.current, { render: deletionMessage });
          }
        }) },
      );
      const deletionMessage = (
        <Localized
          id={getContainedResourceUrlAll(props.dataset.data).length > 0
            ? "dataset-delete-toast-success-container"
            : "dataset-delete-toast-success-resource"
          }
          elems={{"dataset-url": <samp/>}}
          vars={{"datasetUrl": decodeURIComponent(getSourceUrl(props.dataset.data))}}
        >
          <span>Deleted <samp>{decodeURIComponent(getSourceUrl(props.dataset.data))}</samp> and its children.</span>
        </Localized>
      );
      toast.update(deletionToast.current, { render: deletionMessage });
      deletionToast.current = null;
      props.dataset.revalidate();
    } catch(e) {
      let deletionMessage;
      if (e instanceof FetchError && e.statusCode === 403) {
        deletionMessage = l10n.getString("dataset-delete-toast-error-not-allowed");
      } else {
        deletionMessage = l10n.getString("dataset-delete-toast-error-other");
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
  const warning = l10n.getString(
    getContainedResourceUrlAll(props.dataset.data).length > 0
      ? "dataset-delete-confirm-lead-container"
      : "dataset-delete-confirm-lead-resource"
    );
  const deletionModal = isRequestingDeletion
    ? (
      <ConfirmOperation
        confirmString={decodeURIComponent(resourceName)}
        onConfirm={onConfirmDelete}
        onCancel={() => setIsRequestingDeletion(false)}
      >
        <Localized id="dataset-delete-confirm-heading">
          <h2 className="text-2xl pb-2">Are you sure?</h2>
        </Localized>
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
        <Localized id="danger-zone-heading">
          <SectionHeading>
            Danger Zone
          </SectionHeading>
        </Localized>
        {deletionModal}
        <button
          className="w-full md:w-1/2 p-5 rounded border-4 border-red-700 text-red-700 focus:text-white hover:text-white flex items-center space-x-2 text-lg focus:bg-red-700 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-700 focus:outline-none focus:ring-opacity-50"
          onClick={onDeleteFile}
        >
          <VscTrash aria-hidden="true"/>
          <Localized id="dataset-delete"><span>Delete resource</span></Localized>
        </button>
      </div>
    </LoggedIn>
    </>;

  if (things.length === 0) {
    return (
      <>
        <div className="space-y-10 pb-10">
          <Localized id="dataset-empty-warning">
            <div className="rounded bg-yellow-200 p-5">
              This resource is empty.
            </div>
          </Localized>
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

  const isServerManaged = (thing: ThingPersisted): boolean => {
    const thingUrl = asUrl(thing);
    const containedResourceUrls = getContainedResourceUrlAll(props.dataset.data);
    // If the Thing represents a Resource contained within the current Resource,
    // or the Resource itself and the Resource is a Container, then it was
    // automatically added by the server:
    return (getSourceUrl(props.dataset.data) === thingUrl && containedResourceUrls.length > 0) ||
      containedResourceUrls.includes(thingUrl);
  };

  return (
    <>
      <Localized id="dataset-things-heading">
        <SectionHeading>
          Things
        </SectionHeading>
      </Localized>
      <div className="space-y-10 pb-10">
        {things.map(thing => (
          <div key={asUrl(thing) + "_thing"}>
            <ThingViewer
              dataset={props.dataset}
              thing={thing}
              onUpdate={onUpdateThing}
              collapsed={collapsedThings.includes(asUrl(thing ))}
              onCollapse={getCollapseHandler(thing)}
              isServerManaged={isServerManaged(thing)}
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
