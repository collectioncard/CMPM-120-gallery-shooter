class BossBattle extends BasicShootingScene {

    constructor() {
        super("BossBattle");
    }

    init(data) {
        this.score = data.score;
        this.stage = "buildUp";
        this.boss = undefined;
        this.enemyProjectileArray = [];
        this.lives = data.lives;
        this.enteredStage3 = false;
        this.bulletRate = 0.02;

        //debug
        console.log("Press + to increase bullet rate, - to decrease bullet rate");
    }

    preload() {
        super.preload();

        //// Begin Asset Loading ////
        this.load.image('duck_dirty', "custom/duck_dirty.png");
        this.load.image('white_star', 'space/PNG/Effects/star2.png');
        this.load.image('dirt_projectile', 'jumper/PNG/Particles/particle_brown.png');
    }

    create() {
        super.create();
        this.star = this.add.sprite(400, 300, 'white_star').setScale(0.1);
        this.follower = this.add.follower(new Phaser.Curves.Spline([400, 300, 400, 300]), 400, 300, 'duck_dirty')
            .setScale(.0001)
            .setDepth(-999);

        //inc and dec the bullet rate with the + and - key
        this.plusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.PLUS);
        this.minusKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.MINUS);
    }

    //Stages of the battle,
    //1. A small white circle appears at the center of the screen
    //2. ducks fly from the edges of the screen to the center, into the circle
    //3. The circle grows until the screen is filled with white
    //4. The boss appears (giant dirty duck) and the player must fight it
    update() {
        super.update();

        ///DEBUG CODE
        if (Phaser.Input.Keyboard.JustDown(this.plusKey)) {
            this.bulletRate += 0.01;
            console.log("Bullet Rate inc to: " + this.bulletRate);
        }
        if (Phaser.Input.Keyboard.JustDown(this.minusKey) && this.bulletRate > 0) {
            this.bulletRate -= 0.01;
            console.log("Bullet Rate dec to: " + this.bulletRate);
        }
        ////END DEBUG CODE


        if (this.stage === "buildUp") {

            //Star Growing and rotating
            this.star.setScale(this.star.scale * 1.008);
            this.star.angle = this.star.angle + (1);


            //spawning ducks into the star

            if (this.star.scale > 100) {
                this.stage = "fight";
                this.star.destroy();
                this.deleteArray(this.enemyProjectileArray);
            } else {
                let tempx = this.randomBorderCoordinate().x;
                let tempy = this.randomBorderCoordinate().y;
                let tempSpline = new Phaser.Curves.Spline([
                    tempx, tempy,
                    400, 300
                ]);

                let newProjectile = this.add.follower(tempSpline, tempx, tempy, "duck_dirty")
                    .setScale(0.5)
                    .startFollow(
                        {
                            duration: 500,
                            yoyo: false,
                            repeat: 0
                        }
                    ).setDepth(-1);

                this.enemyProjectileArray.push(newProjectile);
            }
        }

        if (this.stage === "fight") {

            //spawn the duck if it doesn't exist
            if (this.boss === undefined) {
                this.boss = this.add.sprite(400, 200, 'duck_dirty').setScale(3);
                this.boss.data = {health: 100};
                this.enemyArray.push(this.boss);
                this.healthText = this.add.text(300, 10, 'Health:', {fontSize: '32px'});
                this.healthBar = this.add.rectangle(250, 50, 100, 20, 0x00ff00);
            }

            this.doBasicBossFight();

            //if the boss drops below 75 health move to the next stage
            if (this.boss.data.health <= 75) {
                this.stage = "fight_move";
            }
        }

        if (this.stage === "fight_move") {
            //do the basic boss fight
            this.doBasicBossFight();

            //move the boss too
            this.moveBossDuck();

            //if the boss drops below 50 health move to the next stage
            if (this.boss.data.health <= 50) {
                this.stage = "fight_last";
            }

        }

        if (this.stage === "fight_last") {
            if (!this.enteredStage3) {
                //spawn 3 walls of ducks and put them into the enemy array
                for (let i = 0; i < 18; i++) {
                    for (let j = 0; j < 3; j++) {
                        let tempDuck = this.add.sprite(i * 50, 270 + j * 100, 'duck_dirty').setScale(0.5);
                        if (j % 2 === 1) {
                            tempDuck.flipX = true;
                        }
                        this.enemyArray.push(tempDuck);
                    }
                }
                this.enteredStage3 = true;
            }


            //do the basic boss fight
            this.doBasicBossFight();

            //move the boss too
            this.moveBossDuck();

            //move everything in the enemy array to the right. If it goes off screen, wrap it around
            for (let i = 0; i < this.enemyArray.length; i++) {
                if (this.enemyArray[i].flipX) {
                    this.enemyArray[i].x -= 1;
                } else {
                    this.enemyArray[i].x += 1;
                }

                if (this.enemyArray[i].x > 850 && !this.enemyArray[i].flipX) {
                    this.enemyArray[i].x = -50;
                } else if (this.enemyArray[i].x < -50 && this.enemyArray[i].flipX) {
                    this.enemyArray[i].x = 850;
                }
            }
        }

        if (this.stage === "END") {
            this.boss.data = false;
            this.boss.destroy();
            this.score += 4600;
            this.stage = "SCORE";
        }

        if (this.stage === "SCORE") {
            this.healthBar.destroy();
            this.healthText.destroy();
            this.scene.start("GameOver", {score: this.score, lives: this.lives});
        }

    }

    //destroys all of the sprites in an array and then clears the array
    deleteArray(array) {
        for (let i = 0; i < array.length; i++) {
            array[i].active = false;
            array[i].destroy();
        }
        this.enemyProjectileArray = [];
    }

    //a function that chooses a random coordinate on the border of the screen
    randomBorderCoordinate() {
        let side = Math.floor(Math.random() * 4);
        let x = Math.random() * 800;
        let y = Math.random() * 600;
        if (side === 0) {
            return {x: x, y: 0};
        } else if (side === 1) {
            return {x: x, y: 600};
        } else if (side === 2) {
            return {x: 0, y: y};
        } else {
            return {x: 800, y: y};
        }
    }

    doCollisionCheck() {
        // Check for collision between player projectiles and boss
        this.playerProjectileArray = this.playerProjectileArray.filter((projectile, i) => {
            if (this.doesOverlap(this.boss, projectile)) {
                projectile.destroy();
                this.boss.data.health -= 1;
                if (this.boss.data.health < 1) {
                    this.stage = "END";
                }
                return false;
            }
            return true;
        });

        // Check for collision between player projectiles and ducks
        this.playerProjectileArray = this.playerProjectileArray.filter((playerProjectile, i) => {
            let collision = false;
            this.enemyArray = this.enemyArray.filter((enemy, j) => {
                if (this.doesOverlap(playerProjectile, enemy)) {

                    playerProjectile.destroy();
                    enemy.destroy();
                    this.score += 100;
                    collision = true;
                    return false;
                }
                return true;
            });
            return !collision;
        });

        // Check for collision between duck projectiles and player
        this.enemyProjectileArray = this.enemyProjectileArray.filter((enemyProjectile) => {
            if (this.doesOverlap(enemyProjectile, this.playerSprite)) {
                this.lives += enemyProjectile.getData("isHealth") ? 1 : -1;
                enemyProjectile.destroy();
                return false;
            }
            return true;
        });

    }

    spawnPlayerTargeted(sourceSprite, texture, array) {
        let tempSpline = this.createExtendedSpline(sourceSprite, this.playerSprite);
        let newProjectile = this.add.follower(tempSpline, sourceSprite.x, sourceSprite.y, texture);

        newProjectile.startFollow(
            {
                duration: 10000,
                yoyo: false,
                repeat: 0
            }
        ).setDepth(-1);
        array.push(newProjectile);
    }

    spawnRandomTargeted(sourceSprite, texture, array) {
        let randLoc = this.randomBorderCoordinate();
        let tempSpline = new Phaser.Curves.Spline([
            sourceSprite.x, sourceSprite.y,
            randLoc.x, randLoc.y
        ]);
        let newProjectile = this.add.follower(tempSpline, sourceSprite.x, sourceSprite.y, texture);

        newProjectile.startFollow(
            {
                duration: 10000,
                yoyo: false,
                repeat: 0
            }
        ).setDepth(-1);
        array.push(newProjectile);
    }

    moveBossDuck() {
        if (this.follower.isFollowing()) {
            this.boss.setX(this.follower.x);
            this.boss.setY(this.follower.y);
            return;
        }

        //get a random location
        let randLoc = this.randomBorderCoordinate();
        //if it is lower that 400, move it up
        if (randLoc.y > 300) {
            randLoc.y = Math.random() * 300;
        }

        //create a spline to the new location
        let tempSpline = new Phaser.Curves.Spline([
            this.boss.x, this.boss.y,
            randLoc.x, randLoc.y
        ]);
        this.follower.destroy();

        //create a follower
        this.follower = this.add.follower(tempSpline, this.boss.x, this.boss.y, 'duck_dirty')
            .setScale(.03)
            .setDepth(-99);

        //move the follower along the spline
        this.follower.startFollow({
            duration: 1000,
            yoyo: false,
            repeat: 0
        });
    }

    doBasicBossFight() {
        //spawn bullets
        if (Math.random() < this.bulletRate) {
            this.spawnRandomTargeted(this.boss, "dirt_projectile", this.enemyProjectileArray)

            if (Math.random() < .5) {
                this.spawnPlayerTargeted(this.boss, "dirt_projectile", this.enemyProjectileArray)
            }
        }

        //update health bar
        this.healthBar.width = this.boss.data.health * 4;

        //remove any stray bullets that shouldn't be there
        this.enemyProjectileArray = this.enemyProjectileArray.filter((enemyProjectile) => {
            if (!enemyProjectile.isFollowing()) {
                enemyProjectile.destroy();
                return false;
            }
            return true;
        });

        //check collision
        this.doCollisionCheck();
    }
}

