import { TemplateResult, css, html } from 'lit';

export function getChildElementsByTagName(
  element: Element | null | undefined,
  tag: string | null | undefined
): Element[] {
  if (!element || !tag) return [];
  return Array.from(element.children).filter(child => child.tagName === tag);
}

/** Common `CSS` styles used by substation subeditors */
export const styles = css`
  abbr {
    text-decoration: none;
    border-bottom: none;
  }

  .content.actionicon {
    display: grid;
    grid-gap: 12px;
    padding: 8px 12px 16px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fit, minmax(64px, auto));
  }

  .container.lnode {
    display: grid;
    grid-gap: 12px;
    padding: 8px 12px 16px;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fit, minmax(64px, auto));
  }
`;

export const powerTransformerTwoWindingIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 25 25"
>
  <line
    x1="12.5"
    y1="2"
    x2="12.5"
    y2="5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="10"
    r="5"
    stroke="currentColor"
    fill="transparent"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="15"
    r="5"
    stroke="currentColor"
    fill="transparent"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="20"
    x2="12.5"
    y2="23"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>`;

export const generalConductingEquipmentIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 25 25"
>
  <circle
    cx="12.5"
    cy="12.5"
    r="11"
    stroke-width="1.5"
    stroke="currentColor"
    fill="transparent"
  />

  <path
    d=" M 7.5 17.5
    L 12 13
    Z"
    fill="transparent"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d="	M 11 7
      L 10 8
      C 5 13, 11 20, 17 15
      L 18 14
      Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linejoin="round"
  />
  <path
    d=" M 13 9
    L 16 6
    Z"
    fill="transparent"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <path
    d=" M 16 12
    L 19 9
    Z"
    fill="transparent"
    stroke="currentColor"
    stroke-width="2"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
</svg>`;

export const disconnectorIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 25 25"
>
  <path
    d="M 12.5 2 L 12.5 8"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d=" M 12.5 23 L 12.5 18"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 12.5 18 L 8 9"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <path
    d="M 11.5 8 L 13.5 8"
    fill="transparent"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>`;

export const circuitBreakerIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 25 25"
>
  <line
    x1="12.5"
    y1="2"
    x2="12.5"
    y2="8"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="23"
    x2="12.5"
    y2="18"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="18"
    x2="8"
    y2="9"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="11.5"
    y1="7"
    x2="13.5"
    y2="9"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="11.5"
    y1="9"
    x2="13.5"
    y2="7"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>`;

export const currentTransformerIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 25 25"
>
  <line
    x1="12.5"
    y1="2"
    x2="12.5"
    y2="23"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="12.5"
    r="7.5"
    stroke="currentColor"
    fill="transparent"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>`;

export const voltageTransformerIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 25 25"
>
  <line
    x1="12.5"
    y1="2"
    x2="12.5"
    y2="5"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="10"
    r="5"
    stroke="currentColor"
    fill="transparent"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <circle
    cx="12.5"
    cy="15"
    r="5"
    stroke="currentColor"
    fill="transparent"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="12.5"
    y1="20"
    x2="12.5"
    y2="23"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
  <line
    x1="11"
    y1="23"
    x2="14"
    y2="23"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
  />
</svg>`;

export const earthSwitchIcon = html`<svg
  viewBox="0 0 25 25"
  xmlns="http://www.w3.org/2000/svg"
>
  <line
    x1="12.5"
    x2="12.5"
    y1="19.2"
    y2="16.2"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    x1="12.5"
    x2="12.5"
    y1="1.25"
    y2="6.25"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    x1="12.5"
    x2="8"
    y1="16.2"
    y2="7.25"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    x1="13.5"
    x2="11.5"
    y1="6.25"
    y2="6.25"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    x1="17"
    x2="8"
    y1="19.2"
    y2="19.2"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    x1="15.5"
    x2="9.5"
    y1="21.4"
    y2="21.4"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <line
    x1="14.5"
    x2="10.5"
    y1="23.5"
    y2="23.5"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
</svg>`;

const typeIcons: Partial<Record<string, TemplateResult>> = {
  CBR: circuitBreakerIcon,
  DIS: disconnectorIcon,
  CTR: currentTransformerIcon,
  VTR: voltageTransformerIcon,
  ERS: earthSwitchIcon,
};

export function crossProduct<T>(...arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (a, b) => <T[][]>a.flatMap(d => b.map(e => [d, e].flat())),
    [[]]
  );
}

function getLogicalNodeInstance(lNode: Element | null): Element | null {
  if (!lNode) return null;
  const [lnInst, lnClass, iedName, ldInst, prefix] = [
    'lnInst',
    'lnClass',
    'iedName',
    'ldInst',
    'prefix',
  ].map(attribute => lNode?.getAttribute(attribute));
  const iedSelector = [`IED[name="${iedName}"]`, 'IED'];
  const lDevicePath = ['AccessPoint > Server'];
  const lNSelector = [
    `LDevice[inst="${ldInst}"] > LN[inst="${lnInst}"][lnClass="${lnClass}"]`,
  ];
  const lNPrefixSelector =
    prefix && prefix !== ''
      ? [`[prefix="${prefix}"]`]
      : ['[prefix=""]', ':not(prefix)'];
  return lNode.ownerDocument.querySelector(
    crossProduct(
      iedSelector,
      [' > '],
      lDevicePath,
      [' > '],
      lNSelector,
      lNPrefixSelector
    )
      .map(strings => strings.join(''))
      .join(',')
  );
}

