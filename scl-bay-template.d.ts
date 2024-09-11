import { LitElement, TemplateResult } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-icon-button';
import '@material/mwc-icon';
import '@material/mwc-select';
import '@material/mwc-textfield';
import type { Dialog } from '@material/mwc-dialog';
import type { TextField } from '@material/mwc-textfield';
import '@openscd/oscd-tree-grid';
import type { TreeGrid } from '@openscd/oscd-tree-grid';
import './sld-viewer.js';
import '@openenergytools/function-editor';
type Input = {
    source: string;
    srcRefs: Element[];
};
export default class SclBayTemplate extends LitElement {
    doc?: XMLDocument;
    docs: Record<string, XMLDocument>;
    lNodeTypeSrc: {
        name: string;
        src: XMLDocument;
    }[];
    get substation(): Element | null;
    gridSize: number;
    editCount: number;
    get bay(): Element | null;
    parent?: Element;
    selectedFunc?: Element;
    selectedLNode?: Element;
    lnodeparent?: Element;
    selectedSourceRef?: Element;
    selectedResourceName?: Element;
    sldWidth: number;
    selectedLibName?: string;
    inputs: Input[];
    dialog: Dialog;
    daPickerDialog: Dialog;
    processResourceDiag: Dialog;
    daPicker: TreeGrid;
    serviceSelector: HTMLSelectElement;
    libInput: HTMLInputElement;
    proResNameSel: HTMLSelectElement;
    proResName: TextField;
    proResSelector: TextField;
    proResCardinality: TextField;
    proResMax: TextField;
    proResService: TextField;
    private openCreateWizard;
    private removeFunction;
    private removeSourceRef;
    addFunction(): void;
    addSubFunction(parent: Element): void;
    createNewLNodeElements(): void;
    openLNodeDialog(func: Element): void;
    private createSourceRefs;
    private saveProcessRef;
    private renderProcessResourcePicker;
    private renderDataAttributePicker;
    openDoc(event: Event): Promise<void>;
    renderLNodeDetail(): TemplateResult;
    renderLNodeDialog(): TemplateResult;
    renderSourceRef(lNode: Element): TemplateResult;
    renderLNodes(lNode: Element): TemplateResult;
    renderInputs(): TemplateResult;
    renderSubFunction(subFunc: Element): TemplateResult;
    renderFuncDetail(): TemplateResult;
    renderFuncContainers(): TemplateResult;
    renderSettings(): TemplateResult;
    updated(changedProperties: Map<string, any>): void;
    sldWidthDiag?: Dialog;
    private renderWidthDialog;
    render(): TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
export {};
