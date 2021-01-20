import { FC } from "react";
import { MdFileUpload } from "react-icons/md";
import { FetchError, getSourceUrl, saveFileInContainer } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { LoadedCachedDataset } from "../hooks/dataset";
import { useSessionInfo } from "../hooks/sessionInfo";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

interface Props {
  container: LoadedCachedDataset;
};

export const FileAdder: FC<Props> = (props) => {
  const sessionInfo = useSessionInfo();

  const onDrop: DropzoneOptions["onDrop"] = async (selectedFiles) => {
    try {
      await Promise.all(selectedFiles.map(file => {
        return saveFileInContainer(
          getSourceUrl(props.container.data),
          file,
          {
            fetch: fetch,
            slug: file.name,
          },
        );
      }));
      props.container.revalidate();
      toast(selectedFiles.length > 1 ? "Files uploaded." : "File uploaded.", { type: "info" });
    } catch (e) {
      if (e instanceof FetchError && e.statusCode === 403) {
        toast("You do not have permission to upload files in this Container.", { type: "error" });
      } else {
        toast(selectedFiles.length > 1 ? "Could not upload the files." : "Could not upload the file.", { type: "error" });
      }
    }
  };
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

  if (!sessionInfo) {
    return null;
  }

  const dropTargetStyles = isDragActive
    ? "text-coolGray-900 border-coolGray-900 bg-coolGray-100"
    : "";
  return (
    <>
      <label
        {...getRootProps()}
        className={`${dropTargetStyles} flex items-center space-x-2 p-5 cursor-pointer rounded border-4 border-dashed border-coolGray-200 text-coolGray-500 focus:text-coolGray-900 focus:border-coolGray-900 hover:text-coolGray-900 hover:border-coolGray-900 hover:bg-coolGray-100 focus:outline-none`}
        >
        <MdFileUpload aria-hidden="true" className="text-3xl"/>
        <span>{isDragActive ? "Drop here to upload" : "Upload file"}</span>
        <input {...getInputProps()}/>
      </label>
    </>
  );
};