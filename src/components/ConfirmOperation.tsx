import { FC, FormEventHandler, useEffect, useState } from "react";
import Modal from "react-modal";
import { LoggedIn } from "./LoggedIn";
import { LoggedOut } from "./LoggedOut";
import { ConnectForm } from "./ConnectForm";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import { useSessionInfo } from "../hooks/sessionInfo";
import { logout } from "@inrupt/solid-client-authn-browser";
import { Button, SubmitButton, TextField } from "./ui/forms";

interface Props {
  confirmString: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmOperation: FC<Props> = (props) => {
  const [promptOpen, setPromptOpen] = useState(true);
  const [enteredString, setEnteredString] = useState("");

  const onSubmit: FormEventHandler = (event) => {
    event.preventDefault();

    if (enteredString === props.confirmString) {
      props.onConfirm();
    }
  };

  return (
    <Modal
      isOpen={promptOpen}
      onRequestClose={() => setPromptOpen(false)}
      onAfterClose={props.onCancel}
      contentLabel="Are you sure?"
      overlayClassName={{
        base: "transition-opacity duration-150 motion-safe:opacity-0 bg-opacity-90 bg-gray-900 p-5 md:py-20 md:px-40 lg:px-60 xl:px-96 fixed top-0 left-0 right-0 bottom-0 overscroll-contain",
        afterOpen: "motion-safe:opacity-100",
        beforeClose: "",
      }}
      className={{
        base: "transition-opacity duration-150 motion-safe:opacity-0 bg-white shadow-lg mx-auto p-5 md:p-10 rounded",
        afterOpen: "motion-safe:opacity-100",
        beforeClose: "",
      }}
      closeTimeoutMS={150}
    >
      <div className="flex flex-row-reverse -mt-4 -mr-4 md:-mt-8 md:-mr-8">
        <button onClick={() => setPromptOpen(false)}>
          <MdClose aria-label="Close"/>
        </button>
      </div>
      {props.children}
      <form
        onSubmit={onSubmit}
        className="flex flex-col space-y-5 pt-5"
      >
        <label
          htmlFor="confirmationString"
          className=""
        >Please enter <samp><kbd className="font-mono bg-coolGray-200 p-1 border-2 border-coolGray-300 rounded">{props.confirmString}</kbd></samp> to continue:</label>
        <TextField
          onChange={setEnteredString}
          required={true}
          className="p-2"
          minLength={props.confirmString.length}
          maxLength={props.confirmString.length}
          autoFocus={true}
        />
        <div className="flex space-x-5">
          <Button
            value="Cancel"
            className="flex-grow p-2"
            onClick={() => setPromptOpen(false)}
          />
          <SubmitButton
            value="Continue"
            className="flex-grow p-2"
            disabled={enteredString !== props.confirmString}
          />
        </div>
      </form>
    </Modal>
  );
};
