import { ConditionFunc, Conditions } from './condition'
import { WorldState } from './world-state'

export class Method<WS extends WorldState> {
  protected _conditions: Conditions<WS>
  get conditions(): Conditions<WS> {
    return this._conditions
  }
  constructor(conditions: ConditionFunc<WS>[], protected subtaskNames: string[]) {
    this._conditions = new Conditions(conditions)
  }
  public getSubtaskNames(): string[] {
    return this.subtaskNames.map(n => n)
  }
}
