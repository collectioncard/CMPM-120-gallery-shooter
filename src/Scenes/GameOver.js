//A phaser scene that takes in the score from the previous scene and displays it on the screen. It also allows the player to enter their name and save their score to the high scores list stored in /assets/highscore.json
class GameOver extends Phaser.Scene {

    constructor() {
        super("GameOver");
        this.score = 0;
        this.lives = 0;
    }

    init (data){
        this.score = data.score;
        this.lives = data.lives - 1;

        if(this.lives < 0){
            this.lives = 0;
        }
    }

    preload() {
        this.load.setPath('./assets/');

        this.screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        this.screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    }

    create() {
        let finaltext = "Game Over, You Lose!";
        let calcScore = this.score + (1000 * this.lives);

        if(this.lives > 0){
            finaltext = "Game Over, You Win!!";
        }

        this.add.text(this.screenCenterX, 100, finaltext, { fontSize: '64px' }).setOrigin(0.5);
        this.add.text(this.screenCenterX, 200, 'Your score was: ' + calcScore, { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(this.screenCenterX, 300, 'Original Score: [' + this.score + "] \n\nHealth bonus: [" + this.lives + "]", { fontSize: '24px' }).setOrigin(0.5);
        this.add.text(this.screenCenterX, 500, 'Press the ENTER key to return to the main menu', { fontSize: '24px' }).setOrigin(0.5);

        //write the high score to the highscores.json file

        // Check if 'highscores' already exists in localStorage
        let highscores = JSON.parse(localStorage.getItem('highscores')) || [];

        // Add the new score to the highscores array
        highscores.push(calcScore);

        // Sort the array in descending order
        highscores.sort((a, b) => b - a);

        // If there are more than 5 high scores, remove the lowest one
        if (highscores.length > 5) highscores.pop();

        // Save the high scores back to localStorage
        localStorage.setItem('highscores', JSON.stringify(highscores));

        // Listen for the ENTER key to return to the main menu
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('StartScreen');
        });

        this.score = 0;
    }
}