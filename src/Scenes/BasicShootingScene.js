class BasicShootingScene extends Phaser.Scene {

    constructor(levelName) {
        super(levelName);


        this.score = 0;
        this.lives = 3;
    }

    preload() {
        this.load.setPath('./assets/');

        //the player sprite and bullets will always be the same. Just register all of them
        this.load.image('player', 'jumper/PNG/Enemies/spikeMan_stand.png');
        this.load.image('projectile', 'space/PNG/Lasers/laserBlue16.png');
    }

    create() {
        //Arrays to store all of the different types of sprites
        this.playerProjectileArray = [];
        this.enemyProjectileArray = [];
        this.enemyArray = [];

        //create the player sprite used for all of these
        this.playerSprite = this.add.sprite(30, 560, 'player').setScale(0.5);

        //display the lives left for the player on the top left corner
        this.livesText = this.add.text(16, 16, 'Lives: 3', { fontSize: '32px' });
        //display the score on the top right corner
        this.scoreText = this.add.text(600, 16, 'Score: 0', { fontSize: '32px' });


        //default keys for player movement and shooting
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        this.doPlayerMovement();
        this.fireProjectile();
        this.updateText();

        //if the player runs out of lives, go to the game over screen
        if(this.lives <= 0){
            this.scene.start("GameOver", {score: this.score});
        }
    }

    doPlayerMovement() {
        if (this.aKey.isDown) {
            this.playerSprite.x -= 10;
            if (this.playerSprite.x <= 20){
                this.playerSprite.x = 20;
            }
        }

        if (this.dKey.isDown) {
            this.playerSprite.x += 10;
            if (this.playerSprite.x >= 780){
                this.playerSprite.x = 780;
            }
        }
    }

    fireProjectile() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.playerProjectileArray.length < 20){
            this.projectileSprite = this.add.sprite(this.playerSprite.x, this.playerSprite.y - 50, 'projectile');
            this.playerProjectileArray.push(this.projectileSprite);
        }
        for(let i = 0; i < this.playerProjectileArray.length; i++){
            this.playerProjectileArray[i].y -= 10;
            if(this.playerProjectileArray[i].y <= 0){
                this.playerProjectileArray[i].destroy();
                this.playerProjectileArray.splice(i, 1);
            }
        }
    }

    doesOverlap(sprite1, sprite2) {
        if(Math.abs(sprite1.x - sprite2.x) > (sprite1.displayWidth / 2 + sprite2.displayWidth / 2)){
            return false;
        }
        if(Math.abs(sprite1.y - sprite2.y) > (sprite1.displayHeight / 2 + sprite2.displayHeight / 2)){
            return false;
        }
        return true;
    }

    //returns an array starting at the xy coords of the current sprite and ending at the xy coords 30 pixels past the current target following the same angle assuming that sprite 2 is the one we want to go past.
    createExtendedSpline(sprite1, sprite2) {
    // Get the angle between the two sprites
    let angle = Phaser.Math.Angle.Between(sprite1.x, sprite1.y, sprite2.x, sprite2.y);

    // Create a spline from the current sprite to a point 1000 pixels past the target sprite
    let spline = [
        sprite1.x, sprite1.y,
        sprite2.x + Math.cos(angle) * 1000,
        sprite2.y + Math.sin(angle) * 1000
    ];

    return new Phaser.Curves.Spline(spline);
}

    //returns an array starting at the xy coords of the current sprite and ending at the xy coords of the target sprite
    createSpline(sprite1, sprite2){
        let spline = [
            sprite1.x, sprite1.y,
            sprite2.x, sprite2.y
        ];
        return new Phaser.Curves.Spline(spline);
    }

    //update the score and lives text
    updateText(){
        this.livesText.setText('Lives: ' + this.lives);
        this.scoreText.setText('Score: ' + this.score);
    }
}