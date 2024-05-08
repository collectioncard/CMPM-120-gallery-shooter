/*
Thomas Wessel
Created: 2021-03-01
CMPM 120 - Game Development Experience - University of California, Santa Cruz

Duck Washing Game

A simple gallery shooter where you have to wash ducks to get points.

Art Assets from Kenny Assets packs and freesound.org

 */

"use strict"

let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    width: 800,
    height: 600,
    scene: [StartScreen, HighScores, levelOne, GameOver, BossBattle]
    }
    const game = new Phaser.Game(config);
