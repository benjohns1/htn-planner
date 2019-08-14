# HTN Planner
Hierachical task network planner written in TypeScript

## Usage

### TypeScript
```typescript
import * as Htn from 'htn'

class MyWorldState extends Htn.WorldState {
    constructor(public state: bool = false) {}
}

class MyLogger {
    debug(message?: any, ...optionalParams: any[]) {
        console.log(message, ...optionalParams)
    }
    error(message?: any, ...optionalParams: any[]) {
        console.log(`<span style='color:red'>${message}</span>`, ...optionalParams)
    }
}

class MyDomainBuilder {
    public static build(): Htn.Domain<MyWorldState> {


        const domain = new Htn.Domain(

        )
    }
}

const logger = new MyLogger()

// Define your planning domain
const domain = {} // TODO :-)

// Create a plan manager
const worldState = new MyWorldState(true)
const htnManager = Htn.Manager.createManager(worldState, domain, logger)

// Run the manager (runs the plan or replans as-needed)
htnManager.run()
```