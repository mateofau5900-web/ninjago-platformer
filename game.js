const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000', // On force le fond noir ici aussi
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false 
        }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, platforms;

function preload() {
    // On charge Kai en précisant bien la taille d'UN SEUL ninja (on va tester 128x128)
    this.load.spritesheet('kai', 'assets/kai.png', { 
        frameWidth: 128, 
        frameHeight: 128 
    });
    
    // On charge le sol
    this.load.spritesheet('sol_lego', 'assets/sol.png', { 
        frameWidth: 128, 
        frameHeight: 128 
    });
}

function create() {
    // --- PLATEFORMES ---
    platforms = this.physics.add.staticGroup();

    // Sol (on utilise le cadre 0 du tileset)
    for (let i = 0; i < 10; i++) {
        platforms.create(i * 100, 560, 'sol_lego', 0).setScale(0.8).refreshBody(); 
    }
    
    // Plateformes aériennes (cadre 1)
    platforms.create(600, 350, 'sol_lego', 1).setScale(0.6).refreshBody();
    platforms.create(200, 250, 'sol_lego', 1).setScale(0.6).refreshBody();

    // --- LE JOUEUR (KAI) ---
    player = this.physics.add.sprite(100, 300, 'kai');
    player.setScale(0.8); // On l'ajuste pour qu'il soit à la bonne taille
    player.setCollideWorldBounds(true);

    // --- ANIMATIONS ---
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

    // --- LOGIQUE ---
    this.physics.add.collider(player, platforms);
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Nettoyage manuel au cas où le navigateur bug
    // (Cette ligne empêche l'effet de traînée/fantôme)
    
    if (cursors.left.isDown) {
        player.setVelocityX(-250);
        player.flipX = true;
        player.anims.play('run', true);
    } 
    else if (cursors.right.isDown) {
        player.setVelocityX(250);
        player.flipX = false;
        player.anims.play('run', true);
    } 
    else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-600);
    }
}
