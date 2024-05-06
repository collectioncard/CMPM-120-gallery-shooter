class levelOne extends BasicShootingScene {
    constructor() {
        super("levelOne");
    }

    preload() {
        super.preload();

        //// Begin Asset Loading ////

        //Enemies
        this.load.image('duck_clean', "ducks/PNG/Objects/duck_yellow.png");
        this.load.image('duck_dirty', "custom/duck_dirty.png");
        this.load.image('dirt_projectile', 'jumper/PNG/Particles/particle_brown.png');
        this.load.image('duck_health', "custom/duck_health.png");
        this.load.image('health_pack', "shmup/Tiles/tile_0024.png");

        this.load.json('enemyBehavior', 'enemyBehavior.json');

        //// End Asset Loading ////

    }

    create() {
        super.create();

        this.totalDucks = 100;
        this.enemyBehavior = this.cache.json.get('enemyBehavior');

        this.spawnRandomDuck();

        //reset the score to 0
        this.score = 0;

        //reset the lives to 3
        this.lives = 3;

        //reset difficulty
        this.spawnRate = 0.005;


    }

    update() {
        super.update();
        this.doCollisionCheck();


        for (let i = 0; i < this.enemyArray.length; i++) {

            //randomly decide to spawn projectile
            if (Math.random() < 0.01) {
                this.spawnPlayerTargeted(this.enemyArray[i], "dirt_projectile", this.enemyProjectileArray)
            }

            this.spawnLowDuck(this.enemyArray[i]);

        }

        //spawn more ducks randomly
        if (this.totalDucks > 0 && Math.random() < this.spawnRate) {
            this.spawnRandomDuck();
            this.spawnRate += 0.00005;
        }


        //clean everything up
        for (let i = 0; i < this.enemyArray.length; i++) {
            if (this.enemyArray[i].y >= 600) {
                this.enemyArray[i].destroy();
                this.enemyArray.splice(i, 1);
            }
        }
        //and the projectiles
        for (let i = 0; i < this.enemyProjectileArray.length; i++) {
            if (this.enemyProjectileArray[i].y >= 600) {
                this.enemyProjectileArray[i].destroy();
                this.enemyProjectileArray.splice(i, 1);
            }
        }

        //check to see if we should end the game or spawn more ducks if the screen is empty.
        if (this.lives === 0 || this.enemyArray.length === 0 ) {
            if (this.totalDucks === 0){
                if(this.enemyProjectileArray.length === 0 ){
                  this.scene.start("GameOver", {score: this.score});
                }
            }else{
                this.spawnRandomDuck()
            }
        }

    }


    doCollisionCheck() {
        //check for collision between player projectiles and enemy ships
        for (let i = 0; i < this.playerProjectileArray.length; i++) {
            for (let j = 0; j < this.enemyArray.length; j++) {
                if (this.doesOverlap(this.playerProjectileArray[i], this.enemyArray[j])) {
                    //if it is a health duck, drop a health pack
                    if(this.enemyArray[j].getData("isHealth")){
                        this.spawnPlayerTargeted(this.enemyArray[j], "health_pack", this.enemyProjectileArray);
                    }


                    this.playerProjectileArray[i].destroy();
                    this.enemyArray[j].destroy();
                    this.playerProjectileArray.splice(i, 1);
                    this.enemyArray.splice(j, 1);
                    this.score += 100;
                    break;
                }
            }
        }


        //check for collision between enemy projectiles and player ship
        for (let i = 0; i < this.enemyProjectileArray.length; i++) {
            if (this.doesOverlap(this.enemyProjectileArray[i], this.playerSprite)) {
                if(this.enemyProjectileArray[i].getData("isHealth")){
                    this.lives++;
                }else{
                   this.lives--;
                }
                this.enemyProjectileArray[i].destroy();
                this.enemyProjectileArray.splice(i, 1);
                break;
            }
        }
        //check for collision between enemy ships and player ship
        for (let i = 0; i < this.enemyArray.length; i++) {
            if (this.doesOverlap(this.enemyArray[i], this.playerSprite)) {
                this.enemyArray[i].destroy();
                this.enemyArray.splice(i, 1);
                this.lives--;
                break;
            }
        }

    }

    spawnLowDuck(sprite) {
        if (sprite.y >= 400) {
            let tempSpline = this.createExtendedSpline(sprite, this.playerSprite);
            let newProjectile = this.add.follower(tempSpline, sprite.x, sprite.y, "duck_dirty");
            newProjectile.setScale(0.5);
            newProjectile.startFollow(
                {
                    duration: 5000,
                    yoyo: false,
                    repeat: 0
                }
            )
            sprite.destroy();
            //remove that sprite from the array
            this.enemyArray.splice(this.enemyArray.indexOf(sprite), 1);
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