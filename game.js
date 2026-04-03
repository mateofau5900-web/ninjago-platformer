const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false 
        }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, platforms;

function preload() {
    // Perso Kai
    this.load.spritesheet('kai', 'assets/kai.png', { frameWidth: 64, frameHeight: 64 });
    
    // Le sol découpé en briques de 64x64
    this.load.spritesheet('sol_lego', 'assets/sol.png', { 
        frameWidth: 64, 
        frameHeight: 64 
    });
}

function create() {
    // 1. Les plateformes
    platforms = this.physics.add.staticGroup();

    // On crée un sol tout le long du bas de l'écran (ex: 10 briques)
    for (let i = 0; i < 13; i++) {
        platforms.create(i * 64, 568, 'sol_lego', 0); 
    }
    
    // Quelques plateformes en l'air (on utilise la brique n°1 pour varier)
    platforms.create(600, 400, 'sol_lego', 1); 
    platforms.create(200, 300, 'sol_lego', 1);

    // 2. Création de Kai
    player = this.physics.add.sprite(100, 450, 'kai');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    // 3. Animations de Kai
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('kai', { start: 1, end: 4 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: [{ key: 'kai', frame: 0 }],
        frameRate: 10
    });

    // 4. Collisions (IMPORTANT : Kai ne traverse pas le sol)
    this.physics.add.collider(player, platforms);

    // 5. Contrôles
    cursors = this.input.keyboard.createCursorKeys();
} // <--- L'accolade est bien ICI maintenant, à la fin du create

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        player.flipX = true;
        player.anims.play('run', true);
    } 
    else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.flipX = false;
        player.anims.play('run', true);
    } 
    else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
    }
}
