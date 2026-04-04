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

let player, cursors;
let platforms, enemies, coins;
let score = 0;
let scoreText;
let isAttacking = false;

// =====================
//      PRELOAD
// =====================
function preload() {
    this.load.spritesheet('kai', 'assets/kai.png', {
        frameWidth: 113,
        frameHeight: 110
    });
}

// =====================
//      CREATE
// =====================
function create() {

    const MAP_WIDTH = 2400;
    const MAP_HEIGHT = 600;

    // ---- FOND ----
    let bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x1b3a5c, 0x1b3a5c, 1);
    bg.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    bg.setScrollFactor(0.2);

    // Étoiles
    for (let i = 0; i < 220; i++) {
        let x = Phaser.Math.Between(0, MAP_WIDTH);
        let y = Phaser.Math.Between(0, 500);
        let r = Phaser.Math.FloatBetween(0.5, 1.8);
        this.add.circle(x, y, r, 0xffffff, Phaser.Math.FloatBetween(0.4, 1))
            .setScrollFactor(0.3);
    }

    // Lune
    this.add.circle(700, 75, 45, 0xfff5cc, 0.95).setScrollFactor(0.1);
    this.add.circle(718, 62, 42, 0x1b3a5c, 1).setScrollFactor(0.1);

    // ---- PLATEFORMES ----
    platforms = this.physics.add.staticGroup();

    // SOL COMPLET 2400px
    createPlatform(this, 1200, 558, 2400, 44, 0x6b0000, 0x3d0000);
    this.add.rectangle(1200, 536, 2400, 6, 0xcc2200).setDepth(1);

    // --- ZONE 1 (0 → 800) ---
    createPlatform(this, 150,  460, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 380,  370, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 600,  280, 160, 18, 0xaa1a00, 0x6b0000);

    // --- ZONE 2 (800 → 1600) ---
    createPlatform(this, 850,  460, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 1050, 380, 200, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 1250, 300, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 1420, 220, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 1550, 350, 160, 18, 0xaa1a00, 0x6b0000);

    // --- ZONE 3 (1600 → 2400) ---
    createPlatform(this, 1680, 460, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 1850, 360, 200, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 2050, 270, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 2200, 180, 160, 18, 0xaa1a00, 0x6b0000);
    createPlatform(this, 2350, 300, 160, 18, 0xaa1a00, 0x6b0000);

    // ---- PIÈCES ----
    coins = this.physics.add.staticGroup();

    const coinPositions = [
        // Zone 1
        {x: 150, y: 420}, {x: 380, y: 330}, {x: 600, y: 240},
        {x: 250, y: 510}, {x: 500, y: 510},
        // Zone 2
        {x: 850,  y: 420}, {x: 1050, y: 340}, {x: 1250, y: 260},
        {x: 1420, y: 180}, {x: 1550, y: 310},
        {x: 950,  y: 510}, {x: 1150, y: 510}, {x: 1450, y: 510},
        // Zone 3
        {x: 1680, y: 420}, {x: 1850, y: 320}, {x: 2050, y: 230},
        {x: 2200, y: 140}, {x: 2350, y: 260},
        {x: 1750, y: 510}, {x: 2000, y: 510}, {x: 2300, y: 510},
    ];

    coinPositions.forEach(pos => {
        let coin = this.add.circle(pos.x, pos.y, 8, 0xffd700);
        this.add.circle(pos.x - 2, pos.y - 2, 4, 0xffee88, 0.7);
        this.physics.add.existing(coin, true);
        coins.add(coin);
    });

    // ---- ENNEMIS ----
    enemies = this.physics.add.group();

    const enemyData = [
        { x: 400,  y: 510, minX: 300,  maxX: 550,  speed: 90  },
        { x: 900,  y: 510, minX: 820,  maxX: 1050, speed: 100 },
        { x: 1100, y: 350, minX: 980,  maxX: 1200, speed: 110 },
        { x: 1300, y: 510, minX: 1200, maxX: 1500, speed: 95  },
        { x: 1700, y: 510, minX: 1620, maxX: 1850, speed: 120 },
        { x: 1900, y: 330, minX: 1800, maxX: 2000, speed: 130 },
        { x: 2100, y: 510, minX: 2000, maxX: 2300, speed: 110 },
        { x: 2250, y: 150, minX: 2150, maxX: 2350, speed: 140 },
    ];

    enemyData.forEach(data => {
        // Corps de l'ennemi (rectangle violet)
        let enemy = this.add.rectangle(data.x, data.y, 36, 48, 0x220088);
        this.physics.add.existing(enemy, false);
        enemy.body.setCollideWorldBounds(true);
        enemy.body.setGravityY(0);
        enemy.setDepth(5);
        enemy.minX  = data.minX;
        enemy.maxX  = data.maxX;
        enemy.speed = data.speed;
        enemy.body.setVelocityX(enemy.speed);
        enemies.add(enemy);
    });

    // ---- JOUEUR KAI ----
    player = this.physics.add.sprite(100, 450, 'kai', 0);
    player.setScale(1.1);
    player.setCollideWorldBounds(true);
    player.setDepth(10);

    // ---- ANIMATIONS ----
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'kai', frame: 0 }],
        frameRate: 1,
        repeat: -1
    });
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('kai', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('kai', { start: 8, end: 11 }),
        frameRate: 8,
        repeat: 0
    });
    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('kai', { start: 12, end: 15 }),
        frameRate: 12,
        repeat: 0
    });
    player.on('animationcomplete-spin', () => { isAttacking = false; });

    // ---- COLLISIONS ----
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.overlap(player, coins,   collectCoin, null, this);
    this.physics.add.overlap(player, enemies, hitEnemy,    null, this);

    // ---- CAMÉRA ----
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 50);

    // ---- CONTRÔLES ----
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-Z',     doSpin, this);
    this.input.keyboard.on('keydown-SPACE', doSpin, this);

    // ---- UI ----
    this.add.text(14, 10, 'NINJAGO PLATFORMER', {
        fontSize: '17px', fill: '#ff4400',
        fontFamily: 'Georgia, serif', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3
    }).setScrollFactor(0).setDepth(20);

    this.add.text(14, 36, '← → Courir   ↑ Sauter   Z Spin !   Saute sur les ennemis !', {
        fontSize: '11px', fill: '#aaccff',
        fontFamily: 'Arial', stroke: '#000000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(20);

    scoreText = this.add.text(14, 58, '⭐ Score : 0', {
        fontSize: '15px', fill: '#ffd700', fontStyle: 'bold',
        fontFamily: 'Arial', stroke: '#000000', strokeThickness: 3
    }).setScrollFactor(0).setDepth(20);

    this.add.text(14, 82, '🪙 +10 par pièce   👾 +50 par ennemi écrasé', {
        fontSize: '10px', fill: '#88ccaa', fontFamily: 'Arial',
        stroke: '#000000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(20);
}

// =====================
//  HELPER : PLATEFORME
// =====================
function createPlatform(scene, x, y, w, h, colorTop, colorBottom) {
    let rect = scene.add.rectangle(x, y, w, h, colorTop);
    scene.physics.add.existing(rect, true);
    platforms.add(rect);
    scene.add.rectangle(x, y + h / 2 + 3, w, 6, colorBottom).setDepth(0);

    let studsG = scene.add.graphics();
    studsG.fillStyle(colorTop, 1);
    let studCount = Math.floor(w / 20);
    let startX = x - w / 2 + 8;
    for (let i = 0; i < studCount; i++) {
        studsG.fillRoundedRect(startX + i * 20 - 4, y - h / 2 - 5, 8, 5, 2);
    }
    studsG.setDepth(2);
    return rect;
}

// =====================
//   COLLECTER PIÈCE
// =====================
function collectCoin(player, coin) {
    coin.destroy();
    score += 10;
    scoreText.setText('⭐ Score : ' + score);
    scoreText.setStyle({ fill: '#ffffff' });
    this.time.delayedCall(150, () => scoreText.setStyle({ fill: '#ffd700' }));
}

// =====================
//   TOUCHER ENNEMI
// =====================
function hitEnemy(player, enemy) {
    // Sauter dessus = tuer l'ennemi
    if (player.body.velocity.y > 0 && player.body.y < enemy.y - 10) {
        enemy.destroy();
        player.setVelocityY(-450);
        score += 50;
        scoreText.setText('⭐ Score : ' + score);
    } else {
        // Recul si touché
        player.setVelocityX(player.flipX ? 350 : -350);
        player.setVelocityY(-300);
        score = Math.max(0, score - 5);
        scoreText.setText('⭐ Score : ' + score);
    }
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

    // Patrouille ennemis
    enemies.children.entries.forEach(enemy => {
        if (!enemy.active || !enemy.body) return;
        if (enemy.x >= enemy.maxX) {
            enemy.body.setVelocityX(-enemy.speed);
        } else if (enemy.x <= enemy.minX) {
            enemy.body.setVelocityX(enemy.speed);
        }
    });

    // Mouvement joueur
    if (cursors.left.isDown) {
        player.setVelocityX(-270);
        player.flipX = true;
        if (!isAttacking && onGround) player.anims.play('run', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(270);
        player.flipX = false;
        if (!isAttacking && onGround) player.anims.play('run', true);
    } else {
        player.setVelocityX(0);
        if (!isAttacking && onGround) player.anims.play('idle', true);
    }

    // Saut
    if (cursors.up.isDown && onGround) {
        player.setVelocityY(-650);
        if (!isAttacking) player.anims.play('jump', true);
    }

    // Anim en l'air
    if (!onGround && !isAttacking) {
        player.anims.play('jump', true);
    }
}
