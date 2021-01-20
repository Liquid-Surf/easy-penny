import { createContainerAt, createSolidDataset, getSourceUrl, saveSolidDatasetAt } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { FC, FormEventHandler, useState } from "react";
import { MdAdd, MdCheck } from "react-icons/md";
import { toast } from "react-toastify";
import Link from "next/link";
import { LoadedCachedDataset } from "../hooks/dataset";
import { useSessionInfo } from "../hooks/sessionInfo";

interface Props {
  container: LoadedCachedDataset;
};

export const ResourceAdder: FC<Props> = (props) => {
  const sessionInfo = useSessionInfo();
  const [phase, setPhase] = useState<"initial" | "chooseName">("initial");
  const [newResourceName, setNewResourceName] = useState("");

  if (!sessionInfo) {
    return null;
  }

  if(phase === "chooseName") {
    const onSubmit: FormEventHandler = async (event) => {
      event.preventDefault();

      const sanitisedResourceName = encodeURIComponent(newResourceName);
      const newResourceUrl = getSourceUrl(props.container.data) + sanitisedResourceName;
      const sentResource = newResourceName.endsWith("/")
        ? await createContainerAt(newResourceUrl, { fetch: fetch })
        : await saveSolidDatasetAt(newResourceUrl, createSolidDataset(), { fetch: fetch });
      setPhase("initial");
      setNewResourceName("");
      await props.container.mutate();
      toast(<>
        Resource created. <Link href={`/explore/${getSourceUrl(sentResource)}`}><a className="underline hover:no-underline">View</a></Link>.
      </>, { type: "info" });
    };

    return (
      <>
        <form
          onSubmit={onSubmit}
          className="flex space-x-2 items-center p-3 rounded bg-coolGray-700 text-white"
        >
          <label
            htmlFor="resourceName"
            className="sr-only"
          >
            Resource name
          </label>
          <input
            type="text"
            name="resourceName"
            id="resourceName"
            className="text-coolGray-900 flex-grow p-2 rounded focus:outline-none focus:ring-4 focus:ring-blue-500"
            placeholder="e.g. resource-name or container-name/"
            required={true}
            value={newResourceName}
            onChange={(e) => {e.preventDefault(); setNewResourceName(e.target.value);}}
            title="Resource name (append a `/` to create a Container)"
          />
          <button
            type="submit"
            className="p-3 border-2 border-coolGray-700 hover:border-white hover:bg-white hover:text-coolGray-900 focus:border-white focus:outline-none rounded"
          >
            <MdCheck aria-label="Save"/>
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-5">
        <button
          className="flex items-center space-x-2 p-5 rounded border-4 border-dashed border-coolGray-200 text-coolGray-500 focus:text-coolGray-900 focus:border-coolGray-900 hover:text-coolGray-900 hover:border-coolGray-900 hover:bg-coolGray-100 focus:outline-none"
          onClick={(e) => {e.preventDefault(); setPhase("chooseName")}}
        >
          <MdAdd aria-hidden="true" className="text-3xl"/>
          <span>Add Resource</span>
        </button>
      </div>
    </>
  );
};