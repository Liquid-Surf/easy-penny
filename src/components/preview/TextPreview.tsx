import React, { FC, useEffect, useState } from "react";
import { ClientLocalized } from "../ClientLocalized";
import { SectionHeading } from "../ui/headings";

interface Props {
  file: Blob;
}

export const TextPreview: FC<Props> = (props) => {
  const [fileContents, setFileContents] = useState<string>();

  useEffect(() => {
    setFileContents(undefined);
    props.file.text().then(setFileContents);
  }, [props.file]);

  if (!fileContents) {
    return null;
  }

  return (
    <>
      <div className="pb-10">
        <ClientLocalized id="preview-text-heading">
          <SectionHeading>
            File Contents
          </SectionHeading>
        </ClientLocalized>
        <pre className="rounded border-4 border-coolGray-700 p-2 w-full h-96 overflow-scroll font-mono">
          {fileContents}
        </pre>
      </div>
    </>
  );
};
