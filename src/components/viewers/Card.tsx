import React, { FC, useState } from "react";

import {
  asUrl,
  FetchError,
  getContainedResourceUrlAll,
  getSolidDataset,
  getSourceUrl,
  getStringNoLocale,
  getThingAll,
  getThing,
  isContainer,
  setThing,
  SolidDataset,
  Thing,
  ThingPersisted,
  UrlString,
  WithResourceInfo,
} from "@inrupt/solid-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import { VCARD, FOAF } from "@inrupt/vocab-common-rdf";
import { LoadedCachedDataset } from "../../hooks/dataset";

interface CardProps {
  dataset: LoadedCachedDataset | null;
  webidUrl: string;
}

export const Card: FC<CardProps> = (props) => {
  if (props.dataset) {
    // console.log("DS", props.dataset.data)
    //  const myDataset = getThingAll(props.dataset.data);
    //  const profile = getThing(myDataset, props.webidUrl);
    //  console.log('profile')
    //  console.log(profile)
    //    const fn = getStringNoLocale(profile, VCARD.fn);
    //    const role = getStringNoLocale(profile, VCARD.role);
  }

  const [fn, setFn] = useState("...");
  const [role, setRole] = useState("role");
  const [note, setNote] = useState("note");
  const profileDocumentURI = props.webidUrl.split("#")[0]; // remove the '#me'('#()
  console.log("profileDocumentURI", profileDocumentURI);
  getSolidDataset(profileDocumentURI, { fetch: fetch }).then((myDataset) => {
    console.log("ds", myDataset);
    const profile = getThing(myDataset, profileDocumentURI);

    setFn(getStringNoLocale(profile, VCARD.fn));
    setRole(getStringNoLocale(profile, VCARD.role));
    setNote(getStringNoLocale(profile, VCARD.note));
    console.log("fn", fn);
  });

  //  // Get the Profile data from the retrieved SolidDataset
  //  const profile = getThing(myDataset, props.webidUrl);

  //  const fn = getStringNoLocale(profile, VCARD.fn);
  //  const role = getStringNoLocale(profile, VCARD.role);

  return (
    <>
      <div class="card">
        <div class="img-avatar">
          <img
            src="http://localhost:3055/d/public/lif.jpg"
            class="rounded"
            width="155"
          />
        </div>
        <div class="card-text">
          <div class="portada"> </div>
          <div class="title-total">
            <div class="title">{role}</div>
            <h2>{fn}</h2>
            <div class="desc">{note}</div>
            <div class="actions">
              <button>
                <i class="far fa-heart">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-heart"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z" />{" "}
                  </svg>
                </i>
              </button>
              <button>
                <i class="far fa-envelope">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-envelope"
                    viewBox="0 0 16 16"
                  >
                    {" "}
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />{" "}
                  </svg>
                </i>
              </button>
              <button>
                <i class="fas fa-user-friends">
                  <svg
                    width="24"
                    height="24"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {" "}
                    <path
                      d="M17 10H20M23 10H20M20 10V7M20 10V13"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                    <path
                      d="M1 20V19C1 15.134 4.13401 12 8 12V12C11.866 12 15 15.134 15 19V20"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                    <path
                      d="M8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12Z"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />{" "}
                  </svg>
                </i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
