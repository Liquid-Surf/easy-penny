import { login } from "@inrupt/solid-client-authn-browser";
import { FC, FormEventHandler, useState } from "react";
import { useSessionInfo } from "../hooks/sessionInfo";
import { SubmitButton, TextField } from "./ui/forms";

export const ConnectForm: FC = (props) => {
  const [idp, setIdp] = useState("https://solidcommunity.net");
  const [loading, setLoading] = useState(false);
  const sessionInfo = useSessionInfo();

  if (loading || typeof sessionInfo === "undefined") {
    return <span className="animate-spin">Loading...</span>;
  }

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    setLoading(true);

    login({ oidcIssuer: idp, clientName: "Penny" });
  };

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col space-y-5 text-3xl">
        <label htmlFor="idp" className="p-x-5">
          Connect your Pod at:
        </label>
        <TextField
          id="idp"
          type="url"
          value={idp}
          list="idps"
          onChange={setIdp}
          className="p-5"
        />
        <datalist id="idps">
          <option value="https://broker.pod.inrupt.com"/>
          <option value="https://solidcommunity.net"/>
          <option value="https://inrupt.net"/>
        </datalist>
        <SubmitButton value="Connect" className="p-5"/>
      </form>
    </>
  );
};