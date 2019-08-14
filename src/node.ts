export enum NodeType {
  Primitive,
  Compound,
}

export abstract class Node {
  constructor(public name: string, public type: NodeType = NodeType.Primitive) {}
}
