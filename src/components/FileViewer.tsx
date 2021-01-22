import { FC, MouseEventHandler, useEffect, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import { deleteFile, FetchError, getFile, getSourceUrl, UrlString } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SectionHeading } from "./ui/headings";
import { VscLoading, VscTrash } from "react-icons/vsc";
import { LoggedIn } from "./LoggedIn";
import { isFileUrl, LoadedCachedDataset, LoadedCachedFileUrl } from "../hooks/dataset";
import { toast } from "react-toastify";
import { ConfirmOperation } from "./ConfirmOperation";

interface Props {
  file: LoadedCachedFileUrl | LoadedCachedDataset;
}

export const FileViewer: FC<Props> = (props) => {
  // On ESS, props.file contains a SolidDataset, whereas on NSS, it contains just the URL.
  // See useDataset() for more info.
  const fileUrl = isFileUrl(props.file) ? props.file.data : getSourceUrl(props.file.data);
  const [urlToPrepareForDownload, setUrlToPrepareForDownload] = useState<UrlString>(fileUrl);
  const [blobUrl, setBlobUrl] = useState<UrlString>();
  const [isPreparing, setIsPreparing] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

  useEffect(() => {
    (async () => {
      if (!urlToPrepareForDownload) {
        return;
      }
      try {
        const file = await getFile(urlToPrepareForDownload, { fetch: fetch });
        const objectUrl = URL.createObjectURL(file);
        setBlobUrl(objectUrl);
        const downloadAnchorElement = document.createElement("a");
        downloadAnchorElement.setAttribute("download", fileName);
        downloadAnchorElement.setAttribute("href", objectUrl);
        if (isPreparing) {
          downloadAnchorElement.click();
        }
      } catch(e) {
        toast("Could not download this file. You might not have sufficient access.", { type: "error" });
      }
      setIsPreparing(false);
    })();
  }, [urlToPrepareForDownload]);

  const downloadFile: MouseEventHandler = async (event) => {
    event.preventDefault();

    setIsPreparing(true);
    setUrlToPrepareForDownload(fileUrl);
  };

  const boxClasses = "w-full md:w-1/2 p-5 rounded bg-coolGray-700 text-white flex items-center space-x-2 text-lg";
  const buttonClasses = boxClasses + " hover:bg-coolGray-900 focus:ring-2 focus:ring-offset-2 focus:ring-coolGray-700 focus:outline-none focus:ring-opacity-50";

  let button = (
    <>
      <button
        title={`Download "${fileName}"`}
        onClick={downloadFile}
        className={buttonClasses}
      >
        <MdFileDownload className="text-2xl" aria-hidden="true"/>
        <span>Download</span>
      </button>
    </>
  );

  if (isPreparing) {
    button = (
      <>
        <div className={boxClasses}>
          <VscLoading aria-hidden="true"/>
          <span>Preparing download&hellip;</span>
        </div>
      </>
    );
  }

  // If a Blob URL was prepared _and_ is the blob for the current file:
  if (blobUrl && urlToPrepareForDownload === fileUrl) {
    button = (
      <>
        <a
          href={blobUrl}
          title={`Download "${fileName}"`}
          className={buttonClasses}
          download={fileName}
        >
          <MdFileDownload className="text-2xl" aria-hidden="true"/>
          <span>Download</span>
        </a>
      </>
    );
  }

  const onConfirmDelete = async () => {
    try {
      await deleteFile(fileUrl, { fetch: fetch });
      toast("File deleted.", { type: "info" });
      props.file.revalidate();
    } catch(e) {
      if (e instanceof FetchError && e.statusCode === 403) {
        toast("You are not allowed to delete this file.", { type: "error" });
      } else {
        toast("Could not delete the file.", { type: "error" });
      }
    }
  };

  const deletionModal = isRequestingDeletion
    ? (
      <ConfirmOperation
        confirmString={fileName}
        onConfirm={onConfirmDelete}
        onCancel={() => setIsRequestingDeletion(false)}
      >
        <h2 className="text-2xl pb-2">Are you sure?</h2>
        Are you sure you want to delete this file? This can not be undone.
      </ConfirmOperation>
    )
    : null;

  const onDeleteFile: MouseEventHandler = (event) => {
    event.preventDefault();

    setIsRequestingDeletion(true);
  };

  return (
    <>
      <div className="pb-10">
        <SectionHeading>
          File
        </SectionHeading>
        {button}
      </div>
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
            <span>Delete file</span>
          </button>
        </div>
      </LoggedIn>
    </>
  );
};
