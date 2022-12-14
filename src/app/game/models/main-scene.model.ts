import { Player } from "../game-objects/player";

export interface IMainScene extends Phaser.Scene {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  player: Player;
  stars: Phaser.Physics.Arcade.Group;
  bombs:  Phaser.Physics.Arcade.Group;
  score: number;
  scoreText: Phaser.GameObjects.Text;
  isGameOver: boolean;
  gameOverText: Phaser.GameObjects.Text;
}
