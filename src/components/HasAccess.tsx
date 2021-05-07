import { getEffectiveAccess } from "@inrupt/solid-client";
import { FC } from "react";

interface Props {
  access: Array<keyof ReturnType<typeof getEffectiveAccess>['user']>;
  resource: Parameters<typeof getEffectiveAccess>[0];
};

export const HasAccess: FC<Props> = (props) => {
  const actualAccess = getEffectiveAccess(props.resource)

  const hasRequiredAccess = props.access.every(requiredAccess => actualAccess.user[requiredAccess] === true);

  if (!hasRequiredAccess) {
    return null;
  }

  return <>{props.children}</>;
};