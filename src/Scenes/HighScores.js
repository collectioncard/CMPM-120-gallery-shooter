class HighScores extends BasicShootingScene {
    constructor() {
        super("HighScores");
    }
    preload() {
        super.preload();
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.load.image('button_green', 'space/PNG/UI/buttonGreen.png');
        this.load.image('button_yellow', 'space/PNG/UI/buttonYellow.png');

        let highscores = JSON.parse(localStorage.getItem('highscores')) || [];

        for (let i = 0; i < 5; i++) {
            if (highscores[i] === undefined) {
                this.add.text(screenCenterX, screenCenterY + i * 30, `Score ${i+1}: ...`, { fontSize: '20px'}).setOrigin(0.5);
            } else {
                this.add.text(screenCenterX, screenCenterY + i * 30, `Score ${i + 1}: ${highscores[i]}`, { fontSize: '20px'}).setOrigin(0.5);
            }
        }


    }
    create() {
        super.create();

        this.GreenButton = this.add.sprite(125, 59, 'button_green').setDepth(-1).setScale(0.75);
        this.HighScoreButtonText = this.add.text(65, 50, 'Clear Scores', { align: 'center', color: 'black' });

        this.YellowButton = this.add.sprite(675, 59, 'button_yellow').setDepth(-1).setScale(0.75);
        this.StartButtonText = this.add.text(645, 50, 'Go Back', { align: 'center', color: 'black'});



        //we dont want to display the lives or score on the start screen
        this.livesText.visible = false;
        this.scoreText.visible = false;
    }

    update() {
        super.update();

        for (let i = 0; i < this.playerProjectileArray.length; i++){
            if(this.doesOverlap(this.YellowButton, this.playerProjectileArray[i])){
                this.playerProjectileArray[i].destroy();
                this.playerProjectileArray.splice(i, 1);
                this.scene.start("StartScreen");
                break;
            }

            if(this.doesOverlap(this.GreenButton, this.playerProjectileArray[i])){
                this.playerProjectileArray[i].destroy();
                this.playerProjectileArray.splice(i, 1);
                //clear the high scores
                localStorage.setItem('highscores', JSON.stringify([]));
                this.scene.start("HighScores");
                break;
            }
        }
    }
}