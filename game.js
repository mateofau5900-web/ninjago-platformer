const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a1a', // Un fond gris foncé pour mieux voir
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 }, // Gravité un peu plus forte pour un jeu nerveux
            debug: false 
        }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, platforms;

function preload() {
    // 1. Chargement de Kai
    // On augmente frameWidth/Height car ton image est grande
    this.load.spritesheet('kai', 'assets/kai.png', { 
        frameWidth: 256, 
        frameHeight: 256 
    });
    
    // 2. Chargement du Sol
    // On divise ton image de sol géante en gros morceaux
    this.load.spritesheet('sol_lego', 'assets/sol.png', { 
        frameWidth: 256, 
        frameHeight: 256 
    });
}

function create() {
    // --- LES PLATEFORMES ---
    platforms = this.physics.add.staticGroup();

    // On crée un sol large (10 blocs)
    // .setScale(0.5) permet de réduire la brique géante pour qu'elle rentre dans l'écran
    for (let i = 0; i < 10; i++) {
        platforms.create(i * 120, 560, 'sol_lego', 0).setScale(0.5).refreshBody(); 
    }
    
    // Une plateforme en hauteur
    platforms.create(600, 350, 'sol_lego', 1).setScale(0.4).refreshBody();
    platforms.create(200, 250, 'sol_lego', 1).setScale(0.4).refreshBody();

    // --- LE JOUEUR (KAI) ---
    player = this.physics.add.sprite(100, 300, 'kai');
    player.setScale(0.5); // On réduit Kai aussi pour qu'il soit proportionnel aux briques
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    // --- ANIMATIONS ---
    // Animation de course (on utilise les frames du spritesheet)
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('kai', { start: 1, end: 4 }),
        frameRate: 10,
        repeat: -1
    });

    // Animation d'attente
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
    // Contrôles Gauche / Droite
    if (cursors.left.isDown) {
        player.setVelocityX(-250);
        player.flipX = true; // Regarde à gauche
        player.anims.play('run', true);
    } 
    else if (cursors.right.isDown) {
        player.setVelocityX(250);
        player.flipX = false; // Regarde à droite
        player.anims.play('run', true);
    } 
    else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    // Saut (Flèche du haut)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-600);
    }
}
