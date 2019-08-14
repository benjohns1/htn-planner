export class WorldState {
  public static copy<WS extends WorldState>(ws: WS): WS {
    return JSON.parse(JSON.stringify(ws))
  }
}
