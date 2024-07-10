import type { Tree } from '@openscd/oscd-tree-grid';

function lNodeTitle(lNode: Element): string {
  return `${lNode.getAttribute('prefix') ?? ''}${
    lNode.getAttribute('lnClass') ?? 'UNKNOWN_INST'
  }${lNode.getAttribute('lnInst') ?? ''}`;
}

function dataAttributeObject(da: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  const daType = da.ownerDocument.querySelector(
    `DAType[id="${da.getAttribute('type')}"]`
  );
  if (!daType) return tree;

  Array.from(daType.querySelectorAll('BDA')).forEach(bda => {
    const bdaName = bda.getAttribute('name') ?? 'UNKNOWN_BDA';
    if (bda.getAttribute('bType') === 'Struct') {
      const id = `BDA: ${bdaName}`;
      children[id] = dataAttributeObject(bda);
      children[id]!.text = bdaName;
    } else {
      const id = `LEAF: ${bdaName}`;
      children[id] = {};
      children[id]!.text = bdaName;
    }
  });

  tree.children = children;
  return tree;
}

function subDataObjectsObject(sdo: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  const doType = sdo.ownerDocument.querySelector(
    `DOType[id="${sdo.getAttribute('type')}"]`
  );
  if (!doType) return tree;

  Array.from(doType.querySelectorAll('SDO,DA')).forEach(sDoOrDa => {
    if (sDoOrDa.tagName === 'SDO') {
      const sDoName = sDoOrDa.getAttribute('name') ?? 'UNKNOWN_SDO';
      const id = `SDO: ${sDoName}`;
      children[id] = subDataObjectsObject(sDoOrDa);
      children[id]!.text = sDoName;
    } else {
      const daName = sDoOrDa.getAttribute('name') ?? 'UNKNOWN_DA';
      if (sDoOrDa.getAttribute('bType') === 'Struct') {
        const id = `DA: ${daName}`;
        children[id] = dataAttributeObject(sDoOrDa);
        children[id]!.text = daName;
      } else {
        const id = `LEAF: ${daName}`;
        children[id] = {};
        children[id]!.text = daName;
      }
    }
  });

  tree.children = children;
  return tree;
}

function dataObjectObject(dO: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  const doType = dO.ownerDocument.querySelector(
    `DOType[id="${dO.getAttribute('type')}"]`
  );
  if (!doType) return tree;

  Array.from(doType.querySelectorAll('SDO,DA')).forEach(sDoOrDa => {
    if (sDoOrDa.tagName === 'SDO') {
      const sDoName = sDoOrDa.getAttribute('name') ?? 'UNKNOWN_SDO';

      const id = `SDO: ${sDoName}`;
      children[id] = subDataObjectsObject(sDoOrDa);
      children[id]!.text = sDoName;
    } else {
      const daName = sDoOrDa.getAttribute('name') ?? 'UNKNOWN_DA';
      if (sDoOrDa.getAttribute('bType') === 'Struct') {
        const id = `DA: ${daName}`;
        children[id] = dataAttributeObject(sDoOrDa);
        children[id]!.text = daName;
      } else {
        const id = `LEAF: ${daName}`;
        children[id] = {};
        children[id]!.text = daName;
      }
    }
  });

  tree.children = children;
  return tree;
}

function anyLnObject(lNode: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  const lnType = lNode.ownerDocument.querySelector(
    `LNodeType[id="${lNode.getAttribute('lnType')}"]`
  );
  if (!lnType) return tree;

  Array.from(lnType.querySelectorAll('DO')).forEach(dO => {
    const doName = dO.getAttribute('name') ?? 'UNKNOWN_DO';

    const id = `DO: ${doName}`;
    children[id] = dataObjectObject(dO);
    children[id]!.text = doName;
  });

  tree.children = children;
  return tree;
}

function funcObject(func: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  Array.from(
    func.querySelectorAll(
      ':scope > SubFunction,:scope > EqSubFunction,:scope > LNode'
    )
  ).forEach(funcChild => {
    if (funcChild.tagName === 'LNode') {
      const title = lNodeTitle(funcChild);

      const id = `${funcChild.tagName}: ${title}`;
      children[id] = anyLnObject(funcChild);
      children[id]!.text = title;
    } else {
      const funcName = `${funcChild.getAttribute('name') ?? 'UNKNOWN_INST'}`;

      const id = `${funcChild.tagName}: ${funcName}`;
      children[id] = funcObject(funcChild);
      children[id]!.text = funcName;
    }
  });

  tree.children = children;

  return tree;
}

