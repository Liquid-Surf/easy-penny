import { FC, FormEventHandler, useState } from "react";
import { getSession } from "../session";
import { SubmitButton, TextField } from "./ui/forms";

const session = getSession();
export const ConnectForm: FC = (props) => {
  const [idp, setIdp] = useState("https://solidcommunity.net");
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <span className="animate-spin">Loading...</span>;
  }

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    setLoading(true);

    session.login({ oidcIssuer: idp });
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
          <option value="https://inrupt.net"/>
          <option value="https://solidcommunity.net"/>
        </datalist>
        <SubmitButton value="Connect" className="p-5"/>
      </form>
    </>
  );
};