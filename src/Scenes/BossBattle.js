class BossBattle extends BasicShootingScene {

    init(data) {
        console.log('init', data);
        this.score = data.score;
        this.stage = "buildUp";
        this.boss = undefined;
        this.enemyProjectileArray = [];
        this.lives = data.lives;

    }

    constructor() {
        super("BossBattle");
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
    }

    update() {
        super.update();

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

            //spawn the duck if it doesnt exist
            if (this.boss === undefined) {
                this.boss = this.add.sprite(400, 200, 'duck_dirty').setScale(3);
                this.boss.data = {health: 50};
                this.enemyArray.push(this.boss);
                this.healthText = this.add.text(300, 10, 'Health:', {fontSize: '32px'});
                this.healthBar = this.add.rectangle(350, 50, 100, 20, 0x00ff00);
            }

            //spawn bullets
            if (Math.random() < 0.04) {
                this.spawnPlayerTargeted(this.boss, "dirt_projectile", this.enemyProjectileArray)
                if (Math.random() < .7 ) {
                    this.spawnRandomTargeted(this.boss, "dirt_projectile", this.enemyProjectileArray)
                }

            }

            //move the boss
            this.moveBossDuck();

            //update health bar
            this.healthBar.width = this.boss.data.health * 4;

            //remove any stray bullets that shouldnt be there
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

        if (this.stage === "END") {
            this.boss.data = false;
            this.boss.destroy();
            this.stage = "SCORE";
        }

        if (this.stage === "SCORE") {
            this.healthBar.destroy();
            this.healthText.destroy();
            this.scene.start("GameOver", {score: this.score});
        }

    }

    //Stages of the battle,
    //1. A small white circle appears at the center of the screen
    //2. ducks fly from the edges of the screen to the center, into the circle
    //3. The circle grows until the screen is filled with white
    //4. The boss appears (giant dirty duck) and the player must fight it

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
        for (let i = 0; i < this.playerProjectileArray.length; i++) {
            if (this.doesOverlap(this.boss, this.playerProjectileArray[i])) {
                this.playerProjectileArray[i].destroy();
                this.playerProjectileArray.splice(i, 1);
                this.boss.data.health -= 1;
                if (this.boss.data.health < 1) {
                    this.stage = "END";
                }
                console.log(this.boss.data.health);
            }
        }

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
        if (texture === "health_pack") {
            newProjectile.setScale(2);
            newProjectile.setData("isHealth", true);
        } else {
            newProjectile.setScale(1);
        }

        newProjectile.startFollow(
            {
                duration: 10000,
                yoyo: false,
                repeat: 0
            }
        ).setDepth(-1)
        array.push(newProjectile);
    }

    spawnRandomTargeted(sourceSprite, texture, array) {
        let randLoc = this.randomBorderCoordinate();
        let tempSpline = new Phaser.Curves.Spline([
            sourceSprite.x, sourceSprite.y,
            randLoc.x, randLoc.y
        ])
        let newProjectile = this.add.follower(tempSpline, sourceSprite.x, sourceSprite.y, texture);
        if (texture === "health_pack") {
            newProjectile.setScale(2);
            newProjectile.setData("isHealth", true);
        } else {
            newProjectile.setScale(1);
        }

        newProjectile.startFollow(
            {
                duration: 10000,
                yoyo: false,
                repeat: 0
            }
        ).setDepth(-1)
        array.push(newProjectile);
    }

    moveBossDuck() {
        if(this.follower.isFollowing()){
            this.boss.setX(this.follower.x);
            this.boss.setY(this.follower.y);
            return;
        }
        console.log("AAAA");
        //get a random location
        let randLoc = this.randomBorderCoordinate();
        //if it is lower that 400, move it up
        if (randLoc.y > 300) {
            randLoc.y = Math.random() *300;
        }
        //create a spline to the new location
        let tempSpline = new Phaser.Curves.Spline([
            this.boss.x, this.boss.y,
            randLoc.x, randLoc.y
        ])
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
}

