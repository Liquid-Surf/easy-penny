import React, { FC, FormEventHandler, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdCheck } from "react-icons/md";
import { ClientLocalized } from "../ClientLocalized";
import { SectionHeading } from "../ui/headings";
import { useL10n } from "../../hooks/l10n";
import { LoadedCachedFileData } from "../../hooks/file";
import { Spinner } from "../ui/Spinner";
import { HasAccess } from "../HasAccess";

interface Props {
  file: LoadedCachedFileData;
}

export const TextPreview: FC<Props> = (props) => {
  const l10n = useL10n();
  const [formContent, setFormContent] = useState<string>();
  const [fileContent, setFileContent] = useState<string>();

  useEffect(() => {
    props.file.data.blob.text().then(setFileContent);
  }, [props.file]);

  if (!fileContent) {
    return <Spinner />;
  }

  const saveChanges: FormEventHandler = (event) => {
    event.preventDefault();
    const oldContent = fileContent;
    const undo = () => {
      props.file.save(new Blob([oldContent]));
      setFormContent(undefined);
    };
    props.file
      .save(new Blob([formContent ?? fileContent]))
      .then(() => {
        toast(
          <ClientLocalized
            id="preview-text-update-toast-success"
            elems={{
              "undo-button": (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    undo();
                  }}
                  className="underline hover:no-underline focus:no-underline"
                />
              ),
            }}
          >
            <span>Saved.</span>
          </ClientLocalized>,
          { type: "info" },
        );
      })
      .catch(() => {
        toast(
          <ClientLocalized id="preview-text-update-toast-error">
            <span>There was an error saving your text file.</span>
          </ClientLocalized>,
          { type: "error" },
        );
      });
  };

  const fallback = (
    <pre className="rounded border-4 border-gray-700 p-2 w-full h-96 overflow-scroll font-mono">
      {fileContent}
    </pre>
  );

  return (
    <>
      <div className="pb-10">
        <ClientLocalized id="preview-text-heading">
          <SectionHeading>File Contents</SectionHeading>
        </ClientLocalized>
        <HasAccess
          access={["write"]}
          resource={props.file.data}
          fallback={fallback}
        >
          <form onSubmit={saveChanges} className="space-y-5">
            {/* Why 60 characters: https://baymard.com/blog/line-length-readability */}
            <textarea
              cols={60}
              rows={20}
              className="rounded border-4 border-gray-700 p-2 w-full h-96 overflow-scroll font-mono"
              onChange={(e) => {
                e.preventDefault();
                setFormContent(e.target.value);
              }}
              value={formContent ?? fileContent}
            />
            <div className="grid sm:grid-cols-2 gap-5 pb-5">
              <button
                type="submit"
                className="p-5 rounded border-4 border-gray-700 text-gray-700 focus:text-white hover:text-white flex items-center space-x-2 text-lg focus:bg-gray-700 hover:bg-gray-700 focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 focus:outline-none focus:ring-opacity-50"
              >
                <MdCheck aria-hidden="true" />
                <span>{l10n.getString("preview-text-save-button")}</span>
              </button>
            </div>
          </form>
        </HasAccess>
      </div>
    </>
  );
};
