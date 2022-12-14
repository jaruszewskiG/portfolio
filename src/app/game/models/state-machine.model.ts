export interface IState {
  name: string;
  onEnter?: () => void;
  onUpdate?: (delta: number) => void;
  onExit?: () => void;
}