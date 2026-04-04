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
    // Kai : 452x552px, 4 col x 5 lignes = 113x110 par frame
    this.load.spritesheet('kai', 'assets/kai.png', {
        frameWidth: 113,
        frameHeight: 110
    });

    // Garmadon : 452x560px, 4 col x 5 lignes = 113x112 par frame
    this.load.spritesheet('garmadon', 'assets/garmadon.png', {
        frameWidth: 113,
        frameHeight: 112
    });
}

// =====================
//      CREATE
// =====================
function create() {

    const MAP_WIDTH  = 2400;
    const MAP_HEIGHT = 600;

    // ---- FOND ----
    let bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1b2a, 0x0d1b2a, 0x1b3a5c, 0x1b3a5c, 1);
    bg.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Étoiles (60, en 1 seul graphics)
    for (let i = 0; i < 60; i++) {
        let x = Phaser.Math.Between(0, MAP_WIDTH);
        let y = Phaser.Math.Between(0, 480);
        let s = Phaser.Math.Between(1, 2);
        bg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
        bg.fillRect(x, y, s, s);
    }
    bg.setScrollFactor(0.25);

    // Lune
    this.add.circle(680, 70, 42, 0xfff5cc, 0.95).setScrollFactor(0.1);
    this.add.circle(697, 58, 39, 0x1b3a5c, 1).setScrollFactor(0.1);

    // ---- PLATEFORMES ----
    platforms = this.physics.add.staticGroup();

    // SOL 2400px
    makePlatform(this, 1200, 558, 2400, 44, 0x881100);

    // ZONE 1 (0 → 800)
    makePlatform(this, 150,  455, 160, 18, 0xaa2200);
    makePlatform(this, 380,  365, 160, 18, 0xaa2200);
    makePlatform(this, 600,  275, 160, 18, 0xaa2200);

    // ZONE 2 (800 → 1600)
    makePlatform(this, 870,  455, 160, 18, 0xaa2200);
    makePlatform(this, 1060, 370, 180, 18, 0xaa2200);
    makePlatform(this, 1260, 285, 160, 18, 0xaa2200);
    makePlatform(this, 1430, 205, 160, 18, 0xaa2200);
    makePlatform(this, 1570, 340, 150, 18, 0xaa2200);

    // ZONE 3 (1600 → 2400)
    makePlatform(this, 1700, 455, 160, 18, 0xaa2200);
    makePlatform(this, 1880, 355, 180, 18, 0xaa2200);
    makePlatform(this, 2070, 265, 160, 18, 0xaa2200);
    makePlatform(this, 2220, 175, 150, 18, 0xaa2200);
    makePlatform(this, 2360, 295, 150, 18, 0xaa2200);

    // ---- PIÈCES ----
    coins = this.physics.add.staticGroup();

    let coinGfx = this.add.graphics().setDepth(6);

    const coinPositions = [
        {x:150,y:420},{x:380,y:330},{x:600,y:240},
        {x:260,y:510},{x:490,y:510},
        {x:870,y:415},{x:1060,y:330},{x:1260,y:245},
        {x:1430,y:165},{x:1570,y:300},
        {x:970,y:510},{x:1160,y:510},{x:1460,y:510},
        {x:1700,y:415},{x:1880,y:315},{x:2070,y:225},
        {x:2220,y:135},{x:2360,y:255},
        {x:1780,y:510},{x:2010,y:510},{x:2310,y:510},
    ];

    coinPositions.forEach(pos => {
        coinGfx.fillStyle(0xffd700, 1);
        coinGfx.fillCircle(pos.x, pos.y, 9);
        coinGfx.fillStyle(0xffee88, 0.7);
        coinGfx.fillCircle(pos.x - 2, pos.y - 2, 4);

        let zone = this.add.zone(pos.x, pos.y, 18, 18);
        this.physics.add.existing(zone, true);
        zone.coinGfxRef = coinGfx;
        zone.posX = pos.x;
        zone.posY = pos.y;
        coins.add(zone);
    });

    // ---- ENNEMIS (Garmadon) ----
    enemies = this.physics.add.group();

    const enemyData = [
        // Sur le sol
        { x: 420,  y: 510, minX: 310,  maxX: 560,  speed: 80  },
        { x: 930,  y: 510, minX: 840,  maxX: 1050, speed: 90  },
        { x: 1330, y: 510, minX: 1200, maxX: 1500, speed: 85  },
        { x: 1760, y: 510, minX: 1640, maxX: 1870, speed: 95  },
        { x: 2130, y: 510, minX: 2010, maxX: 2310, speed: 100 },
        // Sur plateformes
        { x: 1080, y: 335, minX: 990,  maxX: 1200, speed: 100 },
        { x: 1900, y: 320, minX: 1820, maxX: 2010, speed: 115 },
        { x: 2230, y: 140, minX: 2155, maxX: 2355, speed: 130 },
    ];

    enemyData.forEach(data => {
        let enemy = this.physics.add.sprite(data.x, data.y, 'garmadon', 0);
        enemy.setScale(0.85);
        enemy.body.setCollideWorldBounds(true);
        enemy.body.setMaxVelocityY(600);
        enemy.body.setSize(70, 90); // hitbox ajustée
        enemy.setDepth(5);
        enemy.minX  = data.minX;
        enemy.maxX  = data.maxX;
        enemy.speed = data.speed;
        enemy.body.setVelocityX(enemy.speed);
        enemy.anims.play('garmadon_walk', true);
        enemies.add(enemy);
    });

    // ---- JOUEUR KAI ----
    player = this.physics.add.sprite(100, 450, 'kai', 0);
    player.setScale(1.1);
    player.setCollideWorldBounds(true);
    player.setDepth(10);

    // ---- ANIMATIONS KAI ----
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'kai', frame: 0 }],
        frameRate: 1, repeat: -1
    });
    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('kai', { start: 4, end: 7 }),
        frameRate: 10, repeat: -1
    });
    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('kai', { start: 8, end: 11 }),
        frameRate: 8, repeat: 0
    });
    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('kai', { start: 12, end: 15 }),
        frameRate: 12, repeat: 0
    });
    player.on('animationcomplete-spin', () => { isAttacking = false; });

    // ---- ANIMATIONS GARMADON ----
    this.anims.create({
        key: 'garmadon_idle',
        frames: [{ key: 'garmadon', frame: 0 }],
        frameRate: 1, repeat: -1
    });
    this.anims.create({
        key: 'garmadon_walk',
        frames: this.anims.generateFrameNumbers('garmadon', { start: 4, end: 7 }),
        frameRate: 8, repeat: -1
    });
    this.anims.create({
        key: 'garmadon_attack',
        frames: this.anims.generateFrameNumbers('garmadon', { start: 8, end: 11 }),
        frameRate: 10, repeat: 0
    });

    // ---- COLLISIONS ----
    this.physics.add.collider(player,  platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.overlap(player, coins,   collectCoin, null, this);
    this.physics.add.overlap(player, enemies, hitEnemy,    null, this);

    // ---- CAMÉRA ----
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(120, 60);

    // ---- CONTRÔLES ----
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-Z',     doSpin, this);
    this.input.keyboard.on('keydown-SPACE', doSpin, this);

    // ---- UI ----
    this.add.text(14, 10, 'NINJAGO PLATFORMER', {
        fontSize: '17px', fill: '#ff4400',
        fontFamily: 'Georgia, serif', fontStyle: 'bold',
        stroke: '#000', strokeThickness: 3
    }).setScrollFactor(0).setDepth(30);

    this.add.text(14, 35, '← → Courir   ↑ Sauter   Z Spin !   Saute sur Garmadon !', {
        fontSize: '11px', fill: '#aaccff',
        fontFamily: 'Arial', stroke: '#000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(30);

    scoreText = this.add.text(14, 56, '⭐ Score : 0', {
        fontSize: '15px', fill: '#ffd700', fontStyle: 'bold',
        fontFamily: 'Arial', stroke: '#000', strokeThickness: 3
    }).setScrollFactor(0).setDepth(30);

    this.add.text(14, 78, '🪙 +10 pièce   💀 +50 Garmadon écrasé', {
        fontSize: '10px', fill: '#88ccaa',
        fontFamily: 'Arial', stroke: '#000', strokeThickness: 2
    }).setScrollFactor(0).setDepth(30);
}

// =====================
//  HELPER : PLATEFORME
// =====================
function makePlatform(scene, x, y, w, h, color) {
    let rect = scene.add.rectangle(x, y, w, h, color);
    scene.physics.add.existing(rect, true);
    platforms.add(rect);

    scene.add.rectangle(x, y + h / 2 + 3, w, 5, 0x330000).setDepth(0);

    let g = scene.add.graphics().setDepth(2);
    g.fillStyle(color, 1);
    let nb = Math.floor(w / 22);
    let sx = x - w / 2 + 9;
    for (let i = 0; i < nb; i++) {
        g.fillRoundedRect(sx + i * 22 - 5, y - h / 2 - 6, 9, 6, 2);
    }
    return rect;
}

// =====================
//   COLLECTER PIÈCE
// =====================
function collectCoin(player, zone) {
    zone.coinGfxRef.fillStyle(0x000000, 0);
    zone.coinGfxRef.fillCircle(zone.posX, zone.posY, 11);
    zone.destroy();
    score += 10;
    scoreText.setText('⭐ Score : ' + score);
    scoreText.setStyle({ fill: '#ffffff' });
    this.time.delayedCall(120, () => scoreText.setStyle({ fill: '#ffd700' }));
}

// =====================
//   TOUCHER ENNEMI
// =====================
function hitEnemy(player, enemy) {
    if (player.body.velocity.y > 50 && player.y < enemy.y - 20) {
        // Sauter dessus = tuer Garmadon
        enemy.destroy();
        player.setVelocityY(-480);
        score += 50;
        scoreText.setText('⭐ Score : ' + score);
        scoreText.setStyle({ fill: '#00ff88' });
        this.time.delayedCall(200, () => scoreText.setStyle({ fill: '#ffd700' }));
    } else {
        // Recul de Kai
        let dir = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(dir * 380);
        player.setVelocityY(-320);
        score = Math.max(0, score - 5);
        scoreText.setText('⭐ Score : ' + score);
        scoreText.setStyle({ fill: '#ff4444' });
        this.time.delayedCall(200, () => scoreText.setStyle({ fill: '#ffd700' }));
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

    // Patrouille Garmadon
    enemies.children.entries.forEach(enemy => {
        if (!enemy.active || !enemy.body) return;

        if (enemy.x >= enemy.maxX) {
            enemy.body.setVelocityX(-enemy.speed);
            enemy.flipX = true;
        } else if (enemy.x <= enemy.minX) {
            enemy.body.setVelocityX(enemy.speed);
            enemy.flipX = false;
        }

        // Animation marche
        enemy.anims.play('garmadon_walk', true);
    });

    // Mouvement Kai
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
