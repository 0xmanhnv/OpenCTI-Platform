import React from 'react';
import { filter, includes, map } from 'ramda';

export const UserContext = React.createContext({});

export const BYPASS = 'BYPASS';
export const KNOWLEDGE = 'KNOWLEDGE';
export const KNOWLEDGE_KNUPDATE = 'KNOWLEDGE_KNUPDATE';
export const KNOWLEDGE_KNUPDATE_KNDELETE = 'KNOWLEDGE_KNUPDATE_KNDELETE';
export const KNOWLEDGE_KNUPLOAD = 'KNOWLEDGE_KNUPLOAD';
export const KNOWLEDGE_KNASKIMPORT = 'KNOWLEDGE_KNASKIMPORT';
export const KNOWLEDGE_KNGETEXPORT = 'KNOWLEDGE_KNGETEXPORT';
export const KNOWLEDGE_KNGETEXPORT_KNASKEXPORT = 'KNOWLEDGE_KNGETEXPORT_KNASKEXPORT';
export const KNOWLEDGE_KNENRICHMENT = 'KNOWLEDGE_KNENRICHMENT';
export const EXPLORE = 'EXPLORE';
export const EXPLORE_EXUPDATE = 'EXPLORE_EXUPDATE';
export const EXPLORE_EXUPDATE_EXDELETE = 'EXPLORE_EXUPDATE_EXDELETE';
export const MODULES = 'MODULES';
export const MODULES_MODMANAGE = 'MODULES_MODMANAGE';
export const SETTINGS = 'SETTINGS';
export const SETTINGS_SETINFERENCES = 'SETTINGS_SETINFERENCES';
export const SETTINGS_SETACCESSES = 'SETTINGS_SETACCESSES';
export const SETTINGS_SETMARKINGS = 'SETTINGS_SETMARKINGS';

const granted = (me, capabilities, matchAll = false) => {
  const userCapabilities = map((c) => c.name, me.capabilities);
  if (userCapabilities.includes(BYPASS)) return true;
  const availableCapabilities = [];
  for (let index = 0; index < capabilities.length; index += 1) {
    const checkCapability = capabilities[index];
    const matchingCapabilities = filter((r) => includes(checkCapability, r), userCapabilities);
    if (matchingCapabilities.length > 0) availableCapabilities.push(checkCapability);
  }
  if (matchAll) return availableCapabilities.length === capabilities.length;
  return availableCapabilities.length > 0;
};

const Security = ({
  needs, matchAll, children, placeholder = <span />,
}) => (
  <UserContext.Consumer>
    {(me) => {
      if (granted(me, needs, matchAll)) return children;
      return placeholder;
    }}
  </UserContext.Consumer>
);

export default Security;
