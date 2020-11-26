import { FC, HTMLAttributes, useState } from "react";
import Modal from "react-modal";
import { useSessionInfo } from "../hooks/sessionInfo";
import { SessionGate } from "./SessionGate";
import { Button } from "./ui/forms";
import { PageTitle } from "./ui/headings";

type Props = HTMLAttributes<HTMLInputElement> & { prompt: string };

export const SessionPrompt: FC<Props> = (props) => {
  const sessionInfo = useSessionInfo();
  const [promptOpen, setPromptOpen] = useState(false);

  if (sessionInfo) {
    return <>{props.children}</>;
  }

  if (!promptOpen) {
    const buttonProps = {
      ...props,
      children: undefined,
    };
    return (
      <>
        <Button
          {...buttonProps}
          value={props.prompt}
          onClick={(e) => { e.preventDefault(); setPromptOpen(true); }}
        />
      </>
    );
  }

  return (
    <>
      <Modal
        isOpen={promptOpen}
        onRequestClose={() => setPromptOpen(false)}
        contentLabel="Connect your Solid Pod"
        overlayClassName="bg-gray-900 bg-opacity-90 p-5 md:py-20 md:px-40 lg:px-60 xl:px-96 fixed top-0 left-0 right-0 bottom-0 overscroll-contain"
        className="bg-white shadow-lg mx-auto p-5 md:p-10 rounded-lg"
      >
        <SessionGate/>
      </Modal>
    </>
  );
};