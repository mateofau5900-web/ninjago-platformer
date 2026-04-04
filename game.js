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
let isAttacking = false;

// =====================
//      PRELOAD
// =====================
function preload() {
    // Spritesheet Kai : 452x552px, 4 colonnes x 5 lignes = 113x110 par frame
    this.load.spritesheet('kai', 'assets/kai.png', {
        frameWidth: 113,
        frameHeight: 110
    });
}

// =====================
//      CREATE
// =====================
function create() {

    // ---- FOND ----
    let bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x1b3a5c, 0x1b3a5c, 1);
    bg.fillRect(0, 0, 800, 600);

    // Étoiles aléatoires
    for (let i = 0; i < 100; i++) {
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(0, 550);
        let r = Phaser.Math.FloatBetween(0.5, 1.8);
        let alpha = Phaser.Math.FloatBetween(0.3, 1);
        this.add.circle(x, y, r, 0xffffff, alpha);
    }

    // Lune croissant
    this.add.circle(700, 75, 45, 0xfff5cc, 0.95);
    this.add.circle(718, 62, 42, 0x1b3a5c, 1);

    // Nuages décoratifs (ellipses semi-transparentes)
    let cloudGraphics = this.add.graphics();
    cloudGraphics.fillStyle(0xffffff, 0.06);
    cloudGraphics.fillEllipse(150, 120, 200, 50);
    cloudGraphics.fillEllipse(500, 80, 250, 55);
    cloudGraphics.fillEllipse(350, 200, 180, 40);

    // ---- PLATEFORMES (rectangles propres, sans tileset) ----
    platforms = this.physics.add.staticGroup();

    // SOL PRINCIPAL — barre rouge foncée tout en bas
    createPlatform(this, 400, 578, 800, 44, 0x6b0000, 0x3d0000);

    // Ligne de détail du sol (bordure haute)
    let solDetail = this.add.rectangle(400, 556, 800, 6, 0xcc2200);
    solDetail.setDepth(1);

    // Plateformes aériennes — disposition en escalier pour pouvoir grimper
    createPlatform(this, 150, 460, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 390, 370, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 620, 285, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 280, 210, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 560, 150, 130, 18, 0xaa1a00, 0x6b0000);

    // ---- JOUEUR KAI ----
    player = this.physics.add.sprite(100, 490, 'kai', 0);
    player.setScale(1.1);
    player.setCollideWorldBounds(true);
    player.setDepth(10);

    // ---- ANIMATIONS ----

    // Idle : frame 0
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'kai', frame: 0 }],
        frameRate: 1,
        repeat: -1
    });

    // Course : frames 4 → 7
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('kai', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    // Saut : frames 8 → 11
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('kai', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: 0
    });

    // Spin/Attaque : frames 12 → 15
    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('kai', { start: 12, end: 15 }),
        frameRate: 12,
        repeat: 0
    });

    // Déverrouille l'attaque quand spin est terminé
    player.on('animationcomplete-spin', () => {
        isAttacking = false;
    });

    // ---- COLLISIONS ----
    this.physics.add.collider(player, platforms);

    // ---- CONTRÔLES ----
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-Z', doSpin, this);
    this.input.keyboard.on('keydown-SPACE', doSpin, this);

    // ---- UI ----
    // Titre
    this.add.text(14, 10, 'NINJAGO PLATFORMER', {
        fontSize: '17px',
        fill: '#ff4400',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
    }).setScrollFactor(0).setDepth(20);

    // Contrôles
    this.add.text(14, 36, '← → : Courir    ↑ : Sauter    Z / Espace : Spin !', {
        fontSize: '11px',
        fill: '#aaccff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 2
    }).setScrollFactor(0).setDepth(20);
}

// =====================
//  HELPER : PLATEFORME
// =====================
function createPlatform(scene, x, y, w, h, colorTop, colorBottom) {
    // Corps physique
    let rect = scene.add.rectangle(x, y, w, h, colorTop);
    scene.physics.add.existing(rect, true);
    platforms.add(rect);

    // Petite bordure en bas pour l'effet de profondeur
    let shadow = scene.add.rectangle(x, y + h / 2 + 3, w, 6, colorBottom);
    shadow.setDepth(0);

    // Picots Lego style (petits rectangles en haut)
    let studsGraphics = scene.add.graphics();
    studsGraphics.fillStyle(colorTop, 1);
    let studCount = Math.floor(w / 20);
    let startX = x - w / 2 + 8;
    for (let i = 0; i < studCount; i++) {
        studsGraphics.fillRoundedRect(startX + i * 20 - 4, y - h / 2 - 5, 8, 5, 2);
    }
    studsGraphics.setDepth(2);

    return rect;
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
    const onGround = player.body.blocked.down;

    // --- GAUCHE / DROITE ---
    if (cursors.left.isDown) {
        player.setVelocityX(-270);
        player.flipX = true;
        if (!isAttacking && onGround) {
            player.anims.play('run', true);
        }
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(270);
        player.flipX = false;
        if (!isAttacking && onGround) {
            player.anims.play('run', true);
        }
    }
    else {
        player.setVelocityX(0);
        if (!isAttacking && onGround) {
            player.anims.play('idle', true);
        }
    }

    // --- SAUT ---
    if (cursors.up.isDown && onGround) {
        player.setVelocityY(-650);
        if (!isAttacking) {
            player.anims.play('jump', true);
        }
    }

    // --- ANIMATION EN L'AIR ---
    if (!onGround && !isAttacking) {
        player.anims.play('jump', true);
    }
}
