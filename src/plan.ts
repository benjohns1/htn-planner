import { Domain } from './domain'
import { Logger } from './logger'
import { Response } from './response'
import { WorldState } from './world-state'

export interface RawPlanData {
  valid: boolean
  taskNames: string[]
  runningIndex: number
}

export class Plan<WS extends WorldState> {
  protected valid: boolean = false
  protected taskNames: string[] = []
  protected runningIndex: number = 0
  constructor(protected ws: WS, protected log: Logger, protected domain: Domain<WS>, data?: RawPlanData) {
    if (data !== undefined) {
      this.valid = data.valid
      this.taskNames = data.taskNames
      this.runningIndex = data.runningIndex
    }
  }
  public isValid(): boolean {
    return this.valid
  }
  public finalize(taskNames: string[], valid: boolean) {
    this.taskNames = taskNames
    this.valid = valid
  }
  public run(): Response {
    this.log.debug('running plan')
    const response = this.runResponse()
    if (response === Response.Failure || response === Response.Success) {
      this.valid = false // invalidate plan if it is complete
    }
    return response
  }
  protected runResponse(): Response {
    if (!this.valid) {
      return Response.Failure
    }

    for (let i = this.runningIndex; i < this.taskNames.length; i++) {
      const taskName = this.taskNames[i]
      const task = this.domain.getPrimitiveTask(taskName)
      if (task === undefined) {
        this.log.error(`primitive task '${taskName}' at plan index ${i} not found in domain`)
        return Response.Failure
      }
      this.log.debug(`running task '${task.name}'`)
      try {
        const taskResponse = task.run(this.ws)
        if (taskResponse === Response.Running) {
          this.runningIndex = i
          return Response.Running
        }
        if (taskResponse === Response.Failure) {
          this.log.debug(`task operator '${task.name}' failed`)
          return Response.Failure
        }
        if (taskResponse !== Response.Success) {
          this.log.error(`unknown task response type ${taskResponse}`)
        }
      } catch (error) {
        this.log.error(`error running task '${task.name}': ${error}`)
        return Response.Failure
      }
    }
    return Response.Success
  }
  public toString(): string {
    return `valid: ${this.valid}, runningIndex: ${this.runningIndex}, count: ${
      this.taskNames.length
    }, tasks: [${this.taskNames.join(', ')}]`
  }
  public serialize(): RawPlanData {
    return {
      runningIndex: this.runningIndex,
      taskNames: this.taskNames.map(n => n),
      valid: this.valid,
    }
  }
}
