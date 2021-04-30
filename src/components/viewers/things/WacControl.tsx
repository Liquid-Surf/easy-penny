import { Localized, useLocalization } from "@fluent/react";
import { addUrl, getSourceUrl, getThingAll, getUrl, getUrlAll, removeAll, removeUrl, setThing, setUrl, SolidDataset, ThingPersisted, UrlString, WebId, WithResourceInfo } from "@inrupt/solid-client";
import { useIsSSR } from "@react-aria/ssr";
import Link from "next/link";
import { acl, foaf, rdf } from "rdf-namespaces";
import React, { FC, FormEventHandler, useState } from "react";
import { MdCheck } from "react-icons/md";
import { VscTrash } from "react-icons/vsc";
import { toast } from "react-toastify";
import { getExplorePath } from "../../../functions/integrate";
import { LoadedCachedDataset } from "../../../hooks/dataset";
import { Url } from "../../data/Url";
import { Toggle } from "../../ui/Toggle";

interface Props {
  dataset: LoadedCachedDataset;
  thing: ThingPersisted;
  onUpdate: (previousThing: ThingPersisted) => void;
}

export const WacControl: FC<Props> = (props) => {
  const types = getUrlAll(props.thing, rdf.type);
  const targetResourceUrl = getUrl(props.thing, acl.accessTo) ?? getUrl(props.thing, acl.default__workaround);
  const { l10n } = useLocalization();

  type Target = "self" | "children";
  const isCurrentTarget = (target: Target): boolean => {
    if (target === "self") {
      return getUrl(props.thing, acl.accessTo) !== null;
    }
    if (target === "children") {
      return getUrl(props.thing, acl.default__workaround) !== null;
    }
    return false as never;
  };

  type Mode = "read" | "append" | "write" | "control";
  const possibleModes: Array<Mode> = ["read", "append", "write", "control"];
  const isCurrentMode = (mode: Mode): boolean => {
    const currentModes = getUrlAll(props.thing, acl.mode);
    if (mode === "read") {
      return currentModes.includes(acl.Read);
    }
    if (mode === "append") {
      return currentModes.includes(acl.Append) || currentModes.includes(acl.Write);
    }
    if (mode === "write") {
      return currentModes.includes(acl.Write);
    }
    if (mode === "control") {
      return currentModes.includes(acl.Control);
    }
    return false as never;
  };
  const currentModes: Array<Mode> = [];
  possibleModes.forEach(mode => {
    if(isCurrentMode(mode)) {
      currentModes.push(mode);
    }
  });

  type AgentClass = "Agent";
  const isCurrentAgentClass = (agentClass: AgentClass): boolean => {
    if (agentClass === "Agent") {
      return getUrlAll(props.thing, acl.agentClass).includes(foaf.Agent);
    }
    return false as never;
  };

  async function saveControl(control: ThingPersisted) {
    const updatedDataset = setThing(props.dataset.data, control);
    if (!hasAtLeastOneController(updatedDataset)) {
      toast(l10n.getString("wac-control-toast-error-no-controller"), { type: "error" });
      return;
    }
    await props.dataset.save(updatedDataset);
    props.onUpdate(props.thing);
  }

  if (!types.includes(acl.Authorization) || targetResourceUrl === null) {
    return null;
  }

  const setTarget = (target: Target, enable: boolean) => {
    const resourceIri = getUrl(props.thing, acl.accessTo) ?? getUrl(props.thing, acl.default__workaround);
    const predicate = target === "self" ? acl.accessTo : acl.default__workaround;

    if (typeof resourceIri !== "string") {
      toast(l10n.getString("wac-control-toast-error-no-resource"), { type: "error" });
      return;
    }
    const updatedControl = enable ? setUrl(props.thing, predicate, resourceIri) : removeAll(props.thing, predicate);
    saveControl(updatedControl);
  };

  const setMode = (mode: Mode, enable: boolean) => {
    let modeIri = acl.Read;
    if (mode === "append") {
      modeIri = acl.Append;
    }
    if (mode === "write") {
      modeIri = acl.Write;
    }
    if (mode === "control") {
      modeIri = acl.Control;
    }
    let updatedControl = enable ? addUrl(props.thing, acl.mode, modeIri) : removeUrl(props.thing, acl.mode, modeIri);
    if (mode === "append" && enable === false) {
      updatedControl = removeUrl(updatedControl, acl.mode, acl.Write);
    }
    if (mode === "write" && enable === false && !getUrlAll(updatedControl, acl.mode).includes(acl.Append)) {
      // Removing Write Access should not result in removing Append access:
      updatedControl = addUrl(updatedControl, acl.mode, acl.Append);
    }
    saveControl(updatedControl);
  };

  const setAgentClass = (agentClass: AgentClass, enable: boolean) => {
    const agentClassIri = foaf.Agent;

    const updatedControl = enable
      ? addUrl(props.thing, acl.agentClass, agentClassIri)
      : removeUrl(props.thing, acl.agentClass, agentClassIri);
    saveControl(updatedControl);
  };

  const addAgent = (agent: WebId) => {
    const updatedControl = addUrl(props.thing, acl.agent, agent);
    saveControl(updatedControl);
  };

  const removeAgent = (agent: WebId) => {
    const updatedControl = removeUrl(props.thing, acl.agent, agent);
    saveControl(updatedControl);
  };

  return (
    <section className="p-5 bg-blue-200">
      <header className="text-xl flex w-100 font-bold">
        <Localized id="wac-control-title">
          <div className="">Access Control for:</div>
        </Localized>&nbsp;
        <Link href={getExplorePath(targetResourceUrl)}>
          <a className="focus:underline hover:text-coolGray-700">{targetResourceUrl}</a>
        </Link>
      </header>
      <div className="flex flex-row py-5">
        <Localized id="wac-control-target-label">
          <div className="w-36 pr-5 py-2">
            Applies to:
          </div>
        </Localized>
        <div className="flex flex-col items-start justify-center">
          <div className={`flex space-x-1 py-2`}>
            <Toggle
              onChange={enabled => setTarget("self", enabled)}
              toggled={isCurrentTarget("self")}
            >
              <Localized id="wac-control-target-option-self">
                <span>
                  The Resource
                </span>
              </Localized>
            </Toggle>
          </div>
          <div className={`flex space-x-1 py-2`}>
            <Toggle
              onChange={enabled => setTarget("children", enabled)}
              toggled={isCurrentTarget("children")}
            >
              <Localized id="wac-control-target-option-children">
                <span>
                  Contained Resources
                </span>
              </Localized>
            </Toggle>
          </div>
        </div>
      </div>
      <div className="flex flex-row py-5">
        <Localized id="wac-control-mode-label">
          <div className="w-36 pr-5 py-2">
            Grants:
          </div>
        </Localized>
        <div className="flex flex-col items-start justify-center lg:flex-wrap">
          <div className={`flex space-x-1 py-2`}>
            <Toggle
              onChange={enabled => setMode("read", enabled)}
              toggled={isCurrentMode("read")}
            >
              <Localized id="wac-control-mode-option-read">
                <span>
                  Read
                </span>
              </Localized>
            </Toggle>
          </div>
          <div className={`flex space-x-1 py-2`}>
            <Toggle
              onChange={enabled => setMode("append", enabled)}
              toggled={isCurrentMode("append")}
            >
              <Localized id="wac-control-mode-option-append">
                <span>
                  Append
                </span>
              </Localized>
            </Toggle>
          </div>
          <div className={`flex space-x-1 py-2`}>
            <Toggle
              onChange={enabled => setMode("write", enabled)}
              toggled={isCurrentMode("write")}
            >
              <Localized id="wac-control-mode-option-write">
                <span>
                  Write
                </span>
              </Localized>
            </Toggle>
          </div>
          <div className={`flex space-x-1 py-2`}>
            <Toggle
              onChange={enabled => setMode("control", enabled)}
              toggled={isCurrentMode("control")}
            >
              <Localized id="wac-control-mode-option-control">
                <span>
                  Control
                </span>
              </Localized>
            </Toggle>
          </div>
        </div>
      </div>
      <div className="flex flex-row py-5">
        <Localized id="wac-control-agentClass-label">
          <div className="w-36 pr-5 py-2">
            To:
          </div>
        </Localized>
        <div className="flex flex-col items-start justify-center">
          <div className={`flex space-x-1 py-2`}>
            <Toggle
              onChange={enabled => setAgentClass("Agent", enabled)}
              toggled={isCurrentAgentClass("Agent")}
            >
              <Localized id="wac-control-agentClass-option-agent">
                <span>
                  Everyone
                </span>
              </Localized>
            </Toggle>
          </div>
        </div>
      </div>
      <div className="flex flex-row py-5">
        <Localized id="wac-control-agent-label">
          <div className="w-36 pr-5 py-2">
            And Agents:
          </div>
        </Localized>
        <div className="flex-grow space-y-2 items-start justify-center">
          {getUrlAll(props.thing, acl.agent).map(agent => {
            return (
              <div className="flex items-center space-x-2 pl-2">
                <code
                  className="font-mono p-2 truncate w-0 flex-grow"
                  title={agent}
                >
                  <Url url={agent} sourceUrl={getSourceUrl(props.dataset.data)} openInline={true}/>
                </code>
                <button
                  className="p-3 hover:text-white hover:bg-coolGray-700 focus:outline-none focus:ring-2 focus:ring-coolGray-700 rounded"
                  onClick={(event) => {event.preventDefault(); removeAgent(agent);}}
                >
                  <Localized id="wac-control-agent-remove-icon" attrs={{ "aria-label": true }} vars={{ agent: agent }}>
                    <VscTrash aria-label={`Remove \`${agent}\``}/>
                  </Localized>
                </button>
              </div>
            );
          })}
          <AgentAdder onSubmit={addAgent}/>
        </div>
      </div>
    </section>
  );
};

