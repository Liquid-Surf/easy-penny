import { login } from "@inrupt/solid-client-authn-browser";
import React, {
  FC,
  FormEventHandler,
  MouseEventHandler,
  useState,
} from "react";
import { toast } from "react-toastify";
import { fetchIdps } from "../../functions/fetchIdp";
import * as storage from "../../functions/localStorage";
import { useSessionInfo } from "../../hooks/sessionInfo";
import { ClientLocalized } from "../ClientLocalized";
import { SubmitButton, TextField } from "../ui/forms";
import { Spinner } from "../ui/Spinner";

export const ConnectForm: FC = (props) => {
  const suggestedSolidServer =
    typeof document !== "undefined"
      ? new URLSearchParams(document.location.search).get("solid_server")
      : null;
  const [idp, setIdp] = useState(
    suggestedSolidServer ??
      storage.getItem("last-successful-idp") ??
      "https://solidcommunity.net"
  );
  const [loading, setLoading] = useState(false);
  const sessionInfo = useSessionInfo();

  if (loading || typeof sessionInfo === "undefined") {
    return (
      <div className="flex justify-center">
        <Spinner />
      </div>
    );
  }

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      storage.setItem("last-attempted-idp", idp);
      await login({ oidcIssuer: idp, clientName: "Penny" });
    } catch (e) {
      let toastMesagge = (
        <ClientLocalized
          id="connecterror-no-pod"
          vars={{ "pod-url": idp }}
          elems={{ "pod-url": <samp className="font-mono" /> }}
        >
          <span>
            Could not find a Solid Pod at{" "}
            <samp className="font-mono">{idp}</samp>. Please check the name and
            try again.
          </span>
        </ClientLocalized>
      );
      const detectedIdps = await fetchIdps(idp);
      if (detectedIdps.length > 0) {
        // If the user has one or more Solid Identity Providers listed in their profile doc,
        // pick a random one to suggest (if the user has multiple Identity Providers,
        // they'll probably know to enter its URL rather than their WebID):
        const detectedIdp = detectedIdps[0];
        const connectToDetectedIdp: MouseEventHandler = (event) => {
          event.preventDefault();
          setIdp(detectedIdp);
          storage.setItem("last-attempted-idp", detectedIdp);
          login({ oidcIssuer: detectedIdp, clientName: "Penny" });
        };
        toastMesagge = (
          <ClientLocalized
            id="connecterror-webid"
            vars={{ "pod-url": idp, "detected-pod-url": detectedIdp }}
            elems={{
              "pod-url": <samp className="font-mono" />,
              "idp-button": (
                <button
                  className="text-left underline hover:text-coolGray-300"
                  onClick={connectToDetectedIdp}
                />
              ),
            }}
          >
            <span>
              It looks like your Pod is located at{" "}
              <samp className="font-mono">{detectedIdp}</samp> Use that to
              connect your Pod?
            </span>
          </ClientLocalized>
        );
      }
      if (["https://pod.inrupt.com", "https://inrupt.com"].includes(idp)) {
        const suggestedServer = "https://broker.pod.inrupt.com";
        const connectToInrupt: MouseEventHandler = (event) => {
          event.preventDefault();
          setIdp(suggestedServer);
          storage.setItem("last-attempted-idp", suggestedServer);
          login({ oidcIssuer: suggestedServer, clientName: "Penny" });
        };
        toastMesagge = (
          <ClientLocalized
            id="connecterror-not-inrupt"
            vars={{ "pod-url": idp, "suggested-pod-url": suggestedServer }}
            elems={{
              "pod-url": <samp className="font-mono" />,
              "inrupt-button": (
                <button
                  className="text-left underline hover:text-coolGray-300"
                  onClick={connectToInrupt}
                />
              ),
            }}
          >
            <span>
              Could not find a Solid Pod to connect to. Did you mean{" "}
              {suggestedServer}?
            </span>
          </ClientLocalized>
        );
      }
      if (idp === "https://solid.community") {
        const suggestedServer = "https://solidcommunity.net";
        const connectToSolidCommunity: MouseEventHandler = (event) => {
          event.preventDefault();
          setIdp(suggestedServer);
          storage.setItem("last-attempted-idp", suggestedServer);
          login({ oidcIssuer: suggestedServer, clientName: "Penny" });
        };
        toastMesagge = (
          <ClientLocalized
            id="connecterror-not-solidcommunity"
            vars={{ "pod-url": idp, "suggested-pod-url": suggestedServer }}
            elems={{
              "pod-url": <samp className="font-mono" />,
              "solidcommunity-button": (
                <button
                  className="text-left underline hover:text-coolGray-300"
                  onClick={connectToSolidCommunity}
                />
              ),
            }}
          >
            <span>
              Could not find a Solid Pod to connect to. Did you mean{" "}
              {suggestedServer}?
            </span>
          </ClientLocalized>
        );
      }
      toast(toastMesagge, { type: "warning" });
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="flex flex-col space-y-5 text-xl lg:text-2xl"
      >
        <ClientLocalized id="connectform-label">
          <label htmlFor="idp" className="p-x-3 text-lg lg:text-2xl font-bold">
            Connect your Pod at:
          </label>
        </ClientLocalized>
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
          <option value="https://broker.pod.inrupt.com" />
          <option value="https://solidcommunity.net" />
          <option value="https://solidweb.org" />
          <option value="https://solidweb.me" />
          <option value="https://inrupt.net" />
          <option value="https://css.verborgh.org" />
        </datalist>
        <ClientLocalized id="connectform-button" attrs={{ value: true }}>
          <SubmitButton value="Connect" className="p-3" />
        </ClientLocalized>
      </form>
    </>
  );
};
