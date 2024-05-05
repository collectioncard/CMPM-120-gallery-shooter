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
        this.load.image('duck_health', "jumper/PNG/Enemies/spikeMan_stand.png");
        this.load.image('dirt_projectile', 'jumper/PNG/Particles/particle_brown.png');

        this.load.json('enemyBehavior', 'enemyBehavior.json');

        //// End Asset Loading ////

    }

    create() {
        super.create();

        this.points = [
            50, 21,
            336, 24,
            702, 24,
            925, 24,
            977, 64,
            972, 111,
            782, 125,
            601, 110,
            420, 105,
            264, 111,
            75, 115,
            21, 170,
            71, 232,
            247, 229,
            438, 224,
            622, 220,
            797, 219,
            972, 210,
            994, 264,
            976, 310,
            795, 315,
            595, 314,
            439, 324,
            239, 325,
            59, 325,
            9, 387,
            73, 441,
            228, 422,
            454, 435,
            615, 412,
            810, 402,
            987, 397,
            995, 455,
            938, 503,
            767, 518,
            605, 529,
            445, 532,
            278, 530,
            97, 535,
            38, 537
        ];
        this.curve = new Phaser.Curves.Spline(this.points);

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

        //check to see if this.enemyShip is at the end of the path
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
            this.totalDucks--;
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
                this.enemyProjectileArray[i].destroy();
                this.enemyProjectileArray.splice(i, 1);
                this.lives--;
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
            this.enemyShip2 = this.add.follower(tempSpline, sprite.x, sprite.y, "duck_dirty");
            this.enemyShip2.setScale(0.5);
            this.enemyShip2.startFollow(
                {
                    duration: 10000,
                    yoyo: false,
                    repeat: 0
                }
            )
            sprite.destroy();
            //remove that sprite from the array
            this.enemyArray.splice(this.enemyArray.indexOf(sprite), 1);
            sprite.y = -99;

        }
    }

    spawnPlayerTargeted(sourceSprite, texture, array) {
        let tempSpline = this.createExtendedSpline(sourceSprite, this.playerSprite);
        this.enemyShip2 = this.add.follower(tempSpline, sourceSprite.x, sourceSprite.y, texture);
        this.enemyShip2.setScale(0.5);
        this.enemyShip2.startFollow(
            {
                duration: 10000,
                yoyo: false,
                repeat: 0
            }
        )
        array.push(this.enemyShip2);
    }

    spawnRandomDuck() {
        let behavior = Phaser.Utils.Array.GetRandom(this.enemyBehavior);
        let spline = new Phaser.Curves.Spline(behavior.path);

        // Get the first coordinate of the path
        let startX = behavior.path[0];
        let startY = behavior.path[1];

        // Spawn a new duck at the first coordinate of the path
        let enemyShip = this.add.follower(spline, startX, startY, behavior.name);
        enemyShip.setScale(0.5);
        enemyShip.startFollow({
            duration: 10000,
            yoyo: false,
            repeat: 0
        });

        this.enemyArray.push(enemyShip);
    }

}