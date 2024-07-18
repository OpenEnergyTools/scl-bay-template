/* eslint-disable lit/no-duplicate-template-bindings */
/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-return-assign */
import { css, html, LitElement, nothing, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-icon';
import type { Dialog } from '@material/mwc-dialog';
import type { OscdFilteredList } from '@openscd/oscd-filtered-list';
import type { ListItemBase } from '@material/mwc-list/mwc-list-item-base.js';

import { Insert, newEditEvent } from '@openscd/open-scd-core';

import '@openscd/oscd-tree-grid';
import type { TreeGrid } from '@openscd/oscd-tree-grid';

import './sld-viewer.js';
import { classMap } from 'lit/directives/class-map.js';
import {
  find,
  getReference,
  identity,
  importLNodeType,
  lnInstGenerator,
} from '@openenergytools/scl-lib';
import { createElement } from '@openenergytools/scl-lib/dist/foundation/utils.js';

import { newCreateWizardEvent } from './foundation.js';
import { dataAttributeTree, getSourceDef } from './dataAttributePicker.js';

let LIBDOC: XMLDocument;
let LIBDOCNAME: string;

const uri6100 = 'http://www.iec.ch/61850/2019/SCL/6-100';
const xmlnsNs = 'http://www.w3.org/2000/xmlns/';
const prefix6100 = 'eTr_6-100';

/*
const sourceRefAttributes = [
  'input',
  'inputInst',
  'desc',
  'service',
  'source',
  'resourceName',
  'pLN',
  'pDO',
  'pDA',
  'extRefAddr',
]; */

type Input = {
  source: string;
  srcRefs: Element[];
};

function compare(a: Element, b: Element): number {
  const as = `${a.getAttribute('input')}${a.getAttribute(
    'inputInst'
  )}${a.getAttribute('source')}`;

  const bs = `${b.getAttribute('input')}${b.getAttribute(
    'inputInst'
  )}${b.getAttribute('source')}`;

  if (as > bs) return 1;
  return -1;
}

function funcPath(func: Element, path: string[]): string {
  if (!func.parentElement || func.parentElement.tagName === 'SCL') {
    const name = func.getAttribute('name') ?? '';
    path.splice(0, 0, name);
    return path.join('/');
  }

  const name = func.getAttribute('name') ?? '';

  path.splice(0, 0, name);
  return funcPath(func.parentElement, path);
}

function lNodePath(lNode: Element, path: string[]): string {
  if (!lNode.parentElement || lNode.parentElement.tagName === 'SCL') {
    const name = lNode.getAttribute('name') ?? '';
    path.splice(0, 0, name);
    return path.join('/');
  }

  const name = lNode.getAttribute('name') ?? '';

  path.splice(0, 0, name);
  return lNodePath(lNode.parentElement, path);
}

function groupedSourceRefs(func: Element): Input[] {
  const uniqueSrcRefs: string[] = [];
  const inputs: Input[] = [];

  function siblingSrcRefs(source: string): Element[] {
    return Array.from(
      func.querySelectorAll(
        `:scope LNode > Private[type="eIEC61850-6-100"] > LNodeInputs > SourceRef[source="${source}"]`
      )
    );
  }

  Array.from(
    func.querySelectorAll(
      ':scope LNode > Private[type="eIEC61850-6-100"] > LNodeInputs > SourceRef'
    )
  )
    .sort(compare)
    .forEach(srcRef => {
      const source = srcRef.getAttribute('source');
      if (!source) return;

      if (!uniqueSrcRefs.includes(source)) {
        inputs.push({ source, srcRefs: siblingSrcRefs(source) });
        uniqueSrcRefs.push(source);
      }
    });

  return inputs;
}

function highlightFunc(func: Element, selectedFunc: Element): boolean {
  if (!selectedFunc) return false;

  const srcfunc = funcPath(func, []);

  return Array.from(
    selectedFunc.querySelectorAll(':scope LNode > Private SourceRef')
  ).some(srcRef => srcRef.getAttribute('source')?.startsWith(srcfunc));
}

function linkedEquipment(doc: XMLDocument, selectedFunc?: Element): Element[] {
  if (!selectedFunc) return [];

  return Array.from(
    doc.querySelectorAll(
      ':root > Substation > VoltageLevel > Bay > ConductingEquipment'
    )
  ).filter(condEq => {
    const lNodePaths = Array.from(condEq.querySelectorAll('LNode')).map(lNode =>
      lNodePath(lNode, [])
    );

    return lNodePaths.some(path =>
      Array.from(
        selectedFunc.querySelectorAll(':scope LNode > Private SourceRef')
      ).some(srcRef => srcRef.getAttribute('source')?.startsWith(path))
    );
  });
}

function parentDepth(lNode: Element): number {
  const validParent = [
    'Function',
    'SubFunction',
    'EqFunction',
    'EqSubFunction',
  ];

  let parent = lNode.parentElement;
  let i = 1;
  while (parent && validParent.includes(parent?.tagName)) {
    parent = parent.parentElement;
    // eslint-disable-next-line no-plusplus
    i++;
  }

  return i;
}

function createSingleLNode(parent: Element, ln: Element): Insert[] {
  const inserts: Insert[] = [];

  const lnClass = ln.getAttribute('lnClass');
  if (!lnClass) return [];
  const lnType = ln.getAttribute('id');
  const lnInst = lnInstGenerator(parent, 'LNode')(lnClass);
  if (!lnInst) return [];

  const node = createElement(parent.ownerDocument, 'LNode', {
    iedName: 'None',
    lnClass,
    lnInst,
    lnType,
  });
  inserts.push({
    parent,
    node,
    reference: getReference(parent, 'LNode'),
  });

  const private6100 = parent.ownerDocument.createElementNS(
    parent.ownerDocument.documentElement.namespaceURI,
    'Private'
  );
  private6100.setAttribute('type', 'eIEC61850-6-100');

  inserts.push({
    parent: node,
    node: private6100,
    reference: null,
  });

  const lNodeSpec = parent.ownerDocument.createElementNS(
    uri6100,
    `${prefix6100}:LNodeSpecNaming`
  );

  const attrs: Record<string, string> = {
    iedName: 'sIedName',
    ldInst: 'sLdInst',
    prefix: 'sPrefix',
    lnClass: 'sLnClass',
    lnInst: 'sLnInst',
  };

  Object.entries(attrs).forEach(([attr, sAttr]) => {
    const value = node.getAttribute(attr);
    if (value) lNodeSpec!.setAttributeNS(uri6100, sAttr, value);
  });

  inserts.push({ parent: private6100, node: lNodeSpec, reference: null });

  return inserts;
}

export default class SclBayTemplate extends LitElement {
  @property({ attribute: false })
  doc?: XMLDocument;

  @property()
  docs: Record<string, XMLDocument> = {};

  @state()
  lNodeTypeSrc: { name: string; src: XMLDocument }[] = [];

  @property({ attribute: false })
  get substation(): Element | null {
    return this.doc?.querySelector(':root > Substation') ?? null;
  }

  @state()
  gridSize = 32;

  @property({ type: Number })
  editCount = -1;

  @state()
  get bay(): Element | null {
    return (
      this.doc?.querySelector(':root > Substation > VoltageLevel > Bay') ?? null
    );
  }

  @state()
  parent?: Element;

  @state()
  selectedFunc?: Element;

  @state()
  selectedLNode?: Element;

  @state()
  lnodeparent?: Element;

  @state()
  selectedSourceRef?: Element;

  @state()
  selectedLibName?: string;

  inputs: Input[] = [];

  @query('#lnode-dialog') dialog!: Dialog;

  @query('#dapicker') daPickerDialog!: Dialog;

  @query('#dapicker > oscd-tree-grid') daPicker!: TreeGrid;

  @query('#service') serviceSelector!: HTMLSelectElement;

  @query('input') libInput!: HTMLInputElement;

  private openCreateWizard(tagName: string): void {
    if (this.parent)
      this.dispatchEvent(newCreateWizardEvent(this.parent, tagName));

    this.dispatchEvent(newCreateWizardEvent(this.bay!, tagName));
  }

  private removeFunction(func: Element): void {
    this.dispatchEvent(newEditEvent({ node: func }));
  }

  private removeSourceRef(srcRef: Element): void {
    this.dispatchEvent(newEditEvent({ node: srcRef }));
  }

  addFunction(): void {
    if (
      (this.parent && this.parent?.tagName === 'Bay') ||
      this.parent?.tagName === 'VoltageLevel'
    )
      this.openCreateWizard('Function');

    this.openCreateWizard('EqFunction');
  }

  addSubFunction(parent: Element): void {
    if (parent.tagName === 'Function' || parent.tagName === 'SubFunction')
      this.dispatchEvent(newCreateWizardEvent(parent, 'SubFunction'));

    this.dispatchEvent(newCreateWizardEvent(parent, 'EqSubFunction'));
  }

  createNewLNodeElements(): void {
    if (!this.lnodeparent) return;

    const list = this.dialog.querySelector('#lnList') as OscdFilteredList;

    const selectedLNs = (list.selected as ListItemBase[])
      .filter(item => !item.disabled)
      .map(item => item.value)
      .map(id => find(LIBDOC, 'LNodeType', id))
      .filter(item => item !== null) as Element[];

    const edits = selectedLNs.flatMap(ln =>
      createSingleLNode(this.lnodeparent!, ln)
    );

    edits.push(
      ...selectedLNs.flatMap(lNodeType => importLNodeType(lNodeType, this.doc!))
    );

    this.dispatchEvent(newEditEvent(edits));
  }

  openLNodeDialog(func: Element): void {
    this.dialog.show();
    this.lnodeparent = func;
  }

  private saveSourceRef(): void {
    const { paths } = this.daPicker;

    const sources = getSourceDef(paths);
    const service = this.serviceSelector.value;

    const sourceRefEdits: Insert[] = [];

    let lNodeInputs = this.selectedLNode?.querySelector(
      ':scope > Private[type="eIEC61850-6-100"] > LNodeInputs'
    );
    let private6100 = this.selectedLNode?.querySelector(
      ':scope > Private[type="eIEC61850-6-100"]'
    );
    let lNodeSpec = this.selectedLNode?.querySelector(
      ':scope > Private[type="eIEC61850-6-100"] > LNodeSpecNaming'
    );

    const addPrivate = (): void => {
      private6100 = this.doc!.createElementNS(
        this.doc!.documentElement.namespaceURI,
        'Private'
      );
      private6100.setAttribute('type', 'eIEC61850-6-100');

      sourceRefEdits.push({
        parent: this.selectedLNode!,
        node: private6100,
        reference: null,
      });
    };

    const addLNodeSpecNaming = (parent: Element): void => {
      if (!lNodeSpec) {
        lNodeSpec = this.doc!.createElementNS(
          uri6100,
          `${prefix6100}:LNodeSpecNaming`
        );

        const attrs: Record<string, string> = {
          iedName: 'sIedName',
          ldInst: 'sLdInst',
          prefix: 'sPrefix',
          lnClass: 'sLnClass',
          lnInst: 'sLnInst',
        };

        Object.entries(attrs).forEach(([attr, sAttr]) => {
          const value = this.selectedLNode!.getAttribute(attr);
          if (value) lNodeSpec!.setAttributeNS(uri6100, sAttr, value);
        });
      }

      sourceRefEdits.push({ parent, node: lNodeSpec, reference: null });
    };

    const addLNodeInputs = (parent: Element): void => {
      lNodeInputs = this.doc!.createElementNS(
        uri6100,
        `${prefix6100}:LNodeInputs`
      );

      sourceRefEdits.push({
        parent,
        node: lNodeInputs,
        reference: null,
      });
    };

    if (!private6100) addPrivate();
    if (!lNodeSpec) addLNodeSpecNaming(private6100!);
    if (!lNodeInputs) addLNodeInputs(private6100!);

    sources.forEach((source, i) => {
      const sourceRef = this.doc!.createElementNS(
        uri6100,
        `${prefix6100}:SourceRef`
      );

      const path = source.split('/');
      const input = path[path.length - 2];

      const inst =
        (this.selectedLNode?.querySelectorAll('SourceRef').length ?? 0) + i + 1;

      sourceRef.setAttributeNS(uri6100, 'source', source);
      sourceRef.setAttributeNS(uri6100, 'input', input);
      sourceRef.setAttributeNS(uri6100, 'inputInst', `${inst}`);
      sourceRef.setAttributeNS(uri6100, 'service', service);

      sourceRefEdits.push({
        parent: lNodeInputs!,
        node: sourceRef,
        reference: null,
      });
    });

    this.dispatchEvent(newEditEvent(sourceRefEdits));
  }

  private renderDataAttributePicker(): TemplateResult {
    return html` <mwc-dialog id="dapicker" heading="Add Data Attributes"
      ><select name="service" id="service">
        <option value="GOOSE">"GOOSE"</option>
        <option value="SMV">SMV</option>
        <option value="Report">Report</option>
        <option value="Poll">Poll</option>
        <option value="Wired">Wired</option>
        <option value="Internal">Internal</option>
      </select>
      <oscd-tree-grid .tree="${dataAttributeTree(this.doc!)}"></oscd-tree-grid>
      <mwc-button
        slot="secondaryAction"
        label="close"
        @click=${() => this.daPickerDialog?.close()}
      ></mwc-button>
      <mwc-button
        slot="primaryAction"
        label="save"
        icon="save"
        @click="${this.saveSourceRef}"
      ></mwc-button>
    </mwc-dialog>`;
  }

  async openDoc(event: Event): Promise<void> {
    const file = (<HTMLInputElement | null>event.target)?.files?.item(0);
    if (!file) return;

    const text = await file.text();
    const docName = file.name;
    const doc = new DOMParser().parseFromString(text, 'application/xml');

    LIBDOCNAME = docName;
    LIBDOC = doc;

    this.requestUpdate();
  }

  renderLNodeDetail(): TemplateResult {
    if (this.selectedLNode)
      return html`<div class="container lnode detail">
        <div style="display: flex;">
          <div style="flex: auto;">Input</div>
          <div style="flex: auto;">Output</div>
          <div style="flex: auto;">Settings</div>
        </div>
        <div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th scope="col">input</th>
                <th scope="col">inputInst</th>
                <th scope="col">source</th>
                <th scope="col">service</th>
                <th scope="col">desc</th>
                <th scope="col">resourceName</th>
                <th scope="col">pLN</th>
                <th scope="col">pDO</th>
                <th scope="col">pDA</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from(
                this.selectedLNode.querySelectorAll(
                  ':scope > Private[type="eIEC61850-6-100"] > LNodeInputs > SourceRef'
                )
              ).map(
                srcRef => html`<tr>
                  <th>
                    <mwc-icon-button
                      icon="delete"
                      @click="${() => this.removeSourceRef(srcRef)}"
                    ></mwc-icon-button>
                  </th>
                  <th>${srcRef.getAttribute('input')}</th>
                  <th>${srcRef.getAttribute('inputInst')}</th>
                  <th>${srcRef.getAttribute('source')}</th>
                  <th>${srcRef.getAttribute('service')}</th>
                  <th>${srcRef.getAttribute('desc')}</th>
                  <th>${srcRef.getAttribute('resourceName')}</th>
                  <th>${srcRef.getAttribute('pLN')}</th>
                  <th>${srcRef.getAttribute('pDO')}</th>
                  <th>${srcRef.getAttribute('pDA')}</th>
                </tr>`
              )}
            </tbody>
          </table>
        </div>
      </div> `;

    return html``;
  }

  renderLNodeDialog(): TemplateResult {
    let root: XMLDocument | undefined;
    if (!LIBDOC) root = this.doc;
    else root = LIBDOC;

    return html`<mwc-dialog id="lnode-dialog">
      <div id="createLNodeWizardContent">
        <div style="display: flex; flex-direction: row;">
          <oscd-filtered-list id="lnList" multi
            >${Array.from(
              root?.querySelectorAll(':root > DataTypeTemplates > LNodeType') ??
                []
            ).map(lNodeType => {
              const lnClass = lNodeType.getAttribute('lnClass');
              const id = lNodeType.getAttribute('id');

              return html`<mwc-check-list-item
                twoline
                value="${identity(lNodeType)}"
                ><span>${lnClass}</span
                ><span slot="secondary">#${id}</span></mwc-check-list-item
              >`;
            })}</oscd-filtered-list
          >
        </div>
      </div>
      <mwc-button slot="secondaryAction" dialogAction="close">
        Cancel
      </mwc-button>
      <mwc-button
        slot="primaryAction"
        dialogAction="close"
        @click="${() => this.createNewLNodeElements()}"
      >
        Save
      </mwc-button>
    </mwc-dialog> `;
  }

  // eslint-disable-next-line class-methods-use-this
  renderSourceRef(lNode: Element): TemplateResult {
    return html`${Array.from(
      lNode.querySelectorAll(
        ':scope > Private[type="eIEC61850-6-100"] SourceRef'
      )
    )
      .filter(srcRef => srcRef.getAttribute('source'))
      .map(srcRef => {
        const source = srcRef.getAttribute('source')!;

        const baseLength = 3 + parentDepth(lNode) * 20;
        const growth =
          this.inputs.findIndex(input => input.source === source) * 12;

        const left = this.inputs.length * 12 + baseLength - growth;

        return html`<abbr
          title="${srcRef.getAttribute('source')!}"
          style="position:relative;left:-${left}px;"
        >
          <div
            style="height:5px;margin:5px;background-color:#002b36;border-radius:2px;width:${left}px"
            class="${classMap({
              link: true,
              srcref: true,
              selected: srcRef === this.selectedSourceRef,
            })}"
            @click="${(evt: Event) => {
              // eslint-disable-next-line no-unused-expressions
              this.selectedSourceRef = srcRef;
              evt.stopPropagation();
            }}"
          ></div
        ></abbr>`;
      })}`;
  }

  renderLNodes(lNode: Element): TemplateResult {
    return html`<div
      class="${classMap({
        container: true,
        lnode: true,
        selected: lNode === this.selectedLNode,
      })}"
      @click="${() => {
        this.selectedLNode = lNode;
      }}"
    >
      <nav>
        <mwc-icon-button
          id="daPickerButton"
          icon="input_circle"
          @click=${() => this.daPickerDialog.show()}
        >
        </mwc-icon-button>
        <mwc-icon-button
          icon="delete"
          @click="${() => this.dispatchEvent(newEditEvent({ node: lNode }))}"
        >
        </mwc-icon-button>
      </nav>
      ${lNode.getAttribute('prefix') ?? ''}${lNode.getAttribute(
        'lnClass'
      )}${lNode.getAttribute('lnInst')}${this.renderSourceRef(lNode)}
    </div>`;
  }

  renderInputs(): TemplateResult {
    this.inputs = groupedSourceRefs(this.selectedFunc!);
    return html`${this.inputs.map(
      input =>
        html`<div
          class="${classMap({
            link: true,
            input: true,
            selected:
              !!this.selectedSourceRef &&
              input.srcRefs.includes(this.selectedSourceRef),
          })}"
        ></div>`
    )}`;
  }

  // eslint-disable-next-line class-methods-use-this
  renderSubFunction(subFunc: Element): TemplateResult {
    return html`<div class="container subfunc">
      <nav>
        <mwc-icon-button
          icon="delete"
          @click="${() => this.removeFunction(subFunc)}"
        >
        </mwc-icon-button>
        <mwc-icon-button
          icon="list_alt_add"
          @click="${() => {
            this.openLNodeDialog(subFunc);
          }}"
        >
        </mwc-icon-button>
      </nav>
      ${subFunc.getAttribute('name')}
      ${Array.from(
        subFunc.querySelectorAll(':scope > SubFunction, :scope > EqSubFunction')
      ).map(subSubFunc => this.renderSubFunction(subSubFunc))}
      ${Array.from(subFunc.querySelectorAll(':scope > LNode')).map(lNode =>
        this.renderLNodes(lNode)
      )}
    </div>`;
  }

  renderFuncDetail(): TemplateResult {
    if (!this.selectedFunc)
      return html`<div class="container func detail">
        Select function for more detail.
      </div>`;

    return html`${this.renderInputs()} ${this.renderDataAttributePicker()}
      <div class="container func detail">
        <nav>
          ${this.selectedFunc?.tagName === 'SubEquipment'
            ? nothing
            : html`<mwc-icon-button
                icon="account_tree"
                @click="${() => this.addSubFunction(this.selectedFunc!)}"
              >
              </mwc-icon-button>`}
          <mwc-icon-button
            icon="delete"
            @click="${() => this.removeFunction(this.selectedFunc!)}"
          >
          </mwc-icon-button>
          <mwc-icon-button
            icon="list_alt_add"
            @click="${() => this.openLNodeDialog(this.selectedFunc!)}"
          >
          </mwc-icon-button>
        </nav>
        ${this.selectedFunc.getAttribute('name')}
        ${Array.from(
          this.selectedFunc.querySelectorAll(
            ':scope > SubFunction, :scope > EqSubFunction'
          )
        ).map(subFunc => this.renderSubFunction(subFunc))}
        ${Array.from(this.selectedFunc.querySelectorAll(':scope > LNode')).map(
          lNode => this.renderLNodes(lNode)
        )}
      </div>`;
  }

  renderFuncContainers(): TemplateResult {
    if (!this.parent)
      return html`<div class="container allfunc">
        Select process element of element container
      </div>`;

    return html`<div class="container allfunc">
      ${this.parent.getAttribute('name')}
      <nav>
        <mwc-icon-button
          icon="functions"
          @click="${() => this.addFunction()}"
        ></mwc-icon-button>
        <mwc-icon-button
          icon="subdirectory_arrow_right"
          @click="${() => this.openCreateWizard('SubEquipment')}"
        ></mwc-icon-button>
      </nav>
      ${Array.from(
        this.parent.querySelectorAll(':scope>Function, :scope>EqFunction')
      ).map(
        func =>
          // eslint-disable-next-line lit-a11y/click-events-have-key-events
          html` <div
            class="${classMap({
              container: true,
              func: true,
              selected: this.selectedFunc === func,
              linked: highlightFunc(func, this.selectedFunc!),
            })}"
            @click="${() => {
              this.selectedFunc = func;
            }}"
          >
            <mwc-icon-button
              icon="functions"
              style="pointer-events: none;"
            ></mwc-icon-button>
            ${func.getAttribute('name')}
          </div>`
      )}
      ${Array.from(this.parent.querySelectorAll(':scope>SubEquipment')).map(
        subEq => {
          const subEqPhase = subEq.getAttribute('phase');
          // eslint-disable-next-line lit-a11y/click-events-have-key-events
          return html`<div
            class="${classMap({
              container: true,
              func: true,
              selected: this.selectedFunc === subEq,
              linked: highlightFunc(subEq, this.selectedFunc!),
            })}"
            @click="${() => {
              this.selectedFunc = subEq;
            }}"
          >
            <mwc-icon-button
              icon="subdirectory_arrow_right"
              style="pointer-events: none;"
            ></mwc-icon-button>
            ${subEq.getAttribute('name')}
            ${subEqPhase ? `(Phase: ${subEqPhase})` : nothing}
          </div>`;
        }
      )}
    </div>`;
  }

  // eslint-disable-next-line class-methods-use-this
  renderSettings(): TemplateResult {
    return html`<div class="container settings">
      <button
        @click="${() => this.libInput.click()}"
        style="height:30px;margin:10px"
      >
        Import Other Library
      </button>
      <div style="height:20px; margin:15px">${LIBDOCNAME}</div>
      <input
        style="display:none;"
        @click=${({ target }: MouseEvent) => {
          // eslint-disable-next-line no-param-reassign
          (<HTMLInputElement>target).value = '';
        }}
        @change=${this.openDoc}
        type="file"
      />
    </div>`;
  }

  updated(changedProperties: Map<string, any>) {
    // make sure to put the 6-100 on the SCL element as defined by the IEC 61850-6
    if (!changedProperties.has('doc')) return;
    const sldNsPrefix = this.doc!.documentElement.lookupPrefix(uri6100);
    if (!sldNsPrefix) {
      this.doc!.documentElement.setAttributeNS(
        xmlnsNs,
        `xmlns:${prefix6100}`,
        uri6100
      );
    }
  }

  render() {
    if (!this.substation) return html`<main>No substation section</main>`;

    return html`<main>
      <sld-viewer
        .substation=${this.substation}
        .gridSize=${this.gridSize}
        .parent=${this.parent}
        .linked=${linkedEquipment(this.doc!, this.selectedFunc)}
        @select-equipment="${(evt: CustomEvent) => {
          this.parent = evt.detail.element;
          this.selectedFunc = undefined;
        }}"
      ></sld-viewer>
      <div style="width:100%;overflow-y:scroll;">
        ${this.renderSettings()}
        <div style="flex:auto;display:flex; height:100%">
          ${this.renderFuncContainers()} ${this.renderFuncDetail()}
        </div>
        ${this.renderLNodeDialog()} ${this.renderLNodeDetail()}
      </div>
    </main>`;
  }

  static styles = css`
    :host {
      width: 100%;
      height: 100%;
    }

    main {
      width: 100%;
      height: 100%;
      display: flex;
    }

    sld-viewer {
      margin: 20px;
      max-width: 380px;
      overflow: scroll;
    }

    mwc-icon-button {
      --mdc-icon-button-size: 20px;
    }

    .container {
      border-radius: 10px;
      border: 2px solid #002b36;
      margin: 10px;
      padding: 10px;
    }

    .container.settings {
      background-color: #fdf6e3;
      height: 50px;
      margin: 10px 10px 0px 10px;
      display: flex;
    }

    .container.allfunc {
      min-width: 200px;
      background-color: #fdf6e3;
    }

    .container.func {
      background-color: #eee8d5;
    }

    .container.subfunc {
      background-color: #daeed5;
    }

    .container.func.detail {
      flex: auto;
    }

    .container.lnode {
      background-color: #fdf6e3;
    }

    .container.selected {
      background-color: #93a1a1;
    }

    .link {
      background-color: #002b36;
    }

    .link.selected {
      border: 1px solid #b58900;
    }

    .link.input {
      width: 7px;
      margin-left: 5px;
      border-radius: 3px;
    }

    .container.lnode.detail {
      width: auto;
      min-width: 300px;
      position: fixed;
      left: 20px;
      bottom: 20px;
      overflow: scroll;
      border: 2px black solid;
      border-radius: 10px;
    }

    thead tr {
      background-color: #93a1a1;
    }

    tbody tr:nth-child(odd) {
      background-color: #fdf6e3;
    }

    tbody tr:nth-child(even) {
      background-color: #eee8d5;
    }

    nav {
      float: right;
    }

    .table {
      background-color: white;
    }

    * {
      --md-sys-color-primary: var(--oscd-primary);
      --md-sys-color-secondary: var(--oscd-secondary);
      --md-sys-typescale-body-large-font: var(--oscd-theme-text-font);
      --md-outlined-text-field-input-text-color: var(--oscd-base01);

      --md-sys-color-surface: var(--oscd-base3);
      --md-sys-color-on-surface: var(--oscd-base00);
      --md-sys-color-on-primary: var(--oscd-base2);
      --md-sys-color-on-surface-variant: var(--oscd-base00);
      --md-menu-container-color: var(--oscd-base3);
      font-family: var(--oscd-theme-text-font);
      --md-sys-color-surface-container-highest: var(--oscd-base2);
    }
  `;
}
