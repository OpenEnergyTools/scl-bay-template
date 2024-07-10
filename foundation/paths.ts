import { SVGTemplateResult, nothing, svg } from 'lit';

import { identity } from '@openenergytools/scl-lib';

import { attributes } from './sldUtil.js';
import { Connection } from './types.js';
import { inputReference } from './utils.js';

export const serviceColoring: Record<string, string> = {
  ReportControl: '#859900',
  GSEControl: '#268bd2',
  SampledValueControl: '#cb4b16',
};

interface ConnectionDimensions {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

type Orientation = 'n' | 's' | 'e' | 'w';

interface ConnectionOrientations {
  sDir: Orientation;
  tDir: Orientation;
}

type Count = {
  n: { index: number; total: number };
  e: { index: number; total: number };
  s: { index: number; total: number };
  w: { index: number; total: number };
};

function tooltip(conn: Connection): string {
  const cbName = conn.source.controlBlock.getAttribute('name');
  const sourceIed = conn.source.ied.getAttribute('name');
  const targetIed = conn.target.ied.getAttribute('name');

  const data = conn.target.inputs.map(input => inputReference(input));

  return `${sourceIed}:${cbName} -> ${targetIed}
   
  \t${data.join('\n\t')}`;
}

function connDimensions(conn: Connection): ConnectionDimensions {
  const {
    pos: [sx, sy],
  } = attributes(conn.source.ied);

  const {
    pos: [tx, ty],
  } = attributes(conn.target.ied);

  return { sx, sy, tx, ty };
}

function connDirection(conn: Connection): ConnectionOrientations {
  const { sx, sy, tx, ty } = connDimensions(conn);

  if (sx !== tx && sy === ty) return { sDir: 'n', tDir: 'n' };

  if (sx === tx && sy > ty + 1) return { sDir: 'n', tDir: 's' };
  if (sx === tx && sy < ty - 1) return { sDir: 's', tDir: 'n' };

  if (sx === tx && sy === ty + 1) return { sDir: 'w', tDir: 'w' };

  if (sx === tx && sy === ty - 1) return { sDir: 'w', tDir: 'w' };

  if (sx < tx && sy === ty + 1) return { sDir: 'n', tDir: 'w' };

  if (sx > tx && sy === ty + 1) return { sDir: 'n', tDir: 'e' };

  if (sx < tx && sy === ty - 1) return { sDir: 's', tDir: 'w' };

  if (sx > tx && sy === ty - 1) return { sDir: 's', tDir: 'e' };

  if (sx === tx - 1 && sy > ty) return { sDir: 'n', tDir: 's' };

  if (sx === tx - 1 && sy < ty) return { sDir: 's', tDir: 'n' };

  if (sx === tx + 1 && sy > ty) return { sDir: 'n', tDir: 's' };

  if (sx === tx + 1 && sy < ty) return { sDir: 's', tDir: 'n' };

  if (sx < tx - 1 && sy > ty + 1) return { sDir: 'n', tDir: 's' };

  if (sx < tx - 1 && sy < ty - 1) return { sDir: 's', tDir: 'n' };

  if (sx > tx + 1 && sy > ty + 1) return { sDir: 'n', tDir: 's' };

  // if (sx > tx + 1 && sy < ty - 1)
  return { sDir: 's', tDir: 'n' };
}

function adjust(
  conn: Connection,
  faceCount: Record<string, Count>
): { sAdj: number; tAdj: number } {
  const { sDir, tDir } = connDirection(conn);

  const sourceid = `${identity(conn.source.ied)}`;
  const targetid = `${identity(conn.target.ied)}`;

  let sI = 1;
  let sT = 1;
  if (faceCount[sourceid] && faceCount[sourceid][sDir]) {
    sI = faceCount[sourceid][sDir].index;
    // eslint-disable-next-line no-param-reassign
    faceCount[sourceid][sDir].index += 1;
    sT = faceCount[sourceid][sDir].total;
  }

  let tI = 1;
  let tT = 1;
  if (faceCount[targetid] && faceCount[targetid][tDir]) {
    tI = faceCount[targetid][tDir].index;
    // eslint-disable-next-line no-param-reassign
    faceCount[targetid][tDir].index += 1;
    tT = faceCount[targetid][tDir].total;
  }

  const sAdj = (2 * sI - 1) / (sT * 2);
  const tAdj = (2 * tI - 1) / (tT * 2);

  return { sAdj, tAdj };
}

function arrow(conn: Connection, tx: number, ty: number): string {
  const { tDir } = connDirection(conn);

  if (tDir === 'n')
    return `M${tx},${ty}L${tx - 0.08},${ty - 0.16}L${tx + 0.08},${ty - 0.16}Z`;

  if (tDir === 's')
    return `M${tx},${ty}L${tx - 0.08},${ty + 0.16}L${tx + 0.08},${ty + 0.16}Z`;

  if (tDir === 'e')
    return `M${tx},${ty}L${tx + 0.16},${ty + 0.08}L${tx + 0.16},${ty - 0.08}Z`;

  return `M${tx},${ty}L${tx - 0.16},${ty + 0.08}L${tx - 0.16},${ty - 0.08}Z`;
}

export function svgPath(
  conn: Connection,
  faceCount: Record<string, Count>
): string[] {
  let r = 0.15;

  const { sx, sy, tx, ty } = connDimensions(conn);

  const { sAdj, tAdj } = adjust(conn, faceCount);

  if (sx !== tx && sy === ty) {
    if (sx > tx)
      return [
        `M${sx + sAdj},${sy}L${sx + sAdj},${sy - 0.5 + r}A${r},${r} 0 0 0 ${
          sx + sAdj - r
        },${sy - 0.5}L${tx + tAdj + r},${ty - 0.5}A${r},${r} 0 0 0 ${
          tx + tAdj
        },${ty - 0.5 + r}L${tx + tAdj},${ty}`,
        arrow(conn, tx + tAdj, ty),
      ];

    return [
      `M${sx + sAdj},${sy}L${sx + sAdj},${sy - 0.5 + r}A${r},${r} 0 0 1 ${
        sx + sAdj + r
      },${sy - 0.5}L${tx + tAdj - r},${ty - 0.5}A${r},${r} 0 0 1 ${tx + tAdj},${
        ty - 0.5 + r
      }L${tx + tAdj},${ty}`,
      arrow(conn, tx + tAdj, ty),
    ];
  }

  if (sx === tx && sy > ty + 1) {
    if (sAdj === tAdj)
      return [
        `M${sx + sAdj},${sy}L${tx + tAdj},${ty + 1}`,
        arrow(conn, tx + tAdj, ty + 1),
      ];

    if (Math.abs(sAdj - tAdj) <= r * 2) r = Math.abs(sAdj - tAdj) / 2;

    if (sAdj < tAdj)
      return [
        `M${sx + sAdj},${sy}L${sx + sAdj},${
          sy - (sy - ty - 1) / 2 + r
        }A${r},${r} 0 0 1 ${sx + sAdj + r},${sy - (sy - ty - 1) / 2}L${
          tx + tAdj - r
        },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 0 ${tx + tAdj},${
          sy - (sy - ty - 1) / 2 - r
        }L${tx + tAdj},${ty + 1}`,
        arrow(conn, tx + tAdj, ty + 1),
      ];

    return [
      `M${sx + sAdj},${sy}L${sx + sAdj},${
        sy - (sy - ty - 1) / 2 + r
      }A${r},${r} 0 0 0 ${sx + sAdj - r},${sy - (sy - ty - 1) / 2}L${
        tx + tAdj + r
      },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 1 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 - r
      }L${tx + tAdj},${ty + 1}`,
      arrow(conn, tx + tAdj, ty + 1),
    ];
  }

  if (sx === tx && sy < ty - 1) {
    if (sAdj === tAdj)
      return [
        `M${sx + sAdj},${sy + 1}L${tx + tAdj},${ty}`,
        arrow(conn, tx + tAdj, ty),
      ];

    if (Math.abs(sAdj - tAdj) <= r * 2) r = Math.abs(sAdj - tAdj) / 2;

    if (sAdj < tAdj)
      return [
        `M${sx + sAdj},${sy + 1}L${sx + sAdj},${
          sy - (sy - ty - 1) / 2 - r
        }A${r},${r} 0 0 0 ${sx + sAdj + r},${sy - (sy - ty - 1) / 2}L${
          tx + tAdj - r
        },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 1 ${tx + tAdj},${
          sy - (sy - ty - 1) / 2 + r
        }L${tx + tAdj},${ty}`,
        arrow(conn, tx + tAdj, ty),
      ];

    return [
      `M${sx + sAdj},${sy + 1}L${sx + sAdj},${
        sy - (sy - ty - 1) / 2 - r
      }A${r},${r} 0 0 1 ${sx + sAdj - r},${sy - (sy - ty - 1) / 2}L${
        tx + tAdj + r
      },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 0 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 + r
      }L${tx + tAdj},${ty}`,
      arrow(conn, tx + tAdj, ty),
    ];
  }

  if (sx === tx && sy === ty - 1)
    return [
      `M${sx},${sy + sAdj}L${sx - 0.5 + r},${sy + sAdj}A${r},${r} 0 0 0 ${
        sx - 0.5
      },${sy + sAdj + r}L${tx - 0.5},${ty + tAdj - r}A${r},${r} 0 0 0 ${
        tx - 0.5 + r
      },${ty + tAdj}L${tx},${ty + tAdj}`,
      arrow(conn, tx, ty + tAdj),
    ];

  if (sx === tx && sy === ty + 1)
    return [
      `M${sx},${sy + sAdj}L${sx - 0.5 + r},${sy + sAdj}A${r},${r} 0 0 1 ${
        sx - 0.5
      },${sy + sAdj - r}L${tx - 0.5},${ty + tAdj + r}A${r},${r} 0 0 1 ${
        sx - 0.5 + r
      },${ty + tAdj}L${tx},${ty + tAdj}`,
      arrow(conn, tx, ty + tAdj),
    ];

  if (sx < tx && sy === ty + 1)
    return [
      `M${sx + sAdj},${sy}L${sx + sAdj},${
        sy - (1 - tAdj) + r
      }A${r},${r} 0 0 1 ${sx + sAdj + r},${ty + tAdj}L${tx},${ty + tAdj}`,
      arrow(conn, tx, ty + tAdj),
    ];

  if (sx > tx && sy === ty + 1)
    return [
      `M${sx + sAdj},${sy}L${sx + sAdj},${
        sy - (1 - tAdj) + r
      }A${r},${r} 0 0 0 ${sx + sAdj - r},${ty + tAdj}L${tx + 1},${ty + tAdj}`,
      arrow(conn, tx + 1, ty + tAdj),
    ];

  if (sx < tx && sy === ty - 1)
    return [
      `M${sx + sAdj},${sy + 1}L${sx + sAdj},${ty + tAdj - r}A${r},${r} 0 0 0 ${
        sx + sAdj + r
      },${ty + tAdj}L${tx},${ty + tAdj}`,
      arrow(conn, tx, ty + tAdj),
    ];

  if (sx > tx && sy === ty - 1)
    return [
      `M${sx + sAdj},${sy + 1}L${sx + sAdj},${ty + tAdj - r}A${r},${r} 0 0 1 ${
        sx + sAdj - r
      },${ty + tAdj}L${tx + 1},${ty + tAdj}`,
      arrow(conn, tx + 1, ty + tAdj),
    ];

  if (sx === tx - 1 && sy > ty)
    return [
      `M${sx + sAdj},${sy}L${sx + sAdj},${
        sy - (sy - ty - 1) / 2 + r
      }A${r},${r} 0 0 1 ${sx + sAdj + r},${sy - (sy - ty - 1) / 2}L${
        tx + tAdj - r
      },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 0 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 - r
      }L${tx + tAdj},${ty + 1}`,
      arrow(conn, tx + tAdj, ty + 1),
    ];

  if (sx === tx - 1 && sy < ty)
    return [
      `M${sx + sAdj},${sy + 1}L${sx + sAdj},${
        sy - (sy - ty - 1) / 2 - r
      }A${r},${r} 0 0 0 ${sx + sAdj + r},${sy - (sy - ty - 1) / 2}L${
        tx + tAdj - r
      },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 1 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 + r
      }L${tx + tAdj},${ty}`,
      arrow(conn, tx + tAdj, ty),
    ];

  if (sx === tx + 1 && sy > ty)
    return [
      `M${sx + sAdj},${sy}L${sx + sAdj},${
        sy - (sy - ty - 1) / 2 + r
      }A${r},${r} 0 0 0 ${sx + sAdj - r},${sy - (sy - ty - 1) / 2}L
      ${tx + tAdj + r},${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 1 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 - r
      }L${tx + tAdj},${ty + 1}`,
      arrow(conn, tx + tAdj, ty + 1),
    ];

  if (sx === tx + 1 && sy < ty)
    return [
      `M${sx + sAdj},${sy + 1.0}L${sx + sAdj},${
        sy - (sy - ty - 1) / 2 - r
      }A${r},${r} 0 0 1 ${sx + sAdj - r},${sy - (sy - ty - 1) / 2}L${
        tx + tAdj + r
      },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 0 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 + r
      }L${tx + tAdj},${ty}`,
      arrow(conn, tx + tAdj, ty),
    ];

  if (sx < tx - 1 && sy > ty + 1)
    return [
      `M
      ${sx + sAdj},${sy}L
      ${sx + sAdj},${sy - (sy - ty - 1) / 2 + r}A${r},${r} 0 0 1 ${
        sx + sAdj + r
      },${sy - (sy - ty - 1) / 2}L
      ${tx + tAdj - r},${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 0 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 - r
      }L
      ${tx + tAdj},${ty + 1}`,
      arrow(conn, tx + tAdj, ty + 1),
    ];

  if (sx < tx - 1 && sy < ty - 1)
    return [
      `M${sx + sAdj},${sy + 1}L${sx + sAdj},${
        sy - (sy - ty - 1) / 2 - r
      }A${r},${r} 0 0 0 ${sx + sAdj + r},${sy - (sy - ty - 1) / 2}L${
        tx + tAdj - r
      },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 1 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 + r
      }L${tx + tAdj},${ty}`,
      arrow(conn, tx + tAdj, ty),
    ];

  if (sx > tx + 1 && sy > ty + 1)
    return [
      `M${sx + sAdj},${sy}L${sx + sAdj},${
        sy - (sy - ty - 1) / 2 + r
      }A${r},${r} 0 0 0 ${sx + sAdj - r},${sy - (sy - ty - 1) / 2}L${
        tx + tAdj + r
      },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 1 ${tx + tAdj},${
        sy - (sy - ty - 1) / 2 - r
      }L${tx + tAdj},${ty + 1}`,
      arrow(conn, tx + tAdj, ty + 1),
    ];

  // if (sx > tx + 1 && sy < ty - 1)
  return [
    `M${sx + sAdj},${sy + 1}L${sx + sAdj},${
      sy - (sy - ty - 1) / 2 - r
    }A${r},${r} 0 0 1 ${sx + sAdj - r},${sy - (sy - ty - 1) / 2}L${
      tx + tAdj + r
    },${sy - (sy - ty - 1) / 2}A${r},${r} 0 0 0 ${tx + tAdj},${
      sy - (sy - ty - 1) / 2 + r
    }L${tx + tAdj},${ty}`,
    arrow(conn, tx + tAdj, ty),
  ];
}

export function svgConnectionGenerator(
  substation: Element,
  conns: Connection[],
  editMode: boolean
): (conn: Connection) => SVGTemplateResult {
  const {
    dim: [w, h],
  } = attributes(substation);

  const faceCount: Record<string, Count> = {};

  conns.forEach(conn => {
    const { sDir, tDir } = connDirection(conn);

    const sourceid = `${identity(conn.source.ied)}`;
    const targetid = `${identity(conn.target.ied)}`;

    if (!faceCount[sourceid])
      faceCount[sourceid] = {
        n: { index: 1, total: 0 },
        s: { index: 1, total: 0 },
        e: { index: 1, total: 0 },
        w: { index: 1, total: 0 },
      };
    faceCount[sourceid][sDir].total += 1;

    if (!faceCount[targetid])
      faceCount[targetid] = {
        n: { index: 1, total: 0 },
        s: { index: 1, total: 0 },
        e: { index: 1, total: 0 },
        w: { index: 1, total: 0 },
      };
    faceCount[targetid][tDir].total += 1;
  });

  return (conn: Connection) => {
    const [linkPath, arrowPath] = svgPath(conn, faceCount);

    let handleClick: ((evt: Event) => void) | symbol = nothing;
    if (editMode) {
      const edit = new CustomEvent('select-connection', {
        bubbles: true,
        composed: true,
        detail: conn,
      });
      handleClick = (evt: Event) => evt.target?.dispatchEvent(edit);
    }

    const color = serviceColoring[conn.source.controlBlock.tagName];
    return svg`<svg class="connection ${conn.source.controlBlock.tagName}"
          width="${w}"
          height="${h}">
          <path d="${linkPath}" stroke="${color}" stroke-width="0.08" @click="${handleClick}"><title>${tooltip(
      conn
    )}</title></path>
          <path d="${arrowPath}" stroke="${color}" fill="${color}" stroke-width="0.08"/>
          </svg>`;
  };
}
