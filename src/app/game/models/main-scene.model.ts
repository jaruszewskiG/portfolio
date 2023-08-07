import { Enemy } from "../game-objects/enemy";
import { Player } from "../game-objects/player";

export interface IMainScene extends Phaser.Scene {
  platforms: Phaser.Tilemaps.TilemapLayer;
  player: Player;
  enemies: Phaser.Physics.Arcade.Group;
  stars: Phaser.Physics.Arcade.Group;
  bombs:  Phaser.Physics.Arcade.Group;
  score: number;
  scoreText: Phaser.GameObjects.Text;
  isGameOver: boolean;
  gameOverText: Phaser.GameObjects.Text;
  tilemap: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
}
