import { LitElement } from 'lit';
export declare class SldViewer extends LitElement {
    substation: Element;
    gridSize: number;
    sld: SVGGraphicsElement;
    container: HTMLDivElement;
    parent?: Element;
    linked: Element[];
    unmapped: Element[];
    render(): import("lit").TemplateResult<1>;
    static styles: import("lit").CSSResult;
}
