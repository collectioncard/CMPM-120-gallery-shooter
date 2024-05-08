class levelOne extends BasicShootingScene {

    constructor() {
        super("levelOne");
    }

    preload() {
        super.preload();

        //// Begin Asset Loading ////

        //enemy sprites
        this.load.image('duck_clean', "ducks/PNG/Objects/duck_yellow.png");
        this.load.image('duck_dirty', "custom/duck_dirty.png");
        this.load.image('dirt_projectile', 'jumper/PNG/Particles/particle_brown.png');
        this.load.image('duck_health', "custom/duck_health.png");
        this.load.image('health_pack', "shmup/Tiles/tile_0024.png")
        this.load.image('invincible_duck', "ducks/PNG/Objects/duck_outline_yellow.png")

        //load the enemy behavior json file
        this.load.json('enemyBehavior', 'enemyBehavior.json');

        //// End Asset Loading ////
    }

    create() {
        super.create();

        //reinit all of the scene variables
        this.totalDucks = 1;
        this.score = 0;
        this.lives = 3;
        this.spawnRate = 0.005;

        //get the enemy behavior json file
        this.enemyBehavior = this.cache.json.get('enemyBehavior');

        //finally spawn the first duck to start the game
        this.spawnRandomDuck();
    }

    update() {
        super.update();

        //check to see if anything collides and handle it
        this.doCollisionCheck()

        //clean up any ducks that have ended their path
        this.cleanUpOldDucks()

        //Spawn more ducks if we need to
        if (this.totalDucks > 0 && Math.random() < this.spawnRate) {
            this.spawnRandomDuck();
            this.spawnRate += 0.00005;
        }

        //spawn duck bullets
        for (let i = 0; i < this.enemyArray.length; i++) {

            //randomly decide to spawn projectile
            if (Math.random() < 0.01) {
                this.spawnPlayerTargeted(this.enemyArray[i], "dirt_projectile", this.enemyProjectileArray)
            }

            //check to see if this duck needs to be turned into a low duck
            this.spawnLowDuck(this.enemyArray[i]);

        }

        //and finally check to see if we met the game end condition
        if (this.lives === 0 || this.enemyArray.length === 0 ) {
            if (this.totalDucks === 0){
                if(this.enemyProjectileArray.length === 0 ){
                  this.scene.start("BossBattle", {score: this.score, lives: this.lives});
                }
            }else{
                this.spawnRandomDuck()
            }
        }


    }


    ////Helper Functions

    //Checks to see if any objects overlap each other
    doCollisionCheck() {
        // Check for collision between player projectiles and ducks
        this.playerProjectileArray = this.playerProjectileArray.filter((playerProjectile, i) => {
            let collision = false;
            this.enemyArray = this.enemyArray.filter((enemy, j) => {
                if (this.doesOverlap(playerProjectile, enemy)) {
                    // If it is a health duck, drop a health pack
                    if (enemy.getData("isHealth")) {
                        this.spawnPlayerTargeted(enemy, "health_pack", this.enemyProjectileArray);
                    }

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

        // Check for collision between duck and player
        this.enemyArray = this.enemyArray.filter((enemy) => {
            if (this.doesOverlap(enemy, this.playerSprite)) {
                enemy.destroy();
                this.lives--;
                return false;
            }
            return true;
        });


    }

    //Removes any ducks that are below the screen (over y=600)
    cleanUpOldDucks(){
        //Remove any ducks that have left the screen
        for (let i = 0; i < this.enemyArray.length; i++) {
            if (this.enemyArray[i].y >= 600) {
                this.enemyArray[i].destroy();
                this.enemyArray.splice(i, 1);
            }
        }

        //and the projectiles too
        for (let i = 0; i < this.enemyProjectileArray.length; i++) {
            if (this.enemyProjectileArray[i].y >= 600) {
                this.enemyProjectileArray[i].destroy();
                this.enemyProjectileArray.splice(i, 1);
            }
        }
    }

    //spawns a duck aimed at a player, acts like a bullet
    spawnLowDuck(sprite){
        if (sprite.y >= 400) {
            let tempSpline = this.createExtendedSpline(sprite, this.playerSprite);
            let newProjectile = this.add.follower(tempSpline, sprite.x, sprite.y, "invincible_duck");
            newProjectile.setScale(0.5);
            newProjectile.startFollow(
                {
                    duration: 5000,
                    yoyo: false,
                    repeat: 0
                }
            )
            //remove that sprite from the array
            this.enemyArray.splice(this.enemyArray.indexOf(sprite), 1);
            sprite.destroy();
            //add the new sprite to the array
            this.enemyProjectileArray.push(newProjectile);
            sprite.y = -99;
        }
    }

    spawnPlayerTargeted(sourceSprite, texture, array) {
        let tempSpline = this.createExtendedSpline(sourceSprite, this.playerSprite);
        let newProjectile = this.add.follower(tempSpline, sourceSprite.x, sourceSprite.y, texture);
        if(texture === "health_pack"){
            newProjectile.setScale(2);
            newProjectile.setData("isHealth", true);
        }else{
            newProjectile.setScale(0.5);
        }

        newProjectile.startFollow(
            {
                duration: 10000,
                yoyo: false,
                repeat: 0
            }
        )
        array.push(newProjectile);
    }

    spawnRandomDuck() {
        let behavior = Phaser.Utils.Array.GetRandom(this.enemyBehavior);
        if(behavior.name === "duck_health"){
            //make this happen only a tiny amt of the time
            if(Math.random() < 0.07){
                return;
            }else{
                console.log("duck_health")
            }
        }
        this.totalDucks--;
        let spline = new Phaser.Curves.Spline(behavior.path);

        // Get the first coordinate of the path
        let startX = behavior.path[0];
        let startY = behavior.path[1];

        // Spawn a new duck at the first coordinate of the path
        let newDuck = this.add.follower(spline, startX, startY, behavior.name);
        newDuck.setScale(0.5);
        newDuck.startFollow({
            duration: 10000,
            yoyo: false,
            repeat: 0
        });

        //and if it is a duck_health, give it some data
        if(behavior.name === "duck_health"){
            newDuck.setData("isHealth", true);
        }else{
            newDuck.setData("isHealth", false);
        }

        this.enemyArray.push(newDuck);
        console.log(this.totalDucks);
    }

}