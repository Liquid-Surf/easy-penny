import { useLocalization } from "@fluent/react";
import { FetchError } from "@inrupt/solid-client";
import { FC } from "react";
import { ConnectForm } from "../session/ConnectForm";
import { LoggedOut } from "../session/LoggedOut";

interface Props {
  error?: Error;
}

export const FetchErrorViewer: FC<Props> = (props) => {
  const { l10n } = useLocalization();

  if (!props.error) {
    return null;
  }

  if (!(props.error instanceof FetchError)) {
    return <>An unknown error occurred.</>;
  }

  if (props.error.statusCode === 401 || props.error.statusCode === 403) {
    return (
      <>
        <div className="bg-red-100 border-red-600 border-2 rounded p-5">
          {l10n.getString("fetcherror-no-permission")}
        </div>
      </>
    );
  }

  if (props.error.statusCode === 404) {
    return (
      <>
        <div className="bg-red-100 border-red-600 border-2 rounded p-5">
          {l10n.getString("fetcherror-does-not-exist")}
        </div>
      </>
    );
  }

  return (
    <>
      {l10n.getString("fetcherror-unknown", {
        statusCode: props.error.statusCode,
      })}
    </>
  );
};