function getSwitchTypeValueFromDTT(lNorlNode: Element): string | undefined {
  const rootNode = lNorlNode?.ownerDocument;
  const lNodeType = lNorlNode.getAttribute('lnType');
  const lnClass = lNorlNode.getAttribute('lnClass');
  const dObj = rootNode.querySelector(
    `DataTypeTemplates > LNodeType[id="${lNodeType}"][lnClass="${lnClass}"] > DO[name="SwTyp"]`
  );
  if (dObj) {
    const dORef = dObj.getAttribute('type');
    return rootNode
      .querySelector(
        `DataTypeTemplates > DOType[id="${dORef}"] > DA[name="stVal"] > Val`
      )
      ?.innerHTML.trim();
  }
  // definition missing
  return undefined;
}

function getSwitchTypeValue(lN: Element): string | undefined {
  const daInstantiated = lN.querySelector(
    'DOI[name="SwTyp"] > DAI[name="stVal"]'
  );
  // definition is on instantiated object
  if (daInstantiated) {
    return daInstantiated.querySelector('Val')?.innerHTML.trim();
    // definition must be on the data object type
  }

  return getSwitchTypeValueFromDTT(lN);
}

function containsEarthSwitchDefinition(condEq: Element): boolean {
  const lNodeXSWI = condEq.querySelector('LNode[lnClass="XSWI"]');
  const lN = getLogicalNodeInstance(lNodeXSWI);
  let swTypVal;
  if (lN) {
    swTypVal = getSwitchTypeValue(lN);
  } else if (lNodeXSWI) {
    swTypVal = getSwitchTypeValueFromDTT(lNodeXSWI);
  }
  return swTypVal
    ? ['Earthing Switch', 'High Speed Earthing Switch'].includes(swTypVal)
    : false;
}

function containsGroundedTerminal(condEq: Element): boolean {
  return Array.from(condEq.querySelectorAll('Terminal')).some(
    t => t.getAttribute('cNodeName') === 'grounded'
  );
}

export function typeStr(condEq: Element): string {
  if (
    condEq.getAttribute('type') === 'DIS' &&
    (containsGroundedTerminal(condEq) || containsEarthSwitchDefinition(condEq))
  ) {
    // these checks only carried out for a three phase system
    return 'ERS';
  }

  return condEq.getAttribute('type') ?? '';
}

export function getIcon(condEq: Element): TemplateResult {
  return typeIcons[typeStr(condEq)] ?? generalConductingEquipmentIcon;
}

/* eslint-disable no-undef */
interface WizardRequestBase {
  subWizard?: boolean;
}

export interface EditWizardRequest extends WizardRequestBase {
  element: Element;
}

export interface CreateWizardRequest extends WizardRequestBase {
  parent: Element;
  tagName: string;
}

export type WizardRequest = EditWizardRequest | CreateWizardRequest;

export function isEditRequest(wizard: any): wizard is EditWizardRequest {
  return 'element' in wizard && 'tagName' in wizard;
}

export function isCreateRequest(wizard: any): wizard is CreateWizardRequest {
  return 'parent' in wizard;
}

type EditWizardEvent = CustomEvent<EditWizardRequest>;
type CreateWizardEvent = CustomEvent<CreateWizardRequest>;
export type WizardEvent = EditWizardEvent | CreateWizardEvent;

type CloseWizardEvent = CustomEvent<WizardRequest>;

export function newEditWizardEvent(
  element: Element,
  subWizard?: boolean,
  eventInitDict?: CustomEventInit<Partial<EditWizardRequest>>
): EditWizardEvent {
  return new CustomEvent<EditWizardRequest>('oscd-edit-wizard-request', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { element, subWizard, ...eventInitDict?.detail },
  });
}

export function newCreateWizardEvent(
  parent: Element,
  tagName: string,
  subWizard?: boolean,
  eventInitDict?: CustomEventInit<Partial<CreateWizardRequest>>
): CreateWizardEvent {
  return new CustomEvent<CreateWizardRequest>('oscd-create-wizard-request', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: {
      parent,
      tagName,
      subWizard,
      ...eventInitDict?.detail,
    },
  });
}

export function newCloseWizardEvent(
  wizard: WizardRequest,
  eventInitDict?: CustomEventInit<Partial<WizardRequest>>
): CloseWizardEvent {
  return new CustomEvent<WizardRequest>('oscd-close-wizard', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: wizard,
  });
}

declare global {
  interface ElementEventMap {
    ['oscd-edit-wizard-request']: EditWizardRequest;
    ['oscd-create-wizard-request']: CreateWizardRequest;
    ['oscd-close-wizard']: WizardEvent;
  }
}
