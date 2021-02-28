import { login } from "@inrupt/solid-client-authn-browser";
import { FC, FormEventHandler, MouseEventHandler, useState } from "react";
import { toast } from "react-toastify";
import { useSessionInfo } from "../../hooks/sessionInfo";
import { SubmitButton, TextField } from "../ui/forms";

export const ConnectForm: FC = (props) => {
  const [idp, setIdp] = useState("https://solidcommunity.net");
  const [loading, setLoading] = useState(false);
  const sessionInfo = useSessionInfo();

  if (loading || typeof sessionInfo === "undefined") {
    return <span className="animate-spin">Loading...</span>;
  }

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await login({ oidcIssuer: idp, clientName: "Penny" });
    } catch (e) {
      let toastMesagge =
        <>Could not find a Solid Pod at <samp className="font-mono">{idp}</samp>. Please check the name and try again.</>;
      if (["https://pod.inrupt.com", "https://inrupt.com"].includes(idp)) {
        const suggestedServer = "https://broker.pod.inrupt.com";
        const connectToInrupt: MouseEventHandler = (event) => {
          event.preventDefault();
          setIdp(suggestedServer);
          login({ oidcIssuer: suggestedServer, clientName: "Penny" });
        };
        toastMesagge =
          <>Could not find a Solid Pod to connect to. <button className="text-left" onClick={connectToInrupt}>Did you mean <samp className="font-mono">{suggestedServer}</samp>?</button></>;
      }
      if (idp === "https://solid.community") {
        const suggestedServer = "https://solidcommunity.net";
        const connectToInrupt: MouseEventHandler = (event) => {
          event.preventDefault();
          setIdp(suggestedServer);
          login({ oidcIssuer: suggestedServer, clientName: "Penny" });
        };
        toastMesagge =
          <>Could not find a Solid Pod to connect to. <button className="text-left" onClick={connectToInrupt}>Did you mean <samp className="font-mono">{suggestedServer}</samp>?</button></>;
      }
      toast(
        toastMesagge,
        { type: "warning" }
      );
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col space-y-5 text-xl lg:text-2xl">
        <label htmlFor="idp" className="p-x-3 text-lg lg:text-2xl font-bold">
          Connect your Pod at:
        </label>
        <TextField
          id="idp"
          type="url"
          value={idp}
          list="idps"
          onChange={setIdp}
          className="p-3"
          autoFocus={true}
        />
        <datalist id="idps">
          <option value="https://broker.pod.inrupt.com"/>
          <option value="https://solidcommunity.net"/>
          <option value="https://solidweb.org"/>
          <option value="https://inrupt.net"/>
        </datalist>
        <SubmitButton value="Connect" className="p-3"/>
      </form>
    </>
  );
};