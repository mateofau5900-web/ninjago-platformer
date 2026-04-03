const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false // Change en 'true' pour voir les boîtes de collision
        }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, platforms;

function preload() {
    // Chargement de Kai (on divise l'image en cadres de 64x64)
    this.load.spritesheet('kai', 'assets/kai.png', { frameWidth: 64, frameHeight: 64 });
    
    // Chargement du sol (on prend une tuile de ton image)
    this.load.image('bloc_lego', 'assets/sol.png'); 
}

function create() {
    // 1. Création du sol et des plateformes
    platforms = this.physics.add.staticGroup();

    // On place quelques blocs pour tester (x, y, nom)
    platforms.create(400, 568, 'bloc_lego').setScale(2).refreshBody(); // Le sol
    platforms.create(600, 400, 'bloc_lego');
    platforms.create(200, 250, 'bloc_lego');

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

    // 4. Collisions
    this.physics.add.collider(player, platforms);

    // 5. Contrôles
    cursors = this.input.keyboard.createCursorKeys();
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        player.flipX = true; // Oriente le perso à gauche
        player.anims.play('run', true);
    } 
    else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.flipX = false; // Oriente le perso à droite
        player.anims.play('run', true);
    } 
    else {
        player.setVelocityX(0);
        player.anims.play('idle');
    }

    // Saut (uniquement si Kai touche le sol ou une plateforme)
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
    }
}
