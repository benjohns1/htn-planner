import { CompoundTask } from './compound-task'
import { Domain } from './domain'
import { Logger } from './logger'
import { Plan } from './plan'
import { PrimitiveTask } from './primitive-task'
import { Node, NodeType } from './node'
import { WorldState } from './world-state'

type RestoreHistory<WS extends WorldState> = Array<{
  finalTasks: string[]
  nodesToProcess: NodesToProcess
  worldState: WS
}>

type NodesToProcess = NodeState[]

type NodeState = {
  node: Node
  methodIndex: number
}

export type NodeName = string

export class Planner<WS extends WorldState> {
  protected simWorldState?: WS
  protected nodesToProcess: NodesToProcess = []
  protected finalTasks: string[] = []
  protected restoreHistory: RestoreHistory<WS> = []
  protected rollbackCount: number = 0
  protected valid: boolean = false
  constructor(
    protected ws: WS,
    protected domain: Domain<WS>,
    protected log: Logger,
    protected rootTaskName?: NodeName
  ) {}
  public generate(): Plan<WS> {
    this.log.debug('generating new plan')
    this.resetState()
    while (this.nodesToProcess.length > 0) {
      const processTask = this.nodesToProcess.pop()
      if (processTask === undefined) {
        break
      }
      switch (processTask.node.type) {
        case NodeType.Compound:
          this.processCompound(processTask)
          break
        case NodeType.Primitive:
          this.processPrimitive(processTask)
          break
        default:
          this.log.error(`unknown node type '${processTask.node.type}'`)
      }
    }
    const finalPlan = new Plan<WS>(this.ws, this.log, this.domain)
    finalPlan.finalize(this.finalTasks, this.valid)
    this.log.debug(`final plan = ${finalPlan.toString()}`)
    return finalPlan
  }
  protected resetState() {
    this.rollbackCount = 0
    this.simWorldState = WorldState.copy<WS>(this.ws)
    this.nodesToProcess = [{ node: this.chooseRootTask(), methodIndex: 0 }]
    this.finalTasks = []
    this.restoreHistory = []
    this.valid = true
  }
  protected chooseRootTask(): Node {
    if (this.rootTaskName !== undefined) {
      const customRootTask = this.domain.getNode(this.rootTaskName)
      if (customRootTask !== undefined) {
        return customRootTask
      }
    }
    return this.domain.defaultRootTask
  }
  protected processPrimitive(nodeState: NodeState) {
    const primitiveTask = nodeState.node as PrimitiveTask<WS>
    try {
      if (!primitiveTask.plan(this.simWorldState as WS)) {
        this.rollback(`primitive task '${primitiveTask.name}': conditions not met`)
        return
      }
    } catch (error) {
      this.log.error(`error planning task '${primitiveTask.name}': ${error}`)
      this.rollback(`primitive task '${primitiveTask.name}': planning error`)
      return
    }
    this.finalTasks.push(primitiveTask.name)
  }
  protected processCompound(nodeState: NodeState) {
    const compoundTask = nodeState.node as CompoundTask<WS>
    let subtaskNames: string[] | undefined
    try {
      subtaskNames = compoundTask.decompose(this.simWorldState as WS, nodeState.methodIndex)
    } catch (error) {
      this.log.error(`error decomposing task '${compoundTask.name}': ${error}`)
      this.rollback(`compound task '${compoundTask.name}': decomposition error`)
      return
    }
    if (subtaskNames === undefined) {
      this.rollback(`compound task '${compoundTask.name}': could not find any matching methods`)
      return
    }
    this.pushRestoreHistory(compoundTask, nodeState.methodIndex)
    subtaskNames.reverse()
    const subtasks = this.domain.getNodes(subtaskNames).map(n => ({ node: n, methodIndex: 0 }))
    this.nodesToProcess.push(...subtasks)
  }
  protected pushRestoreHistory(compoundTask: CompoundTask<WS>, methodIndex: number) {
    const tasksToProcess: NodesToProcess = this.nodesToProcess.map(t => t)
    tasksToProcess.push({ node: compoundTask, methodIndex: methodIndex + 1 })
    this.restoreHistory.push({
      nodesToProcess: tasksToProcess,
      finalTasks: this.finalTasks.map(t => t),
      worldState: WorldState.copy<WS>(this.ws),
    })
  }
  protected rollback(msg: string) {
    this.rollbackCount += 1
    this.log.debug(`${msg}, rolling back plan, count: ${this.rollbackCount}`)
    const restorePoint = this.restoreHistory.pop()
    if (restorePoint === undefined) {
      this.log.debug(`no more restore points, planning failed, total roll backs attempted: ${this.rollbackCount}`)
      this.valid = false
      return
    }
    this.nodesToProcess = restorePoint.nodesToProcess
    this.finalTasks = restorePoint.finalTasks
    this.simWorldState = restorePoint.worldState
  }
}
