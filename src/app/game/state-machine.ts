import { IState } from "./models/state-machine.model";

let idCount: number = 0;

export default class StateMachine {
  private states = new Map<string, IState>();
  private currentState?: IState;
  private id = (++idCount).toString();
	private context?: object;
  private isChangingState: boolean = false;
  private changeStateQueue: string[] = [];

  constructor(context?: object, id?: string){
		this.id = id ?? this.id;
		this.context = context;
	}

  addState(config: IState): StateMachine {
    this.states.set(config.name, {
      name: config.name,
      onEnter: config.onEnter?.bind(this.context),
      onUpdate: config.onUpdate?.bind(this.context),
      onExit: config.onExit?.bind(this.context),
    });

    return this;
  }

  setState(name: string): void {
    if (!this.states.has(name)) {
      console.warn(`Tried to change to unknown state: ${name}`);
      return;
    }
  
    if (this.isCurrentState(name)) {
      return;
    }
  
    if (this.isChangingState) {
      this.changeStateQueue.push(name);
      return;
    }
  
    this.isChangingState = true;
  
    console.log(`[StateMachine (${this.id})] change from ${this.currentState?.name ?? 'none'} to ${name}`);
  
    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit();
    }
  
    this.currentState = this.states.get(name)!;
  
    if (this.currentState.onEnter) {
      this.currentState.onEnter();
    }
  
    this.isChangingState = false;
  }

  update(delta: number): void {
    if (this.changeStateQueue.length > 0) {
      this.setState(this.changeStateQueue.shift()!);
      return;
    }
  
    if (this.currentState && this.currentState.onUpdate) {
      this.currentState.onUpdate(delta);
    }
  }

  isCurrentState(name: string): boolean {
		return this.currentState?.name === name;
	}
}