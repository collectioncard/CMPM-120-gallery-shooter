class StartScreen extends BasicShootingScene {
    constructor() {
        super("StartScreen");
    }

    preload() {
        super.preload();
        //// Begin Asset Loading ////

        //Player and bullets
        this.load.image('button_green', 'space/PNG/UI/buttonGreen.png');
        this.load.image('button_yellow', 'space/PNG/UI/buttonYellow.png');
        this.grow = true;
        this.lastSize = 0;
    }

    create() {
        super.create();

        ///TEXT STUFF
        this.TitleText = this.add.text(400, 300, 'DUCK WASHING\nSIMULATOR', { align: 'center' });
        this.TitleText.setOrigin(1, 3)
            .setResolution(window.devicePixelRatio)
            .setFontFamily('Arial')
            .setFontStyle('bold')
            .setFontSize(30)
            .setShadow(8, 8)
            .rotation = -0.1;


        this.GreenButton = this.add.sprite(550, 409, 'button_green').setDepth(-1).setScale(0.75);
        this.add.text(500, 400, 'High Scores', { align: 'center', color: 'black' });

        this.YellowButton = this.add.sprite(250, 409, 'button_yellow').setDepth(-1).setScale(0.75);
        this.add.text(200, 400, 'Start Game', { align: 'center', color: 'black'});

        this.add.text(this.screenCenterX, 500, 'Press A & D to move, space to shoot, \n Shoot an option to select it', { align: 'center', color: 'white' }).setOrigin(.5);

        //we don't want to display the lives or score on the start screen
        this.livesText.visible = false;
        this.scoreText.visible = false;
    }

    update() {
        super.update();
        this.growTitle();

        for (let i = 0; i < this.playerProjectileArray.length; i++){
            if(this.doesOverlap(this.YellowButton, this.playerProjectileArray[i])){
                this.playerProjectileArray[i].destroy();
                this.playerProjectileArray.splice(i, 1);
                this.scene.start("levelOne");
                break;
            }

            if(this.doesOverlap(this.GreenButton, this.playerProjectileArray[i])){
                this.playerProjectileArray[i].destroy();
                this.playerProjectileArray.splice(i, 1);
                this.scene.start("HighScores");
                break;
            }
        }
    }

    growTitle(){
        if (this.grow){
            this.TitleText.setScale(1 + this.lastSize);
            this.lastSize += .0005;
            if (this.lastSize >= .3){
                this.grow = false;
            }
        }else{
            this.TitleText.setScale(1 + this.lastSize);
            this.lastSize -= .001;
            if (this.lastSize <= 0){
                this.grow = true;
            }
        }
    }

}