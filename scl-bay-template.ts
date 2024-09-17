/* eslint-disable lit/no-duplicate-template-bindings */
/* eslint-disable lit-a11y/click-events-have-key-events */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-return-assign */
import { css, html, LitElement, nothing, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-icon';
import '@material/mwc-select';

import '@material/mwc-textfield';

import type { Dialog } from '@material/mwc-dialog';
import type { TextField } from '@material/mwc-textfield';

import { newEditEvent } from '@openscd/open-scd-core';

import '@openenergytools/function-editor-90-30';

import { getReference, importLNodeType } from '@openenergytools/scl-lib';

import { newCreateWizardEvent } from './foundation.js';

import './sld-viewer.js';

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

function unmappedEquipment(doc: XMLDocument): Element[] {
  return Array.from(
    doc.querySelectorAll('VoltageLevel,Bay,ConductingEquipment')
  ).filter(
    procElement =>
      !!procElement.querySelector(
        ':scope > Function SourceRef:not([source]),:scope > EqFunction SourceRef:not([source])'
      )
  );
}

function getPath(element: Element): string {
  const parent = element.parentElement;
  if (!parent || parent.tagName === 'SCL')
    return `${element.getAttribute('name')}`;
  return `${getPath(parent)}/${element.getAttribute('name')}`;
}

function updateFuncClone(func: Element, newParent: Element): Element {
  const newPath = getPath(newParent);
  const oldPath = getPath(func.parentElement!);
  const funcClone = func.cloneNode(true) as Element;

  Array.from(funcClone.querySelectorAll(':scope SourceRef')).forEach(srcRef => {
    const source = srcRef.getAttribute('source');
    if (source) {
      const newSource = source.replace(oldPath, newPath);
      srcRef.setAttribute('source', newSource);
    }
  });

  return funcClone;
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
  sldWidth: number = 600;

  @query('#service') serviceSelector!: HTMLSelectElement;

  @query('#funcinput') fsdInput!: HTMLInputElement;

  @query('#existProcessResource') proResNameSel!: HTMLSelectElement;

  @query('#proresname') proResName!: TextField;

  @query('#proresselector') proResSelector!: TextField;

  @query('#prorescardinality') proResCardinality!: TextField;

  @query('#proresmax') proResMax!: TextField;

  @query('#proresservice') proResService!: TextField;

  @query('#sldWidthDialog') sldWidthDiag?: Dialog;

  private openCreateWizard(tagName: string): void {
    if (this.parent)
      this.dispatchEvent(newCreateWizardEvent(this.parent, tagName));
  }

  addFunction(): void {
    if (
      (this.parent && this.parent?.tagName === 'Bay') ||
      this.parent?.tagName === 'VoltageLevel'
    ) {
      this.openCreateWizard('Function');
      return;
    }

    this.openCreateWizard('EqFunction');
  }

  addSubFunction(parent: Element): void {
    if (parent.tagName === 'Function' || parent.tagName === 'SubFunction') {
      this.dispatchEvent(newCreateWizardEvent(parent, 'SubFunction'));
      return;
    }

    this.dispatchEvent(newCreateWizardEvent(parent, 'EqSubFunction'));
  }

  subFunction(subFunc: Element): Element {
    const eqSubFunc = this.doc!.createElement('EqSubFunction');
    const name = subFunc.getAttribute('name');
    if (name) eqSubFunc.setAttribute('name', name);

    Array.from(subFunc.children).forEach(child => {
      if (child.tagName === 'SubFunction')
        eqSubFunc.appendChild(this.subFunction(child));
      else eqSubFunc.appendChild(child.cloneNode(true));
    });

    return eqSubFunc;
  }

  // eslint-disable-next-line class-methods-use-this
  async importFunction(event: Event): Promise<void> {
    const file = (<HTMLInputElement | null>event.target)?.files?.item(0);
    if (!file) return;

    const text = await file.text();
    const fsd = new DOMParser().parseFromString(text, 'application/xml');

    const func = fsd.querySelector('Function');
    if (!func || !this.parent) return;

    const funcClone = updateFuncClone(func, this.parent);

    const uniqueLnTypes = new Set(
      Array.from(funcClone.querySelectorAll(':scope LNode'))
        .map(lNode => lNode.getAttribute('lnType'))
        .filter(lnType => lnType) as string[]
    );

    uniqueLnTypes.forEach(lnType => {
      const lNodeType = func.ownerDocument.querySelector(
        `:root > DataTypeTemplates > LNodeType[id="${lnType}"]`
      );
      if (lNodeType)
        this.dispatchEvent(newEditEvent(importLNodeType(lNodeType, this.doc!)));
    });

    if (this.parent?.tagName === 'ConductingEquipment') {
      const eqFunc = this.doc!.createElement('EqFunction');
      const name = funcClone.getAttribute('name');
      if (name) eqFunc.setAttribute('name', name);

      Array.from(funcClone.children).forEach(child => {
        if (child.tagName === 'SubFunction')
          eqFunc.appendChild(this.subFunction(child));
        else eqFunc.appendChild(child.cloneNode(true));
      });

      this.dispatchEvent(
        newEditEvent({
          parent: this.parent,
          node: eqFunc,
          reference: getReference(this.parent, 'EqFunction'),
        })
      );
    } else {
      this.dispatchEvent(
        newEditEvent({
          parent: this.parent,
          node: funcClone.cloneNode(true),
          reference: getReference(this.parent, 'Function'),
        })
      );
    }
  }

  private renderFuncContainers(): TemplateResult {
    const root = this.parent
      ? this.parent
      : this.doc?.querySelector(':root > Substation');

    const selector = this.parent
      ? ':scope > Function, :scope > EqFunction'
      : ':scope Function, :scope EqFunction';

    if (!root)
      return html`<div class="container allfunc">
        Please load a SCL file with valid substation section
      </div>`;

    return html`<div class="container allfunc">
      ${root.getAttribute('name')}
      <nav>
        <abbr title="Import from Function Specification">
          <mwc-icon-button
            icon="copy_all"
            @click="${() => this.fsdInput.click()}"
          ></mwc-icon-button>
        </abbr>
        <input
          id="funcinput"
          style="display:none;"
          type="file"
          accept=".fsd,"
          @click=${({ target }: MouseEvent) => {
            // eslint-disable-next-line no-param-reassign
            (<HTMLInputElement>target).value = '';
          }}
          @change=${this.importFunction}
        />
        <abbr title="Create New Function/EqFunction">
          <mwc-icon-button
            icon="functions"
            @click="${() => this.addFunction()}"
          ></mwc-icon-button>
        </abbr>
        ${root.tagName === 'ConductingEquipment' ||
        root.tagName === 'PowerTransformer' ||
        root.tagName === 'TransformerWinding'
          ? html` <abbr title="Create New SubEquipment">
              <mwc-icon-button
                icon="subdirectory_arrow_right"
                @click="${() => this.openCreateWizard('SubEquipment')}"
              ></mwc-icon-button>
            </abbr>`
          : nothing}
      </nav>
      ${Array.from(root.querySelectorAll(selector)).map(
        func =>
          // eslint-disable-next-line lit-a11y/click-events-have-key-events
          html` <div
            class="${classMap({
              container: true,
              func: true,
              selected: this.selectedFunc === func,
              unmapped: !!func.querySelector(':scope SourceRef:not([source])'),
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
      ${Array.from(root.querySelectorAll(':scope>SubEquipment')).map(subEq => {
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
      })}
    </div>`;
  }

  private renderWidthDialog(): TemplateResult {
    return html`<mwc-dialog heading="SLD pane width" id="sldWidthDialog"
      ><mwc-textfield type="number" value="${this.sldWidth}"></mwc-textfield>
      <mwc-button
        slot="primaryAction"
        label="Save"
        icon="save"
        @click="${(evt: Event) => {
          this.sldWidth = parseInt(
            ((evt.target as Element).previousElementSibling as TextField).value,
            10
          );
          this.sldWidthDiag?.close();
        }}"
      ></mwc-button
    ></mwc-dialog>`;
  }

  render() {
    if (!this.substation) return html`<main>No substation section</main>`;

    return html`<main>
        <div style="margin:10px;width:${this.sldWidth}px">
          <div>
            <abbr title="Resize SLD"
              ><mwc-icon-button
                icon="resize"
                style="--mdc-icon-button-size:48px;"
                @click="${() => this.sldWidthDiag?.show()}"
              ></mwc-icon-button
            ></abbr>
          </div>
          <sld-viewer
            .substation=${this.substation}
            .gridSize=${this.gridSize}
            .parent=${this.parent}
            .linked=${linkedEquipment(this.doc!, this.selectedFunc)}
            .unmapped=${unmappedEquipment(this.doc!)}
            @select-equipment="${(evt: CustomEvent) => {
              this.parent = evt.detail.element;
              this.selectedFunc = undefined;
            }}"
          ></sld-viewer>
        </div>
        <div style="width:100%;overflow-y:scroll;">
          <div style="flex:auto;display:flex; height:100%">
            ${this.renderFuncContainers()}
            <function-editor-90-30
              style="flex:auto;"
              .doc="${this.doc}"
              editCount="${this.editCount}"
              .function="${this.selectedFunc}"
            ></function-editor-90-30>
          </div>
        </div>
      </main>
      ${this.renderWidthDialog()}`;
  }

  static styles = css`
    * {
      --fedit-primary: var(--oscd-primary);
      --fedit-secondary: var(--oscd-secondary);
      --fedit-surface: var(--oscd-base2);

      --fedit-text-color: var(--oscd-base03);
      --fedit-func-color: var(--oscd-base3);
      --fedit-subfunc-color: var(--oscd-base3);
      --fedit-lnode-color: var(--oscd-base2);
      --fedit-selected-color: var(--oscd-base00);
      --fedit-selected-text-color: var(--oscd-base2);
      --fedit-link-color: var(--oscd-base03);
      --fedit-detail-base1: var(--oscd-base2);
      --fedit-detail-base2: var(--oscd-base3);
      --fedit-hover-color: var(--oscd-secondary);
    }

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
      max-width: 600px;
      overflow: scroll;
    }

    mwc-icon-button {
      --mdc-icon-button-size: 20px;
    }

    .container.unmapped {
      background-color: var(--oscd-secondary);
    }

    .container.allfunc {
      min-width: 200px;
      background-color: var(--oscd-base3);
    }

    nav {
      float: right;
    }

    .container {
      border-radius: 10px;
      border: 2px solid var(--oscd-base03);
      margin: 10px;
      padding: 10px;
    }

    .container.selected {
      background-color: var(--oscd-base00);
      color: var(--oscd-base2);
    }
  `;
}
