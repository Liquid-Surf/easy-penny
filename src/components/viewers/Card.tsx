import React, { FC, useState } from "react";

import {
  getSolidDataset,
  getStringNoLocale,
  getThing,
} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { VCARD, FOAF } from "@inrupt/vocab-common-rdf";
import { CachedResource } from "../../hooks/resource";
import {
  getAssetLink,
  getBackgroundPict,
  getAvatarPict,
} from "../../functions/integrate";

interface CardProps {
  dataset: CachedResource;
  webidUrl: string;
}

export const Card: FC<CardProps> = (props) => {
  const [fn, setFn] = useState("John Doe");
  const [role, setRole] = useState("role");
  const [note, setNote] = useState("note");

  const [email, setEmail] = useState("");
  const profileDocumentURI = props.webidUrl.split("#")[0]; // remove the '#me'('#()
  const meDocumentURI = profileDocumentURI + "#me";
  const [avatarPicture, setAvatarPicture] = useState(getAssetLink("/dog.jpeg"));
  getAvatarPict(profileDocumentURI).then((url) =>
    url ? setAvatarPicture(url) : null,
  );
  const [backgroundPicture, setBackgroundPicture] = useState(
    getAssetLink("/bg.png"),
  );
  getBackgroundPict(profileDocumentURI).then((url) =>
    url ? setBackgroundPicture(url) : null,
  );

  getSolidDataset(profileDocumentURI, { fetch: fetch }).then((myDataset) => {
    const profile = getThing(myDataset, meDocumentURI)!; // need the "#me" at the end
    const fn = getStringNoLocale(profile, VCARD.fn);
    setFn(typeof fn === "string" ? fn : "John Doe");
    const role = getStringNoLocale(profile, VCARD.role)
      ? getStringNoLocale(profile, VCARD.role)
      : "";
    setRole(typeof role === "string" ? role : "");
    const note = getStringNoLocale(profile, VCARD.note)
      ? getStringNoLocale(profile, VCARD.note)
      : "";
    setNote(typeof note === "string" ? note : "");
    const email = getStringNoLocale(profile, VCARD.email)
      ? getStringNoLocale(profile, VCARD.email)
      : "";
    setEmail(typeof email === "string" ? email : "");
  });

  const mailButton = email ? (
    <button onClick={() => (location.href = `mailto:${email}`)}>
      <i className="far">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-envelope"
          viewBox="0 0 16 16"
        >
          {" "}
          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />{" "}
        </svg>
      </i>
    </button>
  ) : null;

  return (
    <>
      <div className="card">
        <div className="img-avatar">
          <img src={avatarPicture} className="rounded" width="155" />
        </div>
        <div className="card-text">
          <div
            className="portada"
            style={{ backgroundImage: `url(${backgroundPicture})` }}
          ></div>
          <div className="title-total">
            <div className="title">{role}</div>
            <h2>{fn}</h2>
            <div className="desc">{note}</div>
            <div className="actions">{mailButton}</div>
          </div>
        </div>
      </div>
    </>
  );
};
