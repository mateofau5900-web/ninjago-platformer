const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
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
let isJumping = false;

function preload() {
    // Spritesheet de Kai : 452x552px, 4 colonnes x 5 lignes
    // Chaque frame = ~113x110px (on arrondit à 113x110)
    this.load.spritesheet('kai', 'assets/kai.png', {
        frameWidth: 113,
        frameHeight: 110
    });

    this.load.spritesheet('sol_lego', 'assets/sol.png', {
        frameWidth: 128,
        frameHeight: 128
    });
}

function create() {

    // --- FOND DÉGRADÉ ---
    // Ciel dégradé du haut vers le bas
    let sky = this.add.graphics();
    sky.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
    sky.fillRect(0, 0, 800, 600);

    // Étoiles décoratives
    for (let i = 0; i < 60; i++) {
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(0, 400);
        let star = this.add.circle(x, y, Phaser.Math.Between(1, 2), 0xffffff, 0.8);
    }

    // --- PLATEFORMES ---
    platforms = this.physics.add.staticGroup();

    // Sol complet
    for (let i = 0; i < 9; i++) {
        platforms.create(i * 100 + 50, 575, 'sol_lego', 0)
            .setScale(0.78)
            .refreshBody();
    }

    // Plateformes aériennes
    platforms.create(200, 420, 'sol_lego', 1).setScale(0.6).refreshBody();
    platforms.create(450, 320, 'sol_lego', 1).setScale(0.6).refreshBody();
    platforms.create(650, 220, 'sol_lego', 1).setScale(0.6).refreshBody();

    // --- LE JOUEUR (KAI) ---
    player = this.physics.add.sprite(100, 450, 'kai', 0);
    player.setScale(1.2);
    player.setCollideWorldBounds(true);

    // --- ANIMATIONS ---

    // Idle (ligne 1, frame 0 uniquement — le ninja seul en haut)
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'kai', frame: 0 }],
        frameRate: 1,
        repeat: -1
    });

    // Course (ligne 2 : frames 4 à 7)
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('kai', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    // Saut (ligne 3 : frames 8 à 11)
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('kai', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: 0
    });

    // Attaque spin (ligne 4 : frames 12 à 15)
    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('kai', { start: 12, end: 15 }),
        frameRate: 12,
        repeat: 0
    });

    // --- COLLISIONS ---
    this.physics.add.collider(player, platforms);

    // --- CONTRÔLES ---
    cursors = this.input.keyboard.createCursorKeys();

    // Touche Z ou ESPACE pour attaquer
    this.input.keyboard.on('keydown-Z', () => {
        if (player.body.touching.down) {
            player.anims.play('spin', true);
        }
    });

    // --- CAMÉRA ---
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.startFollow(player, true, 0.1, 0.1);

    // --- TEXTE UI ---
    this.add.text(16, 16, '🥷 Ninjago Platformer', {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Arial'
    }).setScrollFactor(0); // Reste fixe à l'écran

    this.add.text(16, 42, '← → : Courir | ↑ : Sauter | Z : Spin !', {
        fontSize: '12px',
        fill: '#aaaaaa',
        fontFamily: 'Arial'
    }).setScrollFactor(0);
}

function update() {
    const onGround = player.body.touching.down;

    // --- MOUVEMENT GAUCHE / DROITE ---
    if (cursors.left.isDown) {
        player.setVelocityX(-280);
        player.flipX = true;
        if (onGround && player.anims.currentAnim?.key !== 'spin') {
            player.anims.play('run', true);
        }
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(280);
        player.flipX = false;
        if (onGround && player.anims.currentAnim?.key !== 'spin') {
            player.anims.play('run', true);
        }
    }
    else {
        player.setVelocityX(0);
        if (onGround && player.anims.currentAnim?.key !== 'spin') {
            player.anims.play('idle', true);
        }
    }

    // --- SAUT ---
    if (cursors.up.isDown && onGround) {
        player.setVelocityY(-680);
        player.anims.play('jump', true);
    }

    // --- ANIMATION EN L'AIR ---
    if (!onGround && player.anims.currentAnim?.key !== 'spin') {
        player.anims.play('jump', true);
    }
}
