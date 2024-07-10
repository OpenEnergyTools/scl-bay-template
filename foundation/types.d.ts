export interface IED {
    element: Element;
    name: string;
}
export interface Connection {
    id: string;
    source: {
        ied: Element;
        controlBlock: Element;
    };
    target: {
        ied: Element;
        /** Could be `ClientLN` or `ExtRef` */
        inputs: Element[];
    };
}
export type SourceEquipment = {
    equipment: Element;
    controlBlocks: Element[];
};
export interface Equipment {
    element: Element;
}