type AgentAdderProps = {
  onSubmit: (agentUrl: WebId) => void;
};
const AgentAdder: FC<AgentAdderProps> = (props) => {
  const [webId, setWebId] = useState("");
  const onSubmit: FormEventHandler = (event) => {
    event.preventDefault();

    props.onSubmit(webId);
    setWebId("");
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center space-x-2">
      <label htmlFor="webId" className="sr-only">WebID:</label>
      <input
        type="url"
        name="webId"
        id="webId"
        className="bg-blue-50 rounded flex-grow p-2 focus:outline-none focus:ring-2 focus:ring-coolGray-700"
        placeholder="e.g. https://example.com/profile/card#me"
        value={webId}
        onChange={(event) => setWebId(event.target.value)}
      />
      <Localized id="wac-control-agent-add-button" attrs={{title: true}}>
        <button
          type="submit"
          className="p-3 hover:text-white hover:bg-coolGray-700 focus:outline-none focus:ring-2 focus:ring-coolGray-700 rounded"
          title="Add Agent"
        >
          <Localized id="wac-control-agent-add-icon" attrs={{"aria-label": true}}>
            <MdCheck aria-label="Add"/>
          </Localized>
        </button>
      </Localized>
    </form>
  );
};

function hasAtLeastOneController(dataset: SolidDataset & WithResourceInfo): boolean {
  const things = getThingAll(dataset);
  return things.some(thing => {
    const isControl = getUrlAll(thing, rdf.type).includes(acl.Authorization);
    const hasControlMode = getUrlAll(thing, acl.mode).includes(acl.Control);
    const appliesToSelf = getUrl(thing, acl.accessTo) !== null;
    const listsAgent = (
      getUrl(thing, acl.agent) !== null ||
      getUrl(thing, acl.agentGroup) !== null ||
      getUrlAll(thing, acl.agentClass).includes(foaf.Agent) ||
      getUrlAll(thing, acl.agentClass).includes(acl.AuthenticatedAgent)
    );
    return isControl && hasControlMode && appliesToSelf && listsAgent;
  });
}
