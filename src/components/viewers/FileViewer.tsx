import React, { FC, MouseEventHandler, useEffect, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import { deleteFile, FetchError, getContentType, getFile, getSourceUrl, UrlString, WithResourceInfo } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SectionHeading } from "../ui/headings";
import { VscLoading, VscTrash } from "react-icons/vsc";
import { isLoadedCachedFileInfo, LoadedCachedDataset, LoadedCachedFileInfo, WithServerResourceInfo } from "../../hooks/dataset";
import { toast } from "react-toastify";
import { ConfirmOperation } from "../ConfirmOperation";
import { ImagePreview } from "../preview/ImagePreview";
import { AudioPreview } from "../preview/AudioPreview";
import { VideoPreview } from "../preview/VideoPreview";
import { TextPreview } from "../preview/TextPreview";
import { useLocalization } from "@fluent/react";
import { ClientLocalized } from "../ClientLocalized";
import { HasAccess } from "../HasAccess";

interface Props {
  file: LoadedCachedFileInfo | LoadedCachedDataset;
}

export const FileViewer: FC<Props> = (props) => {
  // On ESS, props.file contains a SolidDataset, whereas on NSS, it contains just the URL.
  // See useDataset() for more info.
  const fileUrl = isLoadedCachedFileInfo(props.file) ? props.file.data.url : getSourceUrl(props.file.data);
  const [urlToPrepareForDownload, setUrlToPrepareForDownload] = useState<UrlString>(fileUrl);
  const [downloadedFile, setDownloadedFile] = useState<Blob & WithServerResourceInfo>();
  const [blobUrl, setBlobUrl] = useState<UrlString>();
  const [isPreparing, setIsPreparing] = useState(false);
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false);
  const fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
  const { l10n } = useLocalization();

  useEffect(() => {
    (async () => {
      if (!urlToPrepareForDownload) {
        return;
      }
      try {
        const file = await getFile(urlToPrepareForDownload, { fetch: fetch });
        setDownloadedFile(file);
      } catch(e) {
        toast(l10n.getString("file-download-toast-error-other"), { type: "error" });
        setIsPreparing(false);
      }
    })();
  }, [urlToPrepareForDownload]);

  useEffect(() => {
    (async () => {
      if (!downloadedFile) {
        return;
      }
      const objectUrl = URL.createObjectURL(downloadedFile);
      setBlobUrl(objectUrl);
      const downloadAnchorElement = document.createElement("a");
      downloadAnchorElement.setAttribute("download", fileName);
      downloadAnchorElement.setAttribute("href", objectUrl);
      if (isPreparing) {
        downloadAnchorElement.click();
        setIsPreparing(false);
      }
    })();
  }, [downloadedFile]);

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
        title={l10n.getString("file-download-button-tooltip", { filename: fileName })}
        onClick={downloadFile}
        className={buttonClasses}
      >
        <MdFileDownload className="text-2xl" aria-hidden="true"/>
        <ClientLocalized id="file-download-button"><span>Download</span></ClientLocalized>
      </button>
    </>
  );

  if (isPreparing) {
    button = (
      <>
        <div className={boxClasses}>
          <VscLoading className="motion-safe:animate-spin" aria-hidden="true"/>
          <ClientLocalized id="file-download-preparing"><span>Preparing download&hellip;</span></ClientLocalized>
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
          title={l10n.getString("file-download-button-tooltip", { filename: fileName })}
          className={buttonClasses}
          download={fileName}
        >
          <MdFileDownload className="text-2xl" aria-hidden="true"/>
          <ClientLocalized id="file-download-button"><span>Download</span></ClientLocalized>
        </a>
      </>
    );
  }

  const onConfirmDelete = async () => {
    try {
      await deleteFile(fileUrl, { fetch: fetch });
      toast(l10n.getString("file-delete-toast-success"), { type: "info" });
      props.file.revalidate();
    } catch(e) {
      if (e instanceof FetchError && e.statusCode === 403) {
        toast(l10n.getString("file-delete-toast-error-not-allowed"), { type: "error" });
      } else {
        toast(l10n.getString("file-delete-toast-error-other"), { type: "error" });
      }
    }
  };

  const deletionModal = isRequestingDeletion
    ? (
      <ConfirmOperation
        confirmString={decodeURIComponent(fileName)}
        onConfirm={onConfirmDelete}
        onCancel={() => setIsRequestingDeletion(false)}
      >
        <ClientLocalized id="file-delete-confirm-heading">
          <h2 className="text-2xl pb-2">Are you sure?</h2>
        </ClientLocalized>
        <ClientLocalized id="file-delete-confirm-lead">Are you sure you want to delete this file? This can not be undone.</ClientLocalized>
      </ConfirmOperation>
    )
    : null;

  const onDeleteFile: MouseEventHandler = (event) => {
    event.preventDefault();

    setIsRequestingDeletion(true);
  };

  let preview: JSX.Element | null = null;
  if (downloadedFile && blobUrl && urlToPrepareForDownload === fileUrl) {
    const contentType = getContentType(downloadedFile);
    const contentTypeParts = contentType?.split("/");
    if (Array.isArray(contentTypeParts) && contentTypeParts.length === 2) {
      if (contentTypeParts[0] === "image") {
        preview = <ImagePreview fileUrl={fileUrl} objectUrl={blobUrl}/>;
      }
      if (contentTypeParts[0] === "audio") {
        preview = <AudioPreview fileUrl={fileUrl} objectUrl={blobUrl}/>;
      }
      if (contentTypeParts[0] === "video") {
        preview = <VideoPreview fileUrl={fileUrl} objectUrl={blobUrl}/>;
      }
      if (contentTypeParts[0] === "text") {
        preview = <TextPreview file={downloadedFile}/>;
      }
    }
  }

  return (
    <>
      <div className="pb-10">
        <ClientLocalized id="file-heading">
          <SectionHeading>
            File
          </SectionHeading>
        </ClientLocalized>
        {button}
      </div>
      {preview}
      { downloadedFile
        ?
        <HasAccess access={["write"]} resource={downloadedFile}>
          <div className="pb-10">
            <ClientLocalized id="danger-zone-heading">
              <SectionHeading>
                Danger Zone
              </SectionHeading>
            </ClientLocalized>
            {deletionModal}
            <button
              className="w-full md:w-1/2 p-5 rounded border-4 border-red-700 text-red-700 focus:text-white hover:text-white flex items-center space-x-2 text-lg focus:bg-red-700 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-700 focus:outline-none focus:ring-opacity-50"
              onClick={onDeleteFile}
            >
              <VscTrash aria-hidden="true"/>
              <ClientLocalized id="file-delete"><span>Delete file</span></ClientLocalized>
            </button>
          </div>
        </HasAccess>
        : null
      }
    </>
  );
};
