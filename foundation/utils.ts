export function inputReference(input: Element): string {
  const prefix = input.getAttribute('prefix') ?? '';
  const lnClass = input.getAttribute('lnClass');
  const lnInst = input.getAttribute('lnInst') ?? '';

  const ln = `${prefix}${lnClass}${lnInst}`;
  if (input.tagName === 'ClientLN') return ln;

  const ldInst = input.getAttribute('ldInst')!;

  const doName = input.getAttribute('doName');
  const daName = input.getAttribute('daName') ?? '';

  return `${ldInst}/${ln}.${doName}.${daName}`;
}

export function inputSupportingText(input: Element): string | undefined {
  const desc = input.getAttribute('desc');
  if (input.tagName === 'ClientLN') return desc ? `${desc}` : undefined;

  const intAddr = input.getAttribute('intAddr');

  if (desc || intAddr) return `${desc ?? ''}${intAddr ? ` (${intAddr})` : ''}`;

  return undefined;
}
