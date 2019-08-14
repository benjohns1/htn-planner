import { Logger } from './logger'
import { Node, NodeType } from './node'
import { WorldState } from './world-state'
import { PrimitiveTask } from './primitive-task'

export class Domain<WS extends WorldState> {
  protected tasks: { [taskName: string]: Node } = {}
  constructor(public defaultRootTask: Node, protected log: Logger) {}
  public add(task: Node): boolean {
    if (this.tasks[task.name]) {
      this.log.error(`task name '${task.name}' has already been added to the domain`)
      return false
    }
    this.tasks[task.name] = task
    return true
  }
  public getNode(taskName: string): Node | undefined {
    const node = this.tasks[taskName]
    if (node === undefined) {
      this.log.error(`node '${taskName}' could not be found in domain`)
      return
    }
    return node as Node
  }
  public getPrimitiveTask(taskName: string): PrimitiveTask<WS> | undefined {
    const task = this.getNode(taskName)
    if (task === undefined) {
      return
    }
    if (task.type !== NodeType.Primitive) {
      this.log.error(`task '${taskName}' was expected to be ${NodeType.Primitive}, but instead was ${task.type}`)
      return
    }
    return task as PrimitiveTask<WS>
  }
  public getNodes(taskNames: string[]): Node[] {
    return taskNames.reduce((tasks: Node[], name: string) => {
      const task = this.tasks[name]
      if (task === undefined) {
        this.log.error(`task name '${name}' could not be found in domain`)
      } else {
        tasks.push(task)
      }
      return tasks
    }, [])
  }
}
