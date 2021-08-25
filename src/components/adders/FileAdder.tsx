import { FC } from "react";
import { MdFileUpload } from "react-icons/md";
import { FetchError, getSourceUrl, saveFileInContainer } from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { useSessionInfo } from "../../hooks/sessionInfo";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useLocalization } from "@fluent/react";
import { LoadedCachedDataset } from "../../hooks/dataset";

interface Props {
  container: LoadedCachedDataset;
};

export const FileAdder: FC<Props> = (props) => {
  const sessionInfo = useSessionInfo();
  const { l10n } = useLocalization();

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
      props.container.mutate();
      toast(l10n.getString("file-add-toast-success", { fileCount: selectedFiles.length }), { type: "info" });
    } catch (e) {
      if (e instanceof FetchError && e.statusCode === 403) {
        toast(l10n.getString("file-add-toast-error-not-allowed"), { type: "error" });
      } else {
        toast(l10n.getString("file-add-toast-error-other", { fileCount: selectedFiles.length }), { type: "error" });
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
        <span>{isDragActive ? l10n.getString("file-add-drop-target") : l10n.getString("file-add-button")}</span>
        <input {...getInputProps()}/>
      </label>
    </>
  );
};