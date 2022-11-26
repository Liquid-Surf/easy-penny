import {
  createContainerAt,
  createSolidDataset,
  getSourceUrl,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import React, {
  FC,
  FocusEventHandler,
  FormEventHandler,
  useState,
} from "react";
import { MdAdd, MdCheck } from "react-icons/md";
import { toast } from "react-toastify";
import Link from "next/link";
import { useSessionInfo } from "../../hooks/sessionInfo";
import { FileAdder } from "./FileAdder";
import { getExplorePath } from "../../functions/integrate";
import { useLocalization } from "@fluent/react";
import { ClientLocalized } from "../ClientLocalized";
import { LoadedCachedDataset } from "../../hooks/dataset";

interface Props {
  container: LoadedCachedDataset;
}

export const ResourceAdder: FC<Props> = (props) => {
  const sessionInfo = useSessionInfo();
  const [phase, setPhase] = useState<"initial" | "chooseName">("initial");
  const [newResourceName, setNewResourceName] = useState("");
  const { l10n } = useLocalization();

  if (!sessionInfo) {
    return null;
  }

  if (phase === "chooseName") {
    const onCancel: FocusEventHandler = (event) => {
      event.preventDefault();
      if (
        event.relatedTarget === null ||
        !event.currentTarget.contains(event.relatedTarget as Node)
      ) {
        setPhase("initial");
      }
    };

    const onSubmit: FormEventHandler = async (event) => {
      event.preventDefault();

      const justResourceName = newResourceName.endsWith("/")
        ? newResourceName.substring(0, newResourceName.length - 1)
        : newResourceName;
      const trailingSlash = newResourceName.endsWith("/") ? "/" : "";
      const sanitisedResourceName = encodeURIComponent(justResourceName);
      const newResourceUrl =
        getSourceUrl(props.container.data) +
        sanitisedResourceName +
        trailingSlash;
      const sentResource = newResourceName.endsWith("/")
        ? await createContainerAt(newResourceUrl, { fetch: fetch })
        : await saveSolidDatasetAt(newResourceUrl, createSolidDataset(), {
            fetch: fetch,
          });
      setPhase("initial");
      setNewResourceName("");
      await props.container.mutate();

      toast(
        <>
          <ClientLocalized id="resource-add-toast-success">
            Resource created.
          </ClientLocalized>
          &nbsp;
          <Link
            href={getExplorePath(getSourceUrl(sentResource))}
            className="underline hover:no-underline"
          >
            {l10n.getString("resource-add-toast-success-view-button")}
          </Link>
        </>,
        { type: "info" }
      );
    };

    return (
      <>
        <form
          onSubmit={onSubmit}
          className="flex space-x-2 items-center p-3 rounded bg-coolGray-700 text-white"
          onBlur={onCancel}
        >
          <ClientLocalized id="resource-add-name-label">
            <label htmlFor="resourceName" className="sr-only">
              Resource name
            </label>
          </ClientLocalized>
          <ClientLocalized
            id="resource-add-name-input"
            attrs={{ placeholder: true, title: true }}
          >
            <input
              type="text"
              name="resourceName"
              id="resourceName"
              className="text-coolGray-900 flex-grow p-2 rounded focus:outline-none focus:ring-4 focus:ring-blue-500"
              placeholder="e.g. resource-name or container-name/"
              required={true}
              autoFocus={true}
              value={newResourceName}
              onChange={(e) => {
                e.preventDefault();
                setNewResourceName(e.target.value);
              }}
              title="Resource name (append a `/` to create a Container)"
            />
          </ClientLocalized>
          <button
            type="submit"
            className="p-3 border-2 border-coolGray-700 hover:border-white hover:bg-white hover:text-coolGray-900 focus:border-white focus:outline-none rounded"
          >
            <MdCheck aria-label={l10n.getString("resource-add-name-submit")} />
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
          onClick={(e) => {
            e.preventDefault();
            setPhase("chooseName");
          }}
        >
          <MdAdd aria-hidden="true" className="text-3xl" />
          <ClientLocalized id="resource-add-button">
            <span>Add Resource</span>
          </ClientLocalized>
        </button>
        <FileAdder container={props.container} />
      </div>
    </>
  );
};
