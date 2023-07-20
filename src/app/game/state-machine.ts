import { EventEmitter } from "@angular/core";
import { IState } from "./models/state-machine.model";

let idCount: number = 0;

export default class StateMachine {
  public stateChanged: EventEmitter<string> = new EventEmitter();

  private states = new Map<string, IState>();
  private currentState?: IState;
  private id = (++idCount).toString();
	private context?: object;
  private throttleTime: number = 0;
  private isChangingState: boolean = false;
  private changeStateQueue: string[] = [];
  private lastStateChangeTimestamp: number;

  public get currentStateName(): string | undefined  {
    return this.currentState?.name;
  }
  
  private get timeSinceLastStateChange(): number {
    return performance.now() - this.lastStateChangeTimestamp;
  }

  constructor(context?: object, id?: string, throttleTime: number = 0){
		this.id = id ?? this.id;
		this.context = context;
    this.throttleTime = throttleTime;
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
  
    if (this.isCurrentState(name) || this.timeSinceLastStateChange < this.throttleTime) {
      return;
    }
  
    if (this.isChangingState) {
      this.changeStateQueue.push(name);
      return;
    }
  
    this.isChangingState = true;
  
    console.log(`[StateMachine (${this.id})] change from ${this.currentState?.name ?? 'none'} to ${name}`);
    this.stateChanged.emit(name);
  
    if (this.currentState && this.currentState.onExit) {
      this.currentState.onExit();
    }
  
    this.currentState = this.states.get(name)!;
  
    if (this.currentState.onEnter) {
      this.currentState.onEnter();
    }
  
    this.lastStateChangeTimestamp = performance.now();
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