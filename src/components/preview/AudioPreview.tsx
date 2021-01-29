import { UrlString } from "@inrupt/solid-client";
import { FC } from "react";
import { SectionHeading } from "../ui/headings";

interface Props {
  fileUrl: UrlString;
  objectUrl: UrlString;
}

export const AudioPreview: FC<Props> = (props) => {
  const fileName = props.fileUrl.substring(props.fileUrl.lastIndexOf("/") + 1);

  return (
    <>
      <div className="pb-10">
        <SectionHeading>
          Audio Preview
        </SectionHeading>
          <audio
            src={props.objectUrl}
            className="w-full"
            controls={true}
          >
            Unfortunately your browser cannot provide a preview of "{fileName}".
            You can <a href={props.objectUrl} download={true} title={`Download "${fileName}".`}>download it</a> instead.
          </audio>
      </div>
    </>
  );
};
