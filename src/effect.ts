import { WorldState } from './world-state'

export type EffectFunc<WS extends WorldState> = (ws: WS) => void

export class Effects<WS extends WorldState> {
  constructor(protected effects: EffectFunc<WS>[]) {}
  public apply(ws: WS): void {
    for (const effect of this.effects) {
      effect(ws)
    }
  }
}
