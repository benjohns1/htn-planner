import { Method } from './method'
import { Node, NodeType } from './node'
import { WorldState } from './world-state'

export class CompoundTask<WS extends WorldState> extends Node {
  constructor(name: string, protected methods: Method<WS>[]) {
    super(name, NodeType.Compound)
  }
  public decompose(ws: WS, methodIndex: number): string[] | undefined {
    for (; methodIndex < this.methods.length; methodIndex++) {
      const m = this.methods[methodIndex]
      if (m.conditions.areValid(ws)) {
        return m.getSubtaskNames()
      }
    }
    return undefined
  }
}
