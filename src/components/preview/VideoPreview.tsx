import { Localized } from "@fluent/react";
import { UrlString } from "@inrupt/solid-client";
import React, { FC } from "react";
import { SectionHeading } from "../ui/headings";

interface Props {
  fileUrl: UrlString;
  objectUrl: UrlString;
}

export const VideoPreview: FC<Props> = (props) => {
  const fileName = props.fileUrl.substring(props.fileUrl.lastIndexOf("/") + 1);

  return (
    <>
      <div className="pb-10">
        <Localized id="preview-video-heading">
          <SectionHeading>
            Video Preview
          </SectionHeading>
        </Localized>
        <Localized
          id="preview-video-error-playback"
          vars={{filename: fileName}}
          elems={{
            "download-link": <a href={props.objectUrl} download={true}/>
          }}
        >
          <video
            src={props.objectUrl}
            className="rounded max-w-full border-4 border-coolGray-700"
            controls={true}
          >
            Unfortunately your browser cannot provide a preview of `{fileName}`.
            You can download it instead.
          </video>
        </Localized>
      </div>
    </>
  );
};