function condEqObject(condEq: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  Array.from(
    condEq.querySelectorAll(
      ':scope > EqFunction, :scope > LNode, :scope > SubEquipment'
    )
  ).forEach(condEqChild => {
    if (condEqChild.tagName === 'LNode') {
      const title = lNodeTitle(condEqChild);

      const id = `${condEqChild.tagName}: ${title}`;
      children[id] = anyLnObject(condEqChild);
      children[id]!.text = title;
    } else if (condEqChild.tagName === 'SubEquipment') {
      const subEqName = `${condEqChild.getAttribute('name') ?? 'UNKNOWN_INST'}`;

      const id = `${condEqChild.tagName}: ${subEqName}`;
      children[id] = condEqObject(condEqChild);
      children[id]!.text = subEqName;
    } else {
      const funcName = `${condEqChild.getAttribute('name') ?? 'UNKNOWN_INST'}`;

      const id = `${condEqChild.tagName}: ${funcName}`;
      children[id] = funcObject(condEqChild);
      children[id]!.text = funcName;
    }
  });

  tree.children = children;

  return tree;
}

function bayObject(bay: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  Array.from(
    bay.querySelectorAll(':scope > ConductingEquipment, :scope > Function')
  ).forEach(bayChild => {
    if (bayChild.tagName === 'ConductingEquipment') {
      const condEqName = `${bayChild.getAttribute('name') ?? 'UNKNOWN_INST'}`;

      const id = `${bayChild.tagName}: ${condEqName}`;
      children[id] = condEqObject(bayChild);
      children[id]!.text = condEqName;
    } else {
      const funcName = `${bayChild.getAttribute('name') ?? 'UNKNOWN_INST'}`;

      const id = `${bayChild.tagName}: ${funcName}`;
      children[id] = funcObject(bayChild);
      children[id]!.text = funcName;
    }
  });

  tree.children = children;

  return tree;
}

function voltLvObject(voltLv: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  Array.from(voltLv.querySelectorAll(':scope > Bay,:scope > Function')).forEach(
    voltLvChild => {
      if (voltLvChild.tagName === 'Bay') {
        const bayName = `${voltLvChild.getAttribute('name') ?? 'UNKNOWN_INST'}`;

        const id = `${voltLvChild.tagName}: ${bayName}`;
        children[id] = bayObject(voltLvChild);
        children[id]!.text = bayName;
      } else {
        const funcName = `${
          voltLvChild.getAttribute('name') ?? 'UNKNOWN_INST'
        }`;

        const id = `${voltLvChild.tagName}: ${funcName}`;
        children[id] = funcObject(voltLvChild);
        children[id]!.text = funcName;
      }
    }
  );

  tree.children = children;

  return tree;
}

function subStObject(subSt: Element): Tree {
  const tree: Tree = {};
  const children: Tree = {};

  Array.from(
    subSt.querySelectorAll(':scope > VoltageLevel, :scope > Function')
  ).forEach(subStChild => {
    if (subStChild.tagName === 'VoltageLevel') {
      const subStName = `${subStChild.getAttribute('name') ?? 'UNKNOWN_INST'}`;

      const id = `${subStChild.tagName}: ${subStName}`;
      children[id] = voltLvObject(subStChild);
      children[id]!.text = subStName;
    } else {
      const funcName = `${subStChild.getAttribute('name') ?? 'UNKNOWN_INST'}`;

      const id = `${subStChild.tagName}: ${funcName}`;
      children[id] = funcObject(subStChild);
      children[id]!.text = funcName;
    }
  });

  tree.children = children;

  return tree;
}

export function dataAttributeTree(doc: XMLDocument): Tree {
  const tree: Tree = {};

  Array.from(doc.querySelectorAll(':scope > Substation')).forEach(
    subStChild => {
      const subStName = subStChild.getAttribute('name') ?? 'UNKNOWN_LDEVICE';
      const id = `Substation: ${subStName}`;
      tree[id] = subStObject(subStChild);
      tree[id]!.text = subStName;
    }
  );

  return tree;
}

export function getSourceDef(paths: string[][]): string[] {
  const sourceRefs: string[] = [];

  for (const path of paths) {
    let source: string = '';
    const leaf = path[path.length - 1];
    const [leafTag] = leaf.split(': ');
    // eslint-disable-next-line no-continue
    if (leafTag !== 'LEAF') continue;

    for (const section of path) {
      const [tag, name] = section.split(': ');
      if (!['DA', 'SDO', 'BDA', 'LEAF'].includes(tag)) source += `/${name}`;
      else source += `.${name}`;
    }

    sourceRefs.push(source);
  }

  return sourceRefs;
}
