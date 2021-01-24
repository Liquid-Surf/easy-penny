import { FC, HTMLAttributes, useState } from "react";
import Modal from "react-modal";
import { useSessionInfo } from "../../hooks/sessionInfo";
import { ConnectForm } from "./ConnectForm";
import { Button } from "../ui/forms";
import { CloseButton } from "../ui/iconButtons";

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
        overlayClassName={{
          base: "transition-opacity duration-150 motion-safe:opacity-0 bg-opacity-90 bg-gray-900 p-5 md:py-20 md:px-40 lg:px-60 xl:px-96 fixed top-0 left-0 right-0 bottom-0 overscroll-contain",
          afterOpen: "motion-safe:opacity-100",
          beforeClose: "",
        }}
        className={{
          base: "transition-opacity duration-150 motion-safe:opacity-0 bg-white shadow-lg mx-auto p-5 md:p-10 rounded-lg",
          afterOpen: "motion-safe:opacity-100",
          beforeClose: "",
        }}
        closeTimeoutMS={150}
      >
        <div className="flex flex-row-reverse -mt-4 -mr-4 md:-mt-8 md:-mr-8">
          <CloseButton onClick={() => setPromptOpen(false)}/>
        </div>
        <ConnectForm/>
      </Modal>
    </>
  );
};