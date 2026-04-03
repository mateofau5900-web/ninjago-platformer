const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false // Change en 'true' pour voir les boîtes de collision
        }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, platforms;

function preload() {
    // 1. Charger Kai (le perso)
    this.load.spritesheet('kai', 'assets/kai.png', { frameWidth: 256, frameHeight: 256 });
    
    // 2. Charger le sol (comme spritesheet pour découper)
    this.load.spritesheet('sol_lego', 'assets/sol.png', { 
        frameWidth: 256, 
        frameHeight: 256 
    });
}

function create() {
    // CORRECTION DU PROBLÈME FANTÔME : Ajouter une couleur de fond (ici, noir)
    this.cameras.main.setBackgroundColor('#000000'); 

    // --- LES PLATEFORMES ---
    platforms = this.physics.add.staticGroup();

    // Créer un sol large tout le long (10 blocs)
    // On agrandit les blocs de 0.5 (Scale) pour qu'ils soient plus visibles
    for (let i = 0; i < 10; i++) {
        platforms.create(i * 128, 560, 'sol_lego', 0).setScale(0.5).refreshBody(); 
    }
    
    // Quelques plateformes en l'air (on utilise la brique n°1 pour varier)
    // CORRECTION : On utilise .setFrame(1) sur le StaticImage
    let p1 = platforms.create(600, 350, 'sol_lego', 1);
    p1.setScale(0.4).refreshBody();
    
    let p2 = platforms.create(200, 250, 'sol_lego', 1);
    p2.setScale(0.4).refreshBody();

    // --- LE JOUEUR (KAI) ---
    // CORRECTION : On réduit Kai de 0.5 (Scale) pour qu'il ne soit pas géant
    player = this.physics.add.sprite(100, 300, 'kai').setScale(0.5);
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    // --- ANIMATIONS DE KAI ---
    // Animation de course
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('kai', { start: 1, end: 4 }),
        frameRate: 10,
        repeat: -1
    });

    // Animation d'attente (Idle)
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'kai', frame: 0 }],
        frameRate: 10
    });

    // --- LOGIQUE (Collisions) ---
    this.physics.add.collider(player, platforms);

    // --- CONTRÔLES (Clavier) ---
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    // Contrôles Gauche / Droite
    if (cursors.left.isDown) {
        player.setVelocityX(-250);
        player.flipX = true; // Oriente le perso à gauche
        player.anims.play('run', true);
    } 
    else if (cursors.right.isDown) {
        player.setVelocityX(250);
        player.flipX = false; // Oriente le perso à droite
        player.anims.play('run', true);
    } 
    else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    // Saut (Flèche du haut) - uniquement s'il touche le sol
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-600); // Impulsion vers le haut
    }
}
