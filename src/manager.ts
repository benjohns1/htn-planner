import { Logger } from './logger'
import { Plan, RawPlanData } from './plan'
import { Planner } from './planner'
import { WorldState } from './world-state'
import { Domain } from './domain'

export class Manager<WS extends WorldState> {
  constructor(protected planner: Planner<WS>, protected plan: Plan<WS>, protected log: Logger) {}
  public run(): void {
    if (!this.plan.isValid()) {
      this.log.debug(`generating a new plan`)
      this.plan = this.planner.generate()
    }
    let planResponse = this.plan.run()
    this.log.debug(`run plan = ${planResponse}`)
  }
  public serialize(): RawPlanData {
    return this.plan.serialize()
  }
  public static createManager<WS extends WorldState>(
    worldState: WS,
    domain: Domain<WS>,
    log: Logger,
    serializedPlan?: RawPlanData
  ) {
    const planner = new Planner(worldState, domain, log)
    let plan: Plan<WS>
    if (serializedPlan === undefined) {
      plan = new Plan(worldState, log, domain)
    } else {
      log.debug('deserializing plan')
      plan = new Plan(worldState, log, domain, serializedPlan)
    }
    return new Manager(planner, plan, log)
  }
}
