import { FC, FormEventHandler, useEffect, useState } from "react";
import { useSessionInfo } from "../hooks/sessionInfo";
import { getSession } from "../session";
import { SubmitButton, TextField } from "./ui/forms";

const session = getSession();
export const SessionGate: FC = (props) => {
  const [idp, setIdp] = useState("https://solidcommunity.net");
  const [loading, setLoading] = useState(false);
  const sessionInfo = useSessionInfo();

  if (loading) {
    return <>...</>;
  }

  if (sessionInfo) {
    return <>{props.children}</>;
  }

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    setLoading(true);

    session.login({ oidcIssuer: idp });
  };

  return (
    <>
      <div className="shadow text-3xl p-5">
        <form onSubmit={onSubmit} className="flex flex-col space-y-5">
          <label htmlFor="idp" className="p-x-5">
            Connect your Pod at:
          </label>
          <TextField
            id="idp"
            type="url"
            value={idp}
            onChange={setIdp}
            className="p-5"
          />
          <SubmitButton value="Connect" className="p-5"/>
        </form>
      </div>
    </>
  );
};