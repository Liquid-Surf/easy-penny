import { UrlString } from "@inrupt/solid-client";
import { FC, MouseEventHandler, useState } from "react";
import { SectionHeading } from "../ui/headings";
import { Modal } from "../ui/modal";

interface Props {
  fileUrl: UrlString;
  objectUrl: UrlString;
}

export const ImagePreview: FC<Props> = (props) => {
  const fileName = props.fileUrl.substring(props.fileUrl.lastIndexOf("/") + 1);
  const [modalPreview, setModalPreview] = useState(false);

  const openPreviewModal: MouseEventHandler = (event) => {
    event.preventDefault();

    setModalPreview(true);
  };

  return (
    <>
      <div className="pb-10">
        <SectionHeading>
          Image Preview
        </SectionHeading>
        <a
          href={props.objectUrl}
          title="View or download full image"
          onClick={openPreviewModal}
          className="block rounded hover:opacity-75 focus:ring-2 focus:ring-coolGray-700 focus:ring-offset-2 focus:outline-none"
        >
          <img
            src={props.objectUrl}
            alt={`Preview of "${fileName}"`}
            className="rounded max-w-full border-4 border-coolGray-700"
          />
        </a>
        <Modal
          isOpen={modalPreview}
          onRequestClose={() => setModalPreview(false)}
          contentLabel="Image preview"
        >
          <img
            src={props.objectUrl}
            alt={`Preview of "${fileName}"`}
          />
        </Modal>
      </div>
    </>
  );
};
