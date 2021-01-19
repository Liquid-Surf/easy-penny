import { FetchError, getBooleanAll, getDatetimeAll, getDecimalAll, getIntegerAll, getStringNoLocaleAll, getTermAll, getUrlAll, removeBoolean, removeDatetime, removeDecimal, removeInteger, removeStringNoLocale, removeUrl, setThing, solidDatasetAsMarkdown, thingAsMarkdown, ThingPersisted, UrlString } from "@inrupt/solid-client";
import { FC } from "react";
import { MdLink, MdTextFields } from "react-icons/md";
import { VscCalendar, VscQuestion, VscSymbolBoolean, VscTrash } from "react-icons/vsc";
import { toast } from "react-toastify";
import { LoadedCachedDataset } from "../hooks/dataset";
import { Url } from "./data/Url";
import { ObjectAdder } from "./ObjectAdder";
import { ObjectViewer } from "./ObjectViewer";
import { PredicateUrl } from "./PredicateUrl";
import { LoggedIn } from "./LoggedIn";

interface Props {
  dataset: LoadedCachedDataset;
  thing: ThingPersisted;
  predicate: UrlString;
  onUpdate: (previousThing: ThingPersisted) => void;
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
      <li className="pl-0">
        <ObjectViewer type={<VscQuestion/>}>Data of unknown type.</ObjectViewer>
      </li>
    )
    : null;

  const updateThing = async (updatedThing: ThingPersisted) => {
    const updatedDataset = setThing(props.dataset.data, updatedThing);
    try {
      await props.dataset.save(updatedDataset);
      props.onUpdate(props.thing);
    } catch (e) {
      if (e instanceof FetchError && e.statusCode === 403) {
        toast("You do not have permission to do that.", { type: "error" });
      } else {
        throw e;
      }
    }
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
          {urlValues.sort().map(value => (
            <li key={value + "_urlObject"} className="pl-0">
              <ObjectViewer
                type={<MdLink/>}
                options={[
                  {
                    element: <VscTrash title={`Delete "${value}"`} aria-label={`Delete "${value}"`}/>,
                    callback: () => deleteUrl(value),
                    loggedIn: true,
                  },
                ]}
              >
                <Url url={value}/>
              </ObjectViewer>
            </li>
          ))}

          {stringNoLocaleValues.sort().map(value => (
            <li key={value + "_stringNoLocaleObject"} className="pl-0">
              <ObjectViewer
                type={<MdTextFields/>}
                options={[
                  {
                    element: <VscTrash title={`Delete "${value}"`} aria-label={`Delete "${value}"`}/>,
                    callback: () => deleteStringNoLocale(value),
                    loggedIn: true,
                  },
                ]}
              >
                {value}
              </ObjectViewer>
            </li>
          ))}

          {integerValues.sort().map(value => (
            <li key={value + "_integerObject"} className="pl-0">
              <ObjectViewer
                type={<>1</>}
                options={[
                  {
                    element: <VscTrash title={`Delete "${value}"`} aria-label={`Delete "${value}"`}/>,
                    callback: () => deleteInteger(value),
                    loggedIn: true,
                  },
                ]}
              >
                {value}
              </ObjectViewer>
            </li>
          ))}

          {decimalValues.sort().map(value => (
            <li key={value + "_decimalObject"} className="pl-0">
              <ObjectViewer
                type={<>1.0</>}
                options={[
                  {
                    element: <VscTrash title={`Delete "${value}"`} aria-label={`Delete "${value}"`}/>,
                    callback: () => deleteDecimal(value),
                    loggedIn: true,
                  },
                ]}
              >
                {Number.isInteger(value) ? value.toFixed(1) : value.toString()}
              </ObjectViewer>
            </li>
          ))}

          {datetimeValues.sort((a, b) => a.getTime() - b.getTime()).map(value => (
            <li key={value.toISOString() + "_datetimeObject"} className="pl-0">
              <ObjectViewer
                type={<><VscCalendar/></>}
                options={[
                  {
                    element: <VscTrash title={`Delete "${value.toLocaleString()}"`} aria-label={`Delete "${value.toLocaleString()}"`}/>,
                    callback: () => deleteDatetime(value),
                    loggedIn: true,
                  },
                ]}
              >
                <time title={value.toISOString()} dateTime={value.toISOString()}>{value.toLocaleString()}</time>
              </ObjectViewer>
            </li>
          ))}

          {booleanValues.map(value => (
            <li key={value.toString() + "_booleanObject"} className="pl-0">
              <ObjectViewer
                type={<><VscSymbolBoolean/></>}
                options={[
                  {
                    element: <VscTrash title={`Delete "${value}"`} aria-label={`Delete "${value}"`}/>,
                    callback: () => deleteBoolean(value),
                    loggedIn: true,
                  },
                ]}
              >
                {value}
              </ObjectViewer>
            </li>
          ))}

          {unknownObject}

          <LoggedIn>
            <ObjectAdder {...props}/>
          </LoggedIn>

        </ul>
      </dd>
    </dl>
  );
};