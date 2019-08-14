import { WorldState } from './world-state'

export type ConditionFunc<WS extends WorldState> = (ws: WS) => boolean

export class Conditions<WS extends WorldState> {
  constructor(protected conditions: ConditionFunc<WS>[]) {}
  public areValid(ws: WS): boolean {
    for (const condition of this.conditions) {
      if (!condition(ws)) {
        return false
      }
    }
    return true
  }
}
