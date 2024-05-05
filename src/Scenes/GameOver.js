//A phaser scene that takes in the score from the previous scene and displays it on the screen. It also allows the player to enter their name and save their score to the high scores list stored in /assets/highscore.json
class GameOver extends Phaser.Scene {

    init (data)
    {
        console.log('init', data);
        this.score = data.score;
    }

    constructor() {
        super("GameOver");
        this.score = 0;
    }
    preload() {
        this.load.setPath('./assets/');

    }
    create() {
        this.add.text(200, 100, 'Game Over', { fontSize: '64px' });
        this.add.text(200, 200, 'Your score was: ' + this.score, { fontSize: '32px' });
        this.add.text(50, 500, 'Press the ENTER to return to the main menu', { fontSize: '24px' });

        //write the high score to the hiscore.json file
        // Check if 'highscores' already exists in localStorage
        let highscores = JSON.parse(localStorage.getItem('highscores')) || [];

        // Add the new score to the highscores array
        highscores.push(this.score);

        // Sort the array in descending order
        highscores.sort((a, b) => b - a);

        // If there are more than 5 high scores, remove the lowest one
        if (highscores.length > 5) highscores.pop();

        // Save the high scores back to localStorage
        localStorage.setItem('highscores', JSON.stringify(highscores));

        console.log(highscores);


        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.start('StartScreen');
        });

        this.score = 0;
    }
}