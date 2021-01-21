import { FC, MouseEventHandler, useEffect, useState } from "react";
import { MdFileDownload } from "react-icons/md";
import { getFile, UrlString } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { SectionHeading } from "./ui/headings";
import { VscLoading } from "react-icons/vsc";

interface Props {
  fileUrl: UrlString;
}

export const FileViewer: FC<Props> = (props) => {
  const [urlToPrepareForDownload, setUrlToPrepareForDownload] = useState<UrlString>(props.fileUrl);
  const [blobUrl, setBlobUrl] = useState<UrlString>();
  const [isPreparing, setIsPreparing] = useState(false);
  const fileName = props.fileUrl.substring(props.fileUrl.lastIndexOf("/") + 1);

  useEffect(() => {
    (async () => {
      if (!urlToPrepareForDownload) {
        return;
      }
      // TODO: Handle download error
      const file = await getFile(urlToPrepareForDownload, { fetch: fetch });
      const objectUrl = URL.createObjectURL(file);
      setBlobUrl(objectUrl);
      const downloadAnchorElement = document.createElement("a");
      downloadAnchorElement.setAttribute("download", fileName);
      downloadAnchorElement.setAttribute("href", objectUrl);
      if (isPreparing) {
        downloadAnchorElement.click();
      }
      setIsPreparing(false);
    })();
  }, [urlToPrepareForDownload]);

  const downloadFile: MouseEventHandler = async (event) => {
    event.preventDefault();

    setIsPreparing(true);
    setUrlToPrepareForDownload(props.fileUrl);
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
  if (blobUrl && urlToPrepareForDownload === props.fileUrl) {
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

  return (
    <>
      <div className="pb-10">
        <SectionHeading>
          File
        </SectionHeading>
        {button}
      </div>
    </>
  );
};
