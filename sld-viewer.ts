import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { attributes, svgNs, xlinkNs } from './foundation/sldUtil.js';
import { sldSvg } from './foundation/sldSvg.js';

@customElement('sld-viewer')
export class SldViewer extends LitElement {
  @property({ attribute: false })
  substation!: Element;

  @property({ type: Number })
  gridSize!: number;

  @query('svg#sldContainer')
  sld!: SVGGraphicsElement;

  @query('#container') container!: HTMLDivElement;

  @property({ attribute: false })
  parent?: Element;

  @property({ attribute: false })
  linked: Element[] = [];

  @property({ attribute: false })
  unmapped: Element[] = [];

  render() {
    const {
      dim: [w, h],
    } = attributes(this.substation);

    return html`<div id="container">
      <svg
        xmlns="${svgNs}"
        xmlns:xlink="${xlinkNs}"
        viewBox="0 0 ${w} ${h}"
        width="${w * this.gridSize}"
        height="${h * this.gridSize}"
        id="sldContainer"
        stroke-width="0.06"
        fill="none"
      >
        ${sldSvg(this.substation, {
          gridSize: this.gridSize,
          editMode: true,
          parent: this.parent,
          linked: this.linked,
          unmapped: this.unmapped,
        })}
      </svg>
    </div>`;
  }

  static styles = css`
    #container {
      width: 100%;
      height: 80vh;
      overflow: scroll;
      background-color: white;
    }

    g.equipment:not(.linked):not(.source):not(.selsource) {
      opacity: 0.2;
    }

    g.label:not(.ied):not(.linked):not(.source):not(.selsource) {
      opacity: 0.2;
    }

    .filter.box > mwc-textfield {
      padding: 10px;
    }

    .linked > rect {
      fill: red;
      opacity: 0.1;
    }

    .unmapped > rect {
      fill: orange;
      opacity: 0.1;
    }

    .parent > rect {
      fill: #268bd2;
      opacity: 0.1;
    }
  `;
}
