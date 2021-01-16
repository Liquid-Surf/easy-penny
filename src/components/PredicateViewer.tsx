import { getBooleanAll, getDatetimeAll, getDecimalAll, getIntegerAll, getStringNoLocaleAll, getTermAll, getUrlAll, removeBoolean, removeDatetime, removeDecimal, removeInteger, removeStringNoLocale, removeUrl, setThing, ThingPersisted, UrlString } from "@inrupt/solid-client";
import { FC } from "react";
import { MdLink, MdRemove, MdTextFields } from "react-icons/md";
import { VscCalendar, VscQuestion, VscSymbolBoolean } from "react-icons/vsc";
import { LoadedCachedDataset } from "../hooks/dataset";
import { Url } from "./data/Url";
import { ObjectViewer } from "./ObjectViewer";
import { PredicateUrl } from "./PredicateUrl";

interface Props {
  dataset: LoadedCachedDataset;
  thing: ThingPersisted;
  predicate: UrlString;
}

export const PredicateViewer: FC<Props> = (props) => {
  const urlValues = getUrlAll(props.thing, props.predicate);
  const stringNoLocaleValues = getStringNoLocaleAll(props.thing, props.predicate);
  const integerValues = getIntegerAll(props.thing, props.predicate);
  const decimalValues = getDecimalAll(props.thing, props.predicate);
  const datetimeValues = getDatetimeAll(props.thing, props.predicate);
  const booleanValues = getBooleanAll(props.thing, props.predicate);
  const allValues = getTermAll(props.thing, props.predicate);

  const dataOfUnkownType = allValues.find(term => {
    // TODO: Check for literal types we do not support.
    return term.termType !== "Literal" && term.termType !== "NamedNode";
  });
  const unknownObject = dataOfUnkownType
    ? (
      <li className="pl-4">
        <ObjectViewer type={<VscQuestion/>}>Data of unknown type.</ObjectViewer>
      </li>
    )
    : null;

  const updateThing = (updatedThing: ThingPersisted) => {
    const updatedDataset = setThing(props.dataset.data, updatedThing);
    props.dataset.save(updatedDataset);
  };

  const deleteUrl = (url: UrlString) => updateThing(removeUrl(props.thing, props.predicate, url));
  const deleteStringNoLocale = (string: string) => updateThing(removeStringNoLocale(props.thing, props.predicate, string));
  const deleteInteger = (integer: number) => updateThing(removeInteger(props.thing, props.predicate, integer));
  const deleteDecimal = (decimal: number) => updateThing(removeDecimal(props.thing, props.predicate, decimal));
  const deleteDatetime = (datetime: Date) => updateThing(removeDatetime(props.thing, props.predicate, datetime));
  const deleteBoolean = (boolean: boolean) => updateThing(removeBoolean(props.thing, props.predicate, boolean));

  return (
    <dl>
      <dt>
        <PredicateUrl url={props.predicate}/>
      </dt>
      <dd>
        <ul>
          {urlValues.map(value => (
            <li key={value} className="pl-4">
              <ObjectViewer
                type={<MdLink/>}
                options={[
                  <button onClick={(e) => {e.preventDefault(); deleteUrl(value);}} aria-label={`Remove "${value}"`}>
                    <MdRemove/>
                  </button>
                ]}
              >
                <Url url={value}/>
              </ObjectViewer>
            </li>
          ))}

          {stringNoLocaleValues.map(value => (
            <li key={value} className="pl-4">
              <ObjectViewer
                type={<MdTextFields/>}
                options={[
                  <button onClick={(e) => {e.preventDefault(); deleteStringNoLocale(value);}} aria-label={`Remove "${value}"`}>
                    <MdRemove/>
                  </button>
                ]}
              >
                {value}
              </ObjectViewer>
            </li>
          ))}

          {integerValues.map(value => (
            <li key={value} className="pl-4">
              <ObjectViewer
                type={<>1</>}
                options={[
                  <button onClick={(e) => {e.preventDefault(); deleteInteger(value);}} aria-label={`Remove "${value}"`}>
                    <MdRemove/>
                  </button>
                ]}
              >
                {value}
              </ObjectViewer>
            </li>
          ))}

          {decimalValues.map(value => (
            <li key={value} className="pl-4">
              <ObjectViewer
                type={<>1.0</>}
                options={[
                  <button onClick={(e) => {e.preventDefault(); deleteDecimal(value);}} aria-label={`Remove "${value}"`}>
                    <MdRemove/>
                  </button>
                ]}
              >
                {value}
              </ObjectViewer>
            </li>
          ))}

          {datetimeValues.map(value => (
            <li key={value} className="pl-4">
              <ObjectViewer
                type={<><VscCalendar/></>}
                options={[
                  <button onClick={(e) => {e.preventDefault(); deleteDatetime(value);}} aria-label={`Remove "${value.toLocaleString()}"`}>
                    <MdRemove/>
                  </button>
                ]}
              >
                <time title={value.toISOString()} dateTime={value.toISOString()}>{value.toLocaleString()}</time>
              </ObjectViewer>
            </li>
          ))}

          {booleanValues.map(value => (
            <li key={value} className="pl-4">
              <ObjectViewer
                type={<><VscSymbolBoolean/></>}
                options={[
                  <button onClick={(e) => {e.preventDefault(); deleteBoolean(value);}} aria-label={`Remove "${value.toLocaleString()}"`}>
                    <MdRemove/>
                  </button>
                ]}
              >
                {value}
              </ObjectViewer>
            </li>
          ))}

          {unknownObject}

        </ul>
      </dd>
    </dl>
  );
};