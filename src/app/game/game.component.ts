import { Component, OnInit } from '@angular/core';

import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  green: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  blue: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  greenKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  blueKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'main' });
  }

  preload() {
    this.load.setBaseURL('');
    this.load.image('blueBox', 'assets/images/blue.png');
    this.load.image('greenBox', 'assets/images/green.png');
  }

  create() {
    this.blue = this.physics.add.image(100, 100, 'blueBox').setCollideWorldBounds(true);
    this.green = this.physics.add.image(300, 340, 'greenBox').setCollideWorldBounds(true);

    this.greenKeys = this.input.keyboard.createCursorKeys();
    this.blueKeys = this.input.keyboard.addKeys('a,s,d,w') as Phaser.Types.Input.Keyboard.CursorKeys;

    this.physics.add.collider(this.green, this.blue, undefined);
  }

  override update() {
    if (this.blueKeys.left.isDown) {
      this.blue.setVelocityX(-200);
    } else if (this.blueKeys.right.isDown) {
      this.blue.setVelocityX(200);
    } else if (this.blueKeys.up.isDown) {
      this.blue.setVelocityY(-200);
    } else if (this.blueKeys.down.isDown) {
      this.blue.setVelocityY(200);
    }

    if (this.greenKeys.left.isDown) {
      this.green.setVelocityX(-200);
    } else if (this.greenKeys.right.isDown) {
      this.green.setVelocityX(200);
    } else if (this.greenKeys.up.isDown) {
      this.green.setVelocityY(-200);
    } else if (this.greenKeys.down.isDown) {
      this.green.setVelocityY(200);
    }
  }
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;

  ngOnInit() {
    this.phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      scene: [ MainScene ],
      scale: {
        mode: Phaser.Scale.FIT,
        parent: 'gameContainer',
        height: 600,
        width: 600
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }
        }
      }
    });
  }
}
