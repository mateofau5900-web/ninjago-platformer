const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#0d1b2a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, cursors, platforms;
let canJump = false;
let isAttacking = false;

// =====================
//      PRELOAD
// =====================
function preload() {
    // Spritesheet Kai : 452x552px → 4 colonnes x 5 lignes → 113x110 par frame
    this.load.spritesheet('kai', 'assets/kai.png', {
        frameWidth: 113,
        frameHeight: 110
    });

    // Sol Lego
    this.load.spritesheet('sol_lego', 'assets/sol.png', {
        frameWidth: 128,
        frameHeight: 128
    });
}

// =====================
//      CREATE
// =====================
function create() {

    // --- FOND ---
    // Dégradé nuit bleutée
    let bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x1b3a5c, 0x1b3a5c, 1);
    bg.fillRect(0, 0, 800, 600);

    // Étoiles
    for (let i = 0; i < 80; i++) {
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(0, 500);
        let r = Phaser.Math.FloatBetween(0.5, 2);
        this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.4, 1));
    }

    // Lune décorative
    this.add.circle(720, 80, 40, 0xfff8dc, 0.9);
    this.add.circle(735, 70, 38, 0x1b3a5c, 0.9); // effet croissant

    // --- PLATEFORMES ---
    platforms = this.physics.add.staticGroup();

    // SOL : Y=572, tuiles centrées à 50 + i*100 pour couvrir tout l'écran
    for (let i = 0; i < 9; i++) {
        platforms.create(50 + i * 100, 572, 'sol_lego', 0)
            .setScale(0.78)
            .refreshBody();
    }

    // Plateformes aériennes (bien visibles, bien espacées)
    platforms.create(180, 440, 'sol_lego', 1).setScale(0.6).refreshBody();
    platforms.create(430, 340, 'sol_lego', 1).setScale(0.6).refreshBody();
    platforms.create(650, 240, 'sol_lego', 1).setScale(0.6).refreshBody();
    platforms.create(300, 200, 'sol_lego', 1).setScale(0.6).refreshBody();

    // --- JOUEUR ---
    player = this.physics.add.sprite(100, 490, 'kai', 0);
    player.setScale(1.1);
    player.setCollideWorldBounds(true);
    player.setDepth(10);

    // --- ANIMATIONS ---

    // Idle : frame 0 (le ninja seul, ligne 1)
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'kai', frame: 0 }],
        frameRate: 1,
        repeat: -1
    });

    // Course : frames 4→7 (ligne 2)
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('kai', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    // Saut : frames 8→11 (ligne 3)
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('kai', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: 0
    });

    // Spin/Attaque : frames 12→15 (ligne 4)
    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('kai', { start: 12, end: 15 }),
        frameRate: 12,
        repeat: 0
    });

    // Quand l'animation spin est finie, on sort de l'état attaque
    player.on('animationcomplete-spin', () => {
        isAttacking = false;
    });

    // --- COLLISION ---
    this.physics.add.collider(player, platforms);

    // --- CONTRÔLES ---
    cursors = this.input.keyboard.createCursorKeys();

    // Attaque avec Z ou ESPACE
    this.input.keyboard.on('keydown-Z', doSpin, this);
    this.input.keyboard.on('keydown-SPACE', doSpin, this);

    // --- CAMÉRA FIXE ---
    // Pas de follow → la caméra reste fixe, tout l'écran est visible
    this.cameras.main.setBounds(0, 0, 800, 600);

    // --- UI ---
    this.add.text(12, 10, '🥷 Ninjago Platformer', {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'Georgia, serif',
        stroke: '#000000',
        strokeThickness: 3
    }).setScrollFactor(0).setDepth(20);

    this.add.text(12, 34, '← → Courir   ↑ Sauter   Z / Espace : Spin !', {
        fontSize: '11px',
        fill: '#aaccff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(20);
}

// =====================
//   FONCTION SPIN
// =====================
function doSpin() {
    if (!isAttacking) {
        isAttacking = true;
        player.anims.play('spin', true);
    }
}

// =====================
//      UPDATE
// =====================
function update() {
    const onGround = player.body.touching.down || player.body.blocked.down;
    canJump = onGround;

    // Si en train d'attaquer, on bloque les autres animations (pas le mouvement)
    const animLocked = isAttacking;

    // --- GAUCHE / DROITE ---
    if (cursors.left.isDown) {
        player.setVelocityX(-270);
        player.flipX = true;
        if (!animLocked) {
            if (onGround) player.anims.play('run', true);
        }
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(270);
        player.flipX = false;
        if (!animLocked) {
            if (onGround) player.anims.play('run', true);
        }
    }
    else {
        player.setVelocityX(0);
        if (!animLocked && onGround) {
            player.anims.play('idle', true);
        }
    }

    // --- SAUT ---
    if (cursors.up.isDown && canJump) {
        player.setVelocityY(-650);
        if (!animLocked) {
            player.anims.play('jump', true);
        }
    }

    // --- ANIMATION EN L'AIR ---
    if (!onGround && !animLocked) {
        player.anims.play('jump', true);
    }
}
