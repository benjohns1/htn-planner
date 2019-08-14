import { ConditionFunc, Conditions } from './condition'
import { EffectFunc, Effects } from './effect'
import { Response } from './response'
import { Node } from './node'
import { WorldState } from './world-state'

export type OperatorFunc<WS extends WorldState> = (ws: WS) => Response

export class PrimitiveTask<WS extends WorldState> extends Node {
  protected conditions: Conditions<WS>
  protected effects: Effects<WS>
  constructor(
    name: string,
    conditions: ConditionFunc<WS>[],
    protected operator: OperatorFunc<WS>,
    effects: EffectFunc<WS>[]
  ) {
    super(name)
    this.conditions = new Conditions(conditions)
    this.effects = new Effects(effects)
  }
  public plan(ws: WS): boolean {
    if (!this.conditions.areValid(ws)) {
      return false
    }

    this.effects.apply(ws)
    return true
  }
  public run(ws: WS): Response {
    if (!this.conditions.areValid(ws)) {
      return Response.Failure
    }

    const operatorResponse = this.operator(ws)
    if (operatorResponse === Response.Success) {
      this.effects.apply(ws)
    }

    return operatorResponse
  }
}
