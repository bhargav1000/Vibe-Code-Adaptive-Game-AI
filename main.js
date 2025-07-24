class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }

    init() {
        // Reset all state variables for a clean restart
        this.isDeathSequenceActive = false;
        this.gameOverActive = false;
        this._xHookInitialized = false; // Use a more specific name for the debug flag
    }

    preload() {
        // Load all assets with the correct, visually confirmed 128x128 frame size.
        this.load.image('boss_arena', 'map_assets/boss_arena.png');
        this.load.spritesheet('idle', 'character_assets/Idle.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('walk', 'character_assets/Walk.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('run', 'character_assets/Run.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('melee', 'character_assets/Melee.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('rolling', 'character_assets/Rolling.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('take-damage', 'character_assets/TakeDamage.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('kick', 'character_assets/Kick.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('melee2', 'character_assets/Melee2.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('special1', 'character_assets/Special1.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('die', 'character_assets/Die.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('unsheath', 'character_assets/UnSheathSword.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('shield-block-start', 'character_assets/ShieldBlockStart.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('shield-block-mid', 'character_assets/ShieldBlockMid.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('front-flip', 'character_assets/FrontFlip.png', { frameWidth: 128, frameHeight: 128 });
        this.load.image('healthbar', 'character_assets/healthbar.png');
    }

    create() {
        // --- Map ---
        const map = this.add.image(0, 0, 'boss_arena').setOrigin(0);

        // --- Input & Properties ---
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keys.m = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.keys.r = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.keys.k = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.keys.n = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);
        this.keys.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keys.q = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.keys.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keys.b = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        this.keys.f = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.walkSpeed = 200;
        this.runSpeed = 350;
        this.rollSpeed = 400;
        this.frontFlipSpeed = 300;
        this.facing = 's'; // Default facing direction
        this.isDeathSequenceActive = false;
        this.shieldValue = 15;

        // --- Animations ---
        // This order MUST match the sprite sheet layout and the user's explicit direction mapping.
        // Ensure that this order is unchanged at all times: ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        const directions = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
        this.directionMap = new Map(directions.map((d, i) => [d, i]));
        const framesPerRow = 15;
        directions.forEach((direction, index) => {
            const startFrame = index * framesPerRow;
            
            this.anims.create({
                key: `idle-${direction}`,
                frames: this.anims.generateFrameNumbers('idle', { start: startFrame, end: startFrame + 7 }),
                frameRate: 8,
                repeat: -1
            });

            this.anims.create({
                key: `walk-${direction}`,
                frames: this.anims.generateFrameNumbers('walk', { start: startFrame, end: startFrame + 14 }),
                frameRate: 15,
                repeat: -1
            });

            this.anims.create({
                key: `run-${direction}`,
                frames: this.anims.generateFrameNumbers('run', { start: startFrame, end: startFrame + 14 }),
                frameRate: 20,
                repeat: -1
            });

            this.anims.create({
                key: `melee-${direction}`,
                frames: this.anims.generateFrameNumbers('melee', { start: startFrame, end: startFrame + 14 }),
                frameRate: 40,
                repeat: 0
            });

            this.anims.create({
                key: `rolling-${direction}`,
                frames: this.anims.generateFrameNumbers('rolling', { start: startFrame, end: startFrame + 14 }),
                frameRate: 24,
                repeat: 0
            });

            this.anims.create({
                key: `take-damage-${direction}`,
                frames: this.anims.generateFrameNumbers('take-damage', { start: startFrame, end: startFrame + 7 }),
                frameRate: 20,
                repeat: 0
            });

            this.anims.create({
                key: `kick-${direction}`,
                frames: this.anims.generateFrameNumbers('kick', { start: startFrame, end: startFrame + 14 }),
                frameRate: 40,
                repeat: 0
            });

            this.anims.create({
                key: `melee2-${direction}`,
                frames: this.anims.generateFrameNumbers('melee2', { start: startFrame, end: startFrame + 14 }),
                frameRate: 24,
                repeat: 0
            });

            this.anims.create({
                key: `special1-${direction}`,
                frames: this.anims.generateFrameNumbers('special1', { start: startFrame, end: startFrame + 14 }),
                frameRate: 30,
                repeat: 0
            });

            this.anims.create({
                key: `shield-block-start-${direction}`,
                frames: this.anims.generateFrameNumbers('shield-block-start', { start: startFrame, end: startFrame + 3 }),
                frameRate: 30,
                repeat: 0
            });

            this.anims.create({
                key: `shield-block-mid-${direction}`,
                frames: this.anims.generateFrameNumbers('shield-block-mid', { start: startFrame, end: startFrame + 5 }),
                frameRate: 10,
                repeat: -1
            });

            this.anims.create({
                key: `front-flip-${direction}`,
                frames: this.anims.generateFrameNumbers('front-flip', { start: startFrame, end: startFrame + 14 }),
                frameRate: 24,
                repeat: 0
            });
        });

        // Add a single death animation, as it's not directional
        this.anims.create({
            key: 'die',
            frames: this.anims.generateFrameNumbers('die', { start: 0, end: 14 }),
            frameRate: 8,
            repeat: 0
        });

        directions.forEach((direction, index) => {
            const startFrame = index * framesPerRow;
            this.anims.create({
                key: `unsheath-${direction}`,
                frames: this.anims.generateFrameNumbers('unsheath', { start: startFrame, end: startFrame + 14 }),
                frameRate: 15,
                repeat: 0
            });
        });

        // --- Hero with Physics ---
        this.hero = this.matter.add.sprite(map.width/2, map.height/2, 'idle', 0);
        this.hero.setCircle(28);
        this.hero.setFixedRotation();   // no spin
        this.hero.setIgnoreGravity(true).setFrictionAir(0);
        this.hero.body.slop = 0.5;   // tighter separation test
        this.hero.body.inertia = Infinity; // prevent any rotation
        this.hero.label = 'hero';
        this.hero.takeDamage = this.takeDamage.bind(this);

        // Initialize attack state
        this.hero.isAttacking = false;
        this.hero.currentAttackType = null;
        this.hero.isRecovering = false;
        
        // Initialize armor attributes
        this.hero.armor = { 
            helmet: 0.10,      // 10% damage reduction for head hits
            breastplate: 0.30, // 30% damage reduction for torso hits  
            greaves: 0.15,     // 15% damage reduction for limb hits
            shieldFront: 0.50  // 50% damage reduction when blocking
        };
        
        // Initialize armor durability
        this.hero.armorDur = {
            helmet: 20,        // 20 durability points
            breastplate: 30,   // 30 durability points
            greaves: 15,       // 15 durability points
            shieldFront: 25    // 25 durability points
        };

        this.hero.on('animationcomplete', (animation) => {
            if (animation.key.startsWith('shield-block-start-')) {
                if (this.keys.b.isDown) {
                    this.hero.anims.play(`shield-block-mid-${this.facing}`, true);
                } else {
                    this.hero.anims.play(`idle-${this.facing}`, true);
                }
                return;
            }

            if (animation.key.startsWith('melee-') || animation.key.startsWith('rolling-') || animation.key.startsWith('take-damage-') || animation.key.startsWith('kick-') || animation.key.startsWith('melee2-') || animation.key.startsWith('special1-') || animation.key.startsWith('front-flip-')) {
                this.hero.anims.play(`idle-${this.facing}`, true);
            }
        }, this);

        // --- Purple Knight ---
        this.purpleKnight = this.matter.add.sprite(map.width/2, map.height/4, 'idle', 0);
        this.purpleKnight.setCircle(28);
        this.purpleKnight.setTint(0x9400D3);
        this.purpleKnight.setFixedRotation();
        this.purpleKnight.setIgnoreGravity(true).setFrictionAir(0);
        this.purpleKnight.body.slop = 0.5;   // tighter separation test
        this.purpleKnight.body.inertia = Infinity; // prevent any rotation
        this.purpleKnight.label = 'knight';
        this.purpleKnight.isBlocking = false;
        this.purpleKnight.shieldValue = 15;
        this.purpleKnight.facing = 's';
        this.purpleKnight.anims.play('idle-s', true); // Face down towards the player
        this.purpleKnight.takeDamage = this.takeDamage.bind(this);
        this.purpleKnight.maxHealth = 50;
        this.purpleKnight.health = this.purpleKnight.maxHealth;
        this.purpleKnight.attackCooldown = 0;
        this.purpleKnight.isAttacking = false;
        this.purpleKnight.currentAttackType = null;
        this.purpleKnight.isRecovering = false;
        
        // Initialize armor attributes
        this.purpleKnight.armor = { 
            helmet: 0.15,      // 15% damage reduction for head hits (heavier armor)
            breastplate: 0.40, // 40% damage reduction for torso hits (heavier armor)
            greaves: 0.20,     // 20% damage reduction for limb hits (heavier armor)
            shieldFront: 0.60  // 60% damage reduction when blocking (better shield)
        };
        
        // Initialize armor durability (heavier armor has more durability)
        this.purpleKnight.armorDur = {
            helmet: 30,        // 30 durability points
            breastplate: 40,   // 40 durability points
            greaves: 25,       // 25 durability points
            shieldFront: 35    // 35 durability points
        };

        this.purpleKnight.on('animationcomplete', (animation) => {
            if (animation.key.startsWith('take-damage-')) {
                const direction = this.getDirectionFromAngle(Phaser.Math.Angle.Between(this.purpleKnight.x, this.purpleKnight.y, this.hero.x, this.hero.y));
                this.purpleKnight.anims.play(`idle-${direction}`, true);
            } else if (animation.key.startsWith('shield-block-start-')) {
                if (this.purpleKnight.isBlocking) {
                    const direction = this.getDirectionFromAngle(Phaser.Math.Angle.Between(this.purpleKnight.x, this.purpleKnight.y, this.hero.x, this.hero.y));
                    this.purpleKnight.anims.play(`shield-block-mid-${direction}`, true);
                } else {
                    const direction = this.getDirectionFromAngle(Phaser.Math.Angle.Between(this.purpleKnight.x, this.purpleKnight.y, this.hero.x, this.hero.y));
                    this.purpleKnight.anims.play(`idle-${direction}`, true);
                }
            }
        }, this);

        // --- Collisions ---
        const WALL = 40;                          // 40 px thickness
        const walls = [
            this.matter.add.rectangle(135+1268/2, 165-WALL/2, 1268, WALL, { isStatic:true }),  // top
            this.matter.add.rectangle(105+1265/2, 818+WALL/2, 1265, WALL, { isStatic:true }),  // bottom
            this.matter.add.rectangle(135-WALL/2, 165+728/2, WALL, 728, { isStatic:true }),    // left
            this.matter.add.rectangle(1368+WALL/2, 165+728/2, WALL, 728, { isStatic:true })   // right
        ];
        this.obstacles = walls;

        // Set up collision detection for attacks
        this.matter.world.on('collisionstart', (ev) => {
            ev.pairs.forEach(p => {
                const { bodyA, bodyB } = p;
                
                // Check for active hit sensors (100ms window)
                if (bodyA.label === 'hit-sensor' && bodyA.isActive) {
                    this.checkSensorOverlap(bodyA, bodyB);
                }
                if (bodyB.label === 'hit-sensor' && bodyB.isActive) {
                    this.checkSensorOverlap(bodyB, bodyA);
                }
                
                // Legacy slash sensor support (if any remain)
                if(bodyA.label==='slash' && bodyB.label==='knight' && bodyA.owner!==bodyB){
                    this.dealDamage(bodyB, 10);
                }
                if(bodyB.label==='slash' && bodyA.label==='hero' && bodyB.owner!==bodyA){
                    this.dealDamage(bodyA, 10);
                }
            });
        });
        // F2 debug
        if (!this._f2) {
            this._f2 = true;
            this.input.keyboard.on('keydown-F2', () => {
                this.obstacles.forEach(o => {
                    if (!o.debugG) {
                        const bounds = o.bounds;
                        o.debugG = this.add.graphics().lineStyle(1, 0xff0000)
                            .strokeRect(bounds.min.x, bounds.min.y, bounds.max.x - bounds.min.x, bounds.max.y - bounds.min.y);
                    } else { 
                        o.debugG.destroy(); 
                        o.debugG = null; 
                    }
                });
            });
        }

        // --- Debug Red Boundaries (X) ---
        const redBoundaries = this.add.graphics().setDepth(100).setVisible(false);
        redBoundaries.lineStyle(2, 0xff0000, 0.8);
        const boundaryRects = [
            { x: 135, y: 165, w: 1268, h: 5 },  // top
            { x: 105, y: 818, w: 1265, h: 5 },  // bottom  
            { x: 135, y: 165, w: 5, h: 728 },   // left
            { x: 1368, y: 165, w: 5, h: 728 }   // right
        ];
        boundaryRects.forEach(r => {
            redBoundaries.strokeRect(r.x, r.y, r.w, r.h);
        });
        // Draw knight collision circle
        redBoundaries.strokeCircle(this.purpleKnight.x, this.purpleKnight.y, 28);
        // Draw hero collision circle  
        redBoundaries.strokeCircle(this.hero.x, this.hero.y, 28);


        if (!this._xHookInitialized) {
            this._xHookInitialized = true;
            this.blueBoundaries = this.add.graphics().setDepth(100).setVisible(false);
            this.greenBoundaries = this.add.graphics().setDepth(100).setVisible(false);
            this.input.keyboard.on('keydown-X', () => {
                redBoundaries.setVisible(!redBoundaries.visible);
                this.blueBoundaries.setVisible(!this.blueBoundaries.visible);
                this.greenBoundaries.setVisible(!this.greenBoundaries.visible);
            });
            this.redBoundaries = redBoundaries; // Store for update loop
            this.boundaryRects = boundaryRects; // Store for update loop

            // --- Purple Knight Health Bar ---
            const barX = this.game.config.width / 2;
            const barY = this.game.config.height - 30; // Nudge it up a bit for the smaller size
            this.knightHealthBarBg = this.add.image(barX, barY, 'healthbar').setOrigin(0.5).setScale(0.1).setScrollFactor(0).setDepth(102);
            this.knightHealthBarBg.setCrop(0, 0, this.knightHealthBarBg.width - 38, this.knightHealthBarBg.height);
            this.knightHealthBar = this.add.graphics().setScrollFactor(0).setDepth(101);
            this.knightNameText = this.add.text(barX, barY - (this.knightHealthBarBg.displayHeight / 2) + 30, 'Your Purple Knight', {
                fontSize: '10px',
                fill: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(103);
            this.updateKnightHealthBar();

            // --- Game Over UI ---
            this.gameOverText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 - 40, '', {
                fontSize: '48px',
                fill: '#ff0000',
                fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);

            this.restartText = this.add.text(this.game.config.width / 2, this.game.config.height / 2 + 20, 'Press Q to Restart', {
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(200).setVisible(false);
            this.gameOverActive = false;


            // --- Health Bar ---
            this.hero.maxHealth = 100;
            this.hero.health = this.hero.maxHealth;
            this.healthBarBg = this.add.graphics().setScrollFactor(0).setDepth(101);
            this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(102);
            this.updateHealthBar(); // Initial draw
        }

        // --- Event Logging & WebSocket Bridge ---
        this.socket = new WebSocket('ws://localhost:8765');
        this.eventBuf = [];
        this.logEvt = (actor, action) => {
            // Hero's facing direction is on the scene, knight's is on the object itself
            const directionStr = (actor === this.hero) ? this.facing : actor.facing;

            this.eventBuf.push({
                t: this.time.now,
                actor: actor.name,
                pos: [actor.x, actor.y],
                dir: this.directionMap.get(directionStr),
                hp: actor.health / actor.maxHealth,
                action
            });
            if (this.eventBuf.length > 60) {
                this.eventBuf.shift();
            }
        };

        // Flush event buffer every 150ms
        this.time.addEvent({
            delay: 150,
            loop: true,
            callback: () => {
                if (this.socket.readyState === WebSocket.OPEN && this.eventBuf.length) {
                    this.socket.send(JSON.stringify(this.eventBuf));
                    this.eventBuf.length = 0;
                }
            }
        });

        // --- Camera ---
        this.cameras.main.startFollow(this.hero);
        this.cameras.main.setBounds(0, 0, map.width, map.height);
        this.cameras.main.roundPixels = true;

        // --- Matter Debug View (disabled) ---
        // this.matter.world.createDebugGraphic();
        // this.matter.world.drawDebug = true;
        // this.matter.world.debugGraphic.setVisible(true);
    }

    knightReact() {
        const knight = this.purpleKnight;
        if (knight.isDead || knight.isTakingDamage || knight.isBlocking) return;
    
        const distance = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, knight.x, knight.y);
    
        if (distance < 150) { 
            if (Math.random() < 0.75) { 
                knight.isBlocking = true;
                
                const angle = Phaser.Math.Angle.Between(knight.x, knight.y, this.hero.x, this.hero.y);
                const direction = this.getDirectionFromAngle(angle);
                knight.anims.play(`shield-block-start-${direction}`, true);
    
                this.time.delayedCall(600, () => {
                    knight.isBlocking = false;
                    
                    const knightAnim = knight.anims.currentAnim;
                    if(knightAnim && knightAnim.key.startsWith('shield-block-mid-')) {
                        const newAngle = Phaser.Math.Angle.Between(knight.x, knight.y, this.hero.x, this.hero.y);
                        const newDirection = this.getDirectionFromAngle(newAngle);
                        knight.anims.play(`idle-${newDirection}`, true);
                    }
                });
            }
        }
    }

    handlePlayerAttackOnKnight(hero, knight) {
        if (knight.isTakingDamage) {
            return;
        }
    
        if (knight.isBlocking) {
            const attackAngle = Phaser.Math.Angle.Between(knight.x, knight.y, hero.x, hero.y);
            const knightFacingAngle = this.getAngleFromDirection(this.getDirectionFromAngle(Phaser.Math.Angle.Between(knight.x, knight.y, hero.x, hero.y)));
            const angleDiff = Phaser.Math.Angle.ShortestBetween(Phaser.Math.RadToDeg(knightFacingAngle), Phaser.Math.RadToDeg(attackAngle));
    
            if (Math.abs(angleDiff) <= 45) { // Block only works for a 90-degree arc (2 sectors)
                const attackType = hero.anims.currentAnim.key.split('-')[0];
                let damage = 10;
                if (attackType === 'kick') damage = 5;
                else if (attackType === 'special1') damage = 20;
    
                if (damage > knight.shieldValue) {
                    // Stagger the knight
                    knight.isBlocking = false;
                    this.takeDamage(knight, hero, 'melee');
                }
                return;
            }
        }
    
        const attackType = hero.anims.currentAnim.key.split('-')[0];
        this.takeDamage(knight, hero, attackType);
        this.time.delayedCall(500, () => { knight.isTakingDamage = false; });
    }

    takeDamage(victim, attacker, attackType) {
        if (victim.isDead) return;

        let damage = 10; // Default melee damage
        if (attackType === 'kick') {
            damage = 5;
        }

        victim.health -= damage;
        if (victim === this.hero) {
            this.updateHealthBar();
        } else if (victim === this.purpleKnight) {
            this.updateKnightHealthBar();
        }

        // Knockback Logic
        let knockbackDistance = 0;
        if (attackType === 'kick') {
            knockbackDistance = 8;
        } else if (attackType === 'special1') {
            knockbackDistance = 20;
        }

        if (victim === this.purpleKnight && knockbackDistance > 0) {
            const knockbackAngle = Phaser.Math.Angle.Between(attacker.x, attacker.y, victim.x, victim.y);
            const knockbackVelocity = new Phaser.Math.Vector2(Math.cos(knockbackAngle), Math.sin(knockbackAngle)).scale(knockbackDistance * 0.5); // Matter physics scaling
            victim.setVelocity(knockbackVelocity.x, knockbackVelocity.y);
            this.time.delayedCall(150, () => {
                if (victim.active && !victim.isDead) {
                    victim.setVelocity(0, 0);
                }
            });
        }

        let angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, victim.x, victim.y);
        if (victim === this.purpleKnight) {
            // Invert the angle for the knockback effect
            angle = Phaser.Math.Angle.Wrap(angle + Math.PI);
        }
        const direction = this.getDirectionFromAngle(angle);
        victim.anims.play(`take-damage-${direction}`, true);

        victim.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            if (victim === this.purpleKnight) {
                victim.setTint(0x9400D3);
            } else {
                victim.clearTint();
            }
        });

        if (victim.health <= 0 && !victim.isDead) {
            this.isDeathSequenceActive = true;
            victim.isDead = true;
            victim.setVelocity(0, 0);

            if (victim === this.purpleKnight) {
                const direction = this.getDirectionFromAngle(Phaser.Math.Angle.Between(this.hero.x, this.hero.y, victim.x, victim.y));
                this.hero.anims.playReverse(`unsheath-${direction}`);
                // After animations, show win screen and restart
                this.time.delayedCall(1000, () => {
                    this.showGameOverScreen(true);
                    this.time.delayedCall(2000, () => this.scene.restart());
                });
                this.knightHealthBarBg.setVisible(false);
                this.knightHealthBar.setVisible(false);
                this.knightNameText.setVisible(false);
            } else { // victim is hero
                const victor = this.purpleKnight;
                const direction = this.getDirectionFromAngle(Phaser.Math.Angle.Between(victor.x, victor.y, victim.x, victim.y));
                victor.anims.play(`idle-${direction}`, true);
                this.healthBarBg.setVisible(false);
                this.healthBar.setVisible(false);
                this.time.delayedCall(1500, () => {
                    this.showGameOverScreen(false);
                });
            }

            victim.anims.play('die', true);
            victim.once('animationcomplete-die', () => {
                // Disable physics body for Matter
                this.matter.world.remove(victim.body);  
                victim.body = null;
            });
        }
    }

    showGameOverScreen(didWin) {
        this.gameOverActive = true;
        this.isDeathSequenceActive = false; // Allow Q to be pressed
        this.gameOverText.setText(didWin ? 'YOU WIN' : 'YOU DIED').setVisible(true);

        // Only show restart prompt on loss
        if (!didWin) {
            this.restartText.setVisible(true);
        }
    }

    updateKnightHealthBar() {
        this.knightHealthBar.clear();
        this.knightHealthBar.fillStyle(0xff0000);

        const healthPercentage = this.purpleKnight.health / this.purpleKnight.maxHealth;
        const barTopLeftX = this.knightHealthBarBg.getTopLeft().x;
        const barTopLeftY = this.knightHealthBarBg.getTopLeft().y;

        // Final precision adjustments
        const leftPadding = 86 * 0.1;
        const rightPadding = 120 * 0.1;
        const yOffset = 475 * 0.1;  // Previous offset + 70 pixels down
        const barHeight = 72 * 0.1; // Height from last adjustment

        const barInnerWidth = this.knightHealthBarBg.displayWidth - leftPadding - rightPadding;
        const healthWidth = healthPercentage * barInnerWidth;

        this.knightHealthBar.fillRect(barTopLeftX + leftPadding, barTopLeftY + yOffset, Math.max(0, healthWidth), barHeight);
    }

    updateHealthBar() {
        const x = 20;
        const y = 20;
        const w = 200;
        const h = 20;

        this.healthBarBg.clear();
        this.healthBarBg.fillStyle(0xff0000);
        this.healthBarBg.fillRect(x, y, w, h);

        this.healthBar.clear();
        this.healthBar.fillStyle(0x00ff00);
        const healthWidth = (this.hero.health / this.hero.maxHealth) * w;
        this.healthBar.fillRect(x, y, healthWidth, h);
    }

    getAngleFromDirection(direction) {
        const angles = {
            'e': 0, 'se': 45, 's': 90, 'sw': 135,
            'w': 180, 'nw': -135, 'n': -90, 'ne': -45
        };
        return Phaser.Math.DegToRad(angles[direction]);
    }

    getDirectionFromAngle(angle) {
        const degrees = Phaser.Math.RadToDeg(angle);
        let direction = 's';
        if (degrees >= -22.5 && degrees < 22.5) direction = 'e';
        else if (degrees >= 22.5 && degrees < 67.5) direction = 'se';
        else if (degrees >= 67.5 && degrees < 112.5) direction = 's';
        else if (degrees >= 112.5 && degrees < 157.5) direction = 'sw';
        else if (degrees >= 157.5 || degrees < -157.5) direction = 'w';
        else if (degrees >= -157.5 && degrees < -112.5) direction = 'nw';
        else if (degrees >= -112.5 && degrees < -67.5) direction = 'n';
        else if (degrees >= -67.5 && degrees < -22.5) direction = 'ne';
        return direction;
    }


    spawnSlashSensor = (atk) => {
        const r = 28;          // reach
        // Get angle from facing direction instead of sprite rotation
        const direction = atk === this.hero ? this.facing : atk.facing;
        const angle = this.getAngleFromDirection(direction);
        
        // create a sensor circle offset slightly forward
        const sensor = this.matter.add.circle(atk.x + Math.cos(angle)*r,
                                              atk.y + Math.sin(angle)*r,
                                              r,
                                              { isSensor:true, label:'slash' });
        sensor.owner = atk;

        this.time.delayedCall(120, ()=> this.matter.world.remove(sensor)); // ~2 frames
    };

    performAttack = (attacker, attackType) => {
        // Prevent attacks during recovery or existing attack
        if (attacker.isAttacking || attacker.isRecovering) return;
        
        attacker.isAttacking = true;
        attacker.currentAttackType = attackType;
        
        // Get direction for the attacker
        const direction = attacker === this.hero ? this.facing : attacker.facing;
        
        // Play attack animation and immediately pause on frame 0 for wind-up
        attacker.anims.play(`${attackType}-${direction}`, true);
        attacker.anims.pause(); // Freeze on first frame
        
        // Delay before blade glow flash (50ms before impact)
        this.time.delayedCall(50, () => this.triggerBladeGlow(attacker), [], this);
        
        // Delay before continuing animation and spawning hit sensor (100ms wind-up)
        this.time.delayedCall(100, () => this.continueAttack(attacker), [], this);
    };

    triggerBladeGlow = (attacker) => {
        if (!attacker.isAttacking) return; // Attack was cancelled
        
        // Apply bright yellow/white tint for blade glow effect
        attacker.setTint(0xFFFF99); // Bright yellow-white color
        
        // Remove tint after 50ms
        this.time.delayedCall(50, () => {
            if (attacker.active) {
                // Restore original tint
                if (attacker === this.purpleKnight) {
                    attacker.setTint(0x9400D3); // Purple knight's original color
                } else {
                    attacker.clearTint(); // Hero's original color
                }
            }
        });
    };

    continueAttack = (attacker) => {
        if (!attacker.isAttacking) return; // Attack was cancelled
        
        // Resume the paused animation to continue from frame 1
        attacker.anims.resume();
        
        // Spawn active frame sensor with controlled hit window
        this.spawnActiveFrameSensor(attacker);
        
        // Emit sword arc particles at the moment of sensor spawn
        this.createSwordArcParticles(attacker);
        
        // Nudge camera opposite to swing direction for impact effect
        this.nudgeCamera(attacker);
        
        // Trigger knight reaction if hero is attacking
        if (attacker === this.hero) {
            this.knightReact();
        }
        
        // Reset attack state when animation completes
        attacker.once('animationcomplete', (animation) => {
            // Only handle attack animations
            if (animation.key.includes(attacker.currentAttackType)) {
                attacker.isAttacking = false;
                attacker.currentAttackType = null;
                attacker.attackCooldown = 0;
                
                // Return to idle if not recovering
                if (!attacker.isRecovering) {
                    const direction = attacker === this.hero ? this.facing : attacker.facing;
                    attacker.anims.play(`idle-${direction}`, true);
                }
            }
        });
    };

    createSwordArcParticles = (attacker) => {
        const direction = attacker === this.hero ? this.facing : attacker.facing;
        const angle = this.getAngleFromDirection(direction);
        
        // Create 3-5 spark particles along the blade arc
        const numParticles = Phaser.Math.Between(3, 5);
        
        for (let i = 0; i < numParticles; i++) {
            // Position particles along an arc in front of the attacker
            const arcProgress = i / (numParticles - 1); // 0 to 1
            const arcRadius = 20 + (arcProgress * 15); // 20 to 35 pixels from attacker
            const arcAngle = angle + (arcProgress - 0.5) * 0.8; // Small arc spread
            
            const particleX = attacker.x + Math.cos(arcAngle) * arcRadius;
            const particleY = attacker.y + Math.sin(arcAngle) * arcRadius;
            
            // Create spark particle using graphics
            const spark = this.add.graphics();
            spark.fillStyle(0xFFFFAA); // Bright yellow spark
            spark.fillCircle(0, 0, 2); // Small 2px radius spark
            spark.setPosition(particleX, particleY);
            spark.setDepth(50); // Above characters but below UI
            
            // Add particle movement and fade out
            const velocityX = Math.cos(arcAngle) * 30 + (Math.random() - 0.5) * 20;
            const velocityY = Math.sin(arcAngle) * 30 + (Math.random() - 0.5) * 20;
            
            // Animate particle
            this.tweens.add({
                targets: spark,
                x: particleX + velocityX,
                y: particleY + velocityY,
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                    spark.destroy();
                }
            });
        }
    };

    nudgeCamera = (attacker) => {
        const direction = attacker === this.hero ? this.facing : attacker.facing;
        const angle = this.getAngleFromDirection(direction);
        
        // Calculate nudge direction (opposite to swing direction)
        const nudgeAngle = angle + Math.PI; // 180 degrees opposite
        const nudgeStrength = Phaser.Math.Between(2, 3); // 2-3 pixel nudge
        
        // Calculate nudge offset
        const nudgeX = Math.cos(nudgeAngle) * nudgeStrength;
        const nudgeY = Math.sin(nudgeAngle) * nudgeStrength;
        
        // Store original camera position
        const originalX = this.cameras.main.scrollX;
        const originalY = this.cameras.main.scrollY;
        
        // Apply camera nudge
        this.cameras.main.setScroll(originalX + nudgeX, originalY + nudgeY);
        
        // Return camera to original position after one frame (~16ms)
        this.time.delayedCall(16, () => {
            this.cameras.main.setScroll(originalX, originalY);
        });
    };

    spawnActiveFrameSensor = (attacker) => {
        const r = 28; // reach
        const direction = attacker === this.hero ? this.facing : attacker.facing;
        const angle = this.getAngleFromDirection(direction);
        
        // Create hit sensor at sword's reach
        const sensor = this.matter.add.circle(
            attacker.x + Math.cos(angle) * r,
            attacker.y + Math.sin(angle) * r,
            r,
            { isSensor: true, label: 'hit-sensor' }
        );
        sensor.owner = attacker;
        sensor.isActive = true;
        
        // Store reference for collision checking
        this.activeSensors = this.activeSensors || [];
        this.activeSensors.push(sensor);
        
        // Remove sensor after 100ms (active frame window)
        this.time.delayedCall(100, () => {
            if (this.matter.world && sensor.body && sensor.isActive) {
                this.matter.world.remove(sensor);
                sensor.isActive = false;
                
                // If sensor expired without hitting, still enter recovery
                if (!sensor.hasHit) {
                    attacker.isRecovering = true;
                    this.time.delayedCall(150, () => {
                        attacker.isRecovering = false;
                        
                        // Return to idle after recovery if not already in an action
                        if (!attacker.isAttacking) {
                            const direction = attacker === this.hero ? this.facing : attacker.facing;
                            attacker.anims.play(`idle-${direction}`, true);
                        }
                    });
                }
            }
            // Remove from active sensors list
            const index = this.activeSensors.indexOf(sensor);
            if (index > -1) {
                this.activeSensors.splice(index, 1);
            }
        });
    };

    checkSensorOverlap = (sensor, target) => {
        // Only process during active frame window
        if (!sensor.isActive || !sensor.owner) return;
        
        // Determine if target is valid for damage
        const attacker = sensor.owner;
        let isValidTarget = false;
        const baseDamage = 10;
        
        if (attacker === this.hero && target.label === 'knight') {
            isValidTarget = true;
        } else if (attacker === this.purpleKnight && target.label === 'hero') {
            isValidTarget = true;
        }
        
        // Process hit on first valid overlap
        if (isValidTarget && target.gameObject) {
            // Mark sensor as having hit something
            sensor.hasHit = true;
            
            // Get hit coordinates (sensor position represents the hit point)
            const hitX = sensor.position.x;
            const hitY = sensor.position.y;
            
            // Calculate final damage with modifiers including hit location
            const armorMod = this.getArmorModifier(target.gameObject, hitX, hitY, baseDamage);
            const critMod = this.getCritModifier(attacker, target.gameObject);
            let dmg = baseDamage * armorMod * critMod;
            
            // Apply directional blocking bonus
            dmg = this.applyDirectionalBlocking(target.gameObject, attacker, dmg);
            
            // Apply damage and effects
            this.applyDamage(target.gameObject, dmg);
            this.applyKnockback(target.gameObject, attacker);
            this.playHitReaction(target.gameObject);
            
            // Start recovery period for attacker
            attacker.isRecovering = true;
            this.time.delayedCall(150, () => {
                attacker.isRecovering = false;
                
                // Return to idle after recovery if not already in an action
                if (!attacker.isAttacking) {
                    const direction = attacker === this.hero ? this.facing : attacker.facing;
                    attacker.anims.play(`idle-${direction}`, true);
                }
            });
            
            // Remove sensor immediately to prevent multi-hits
            this.matter.world.remove(sensor);
            sensor.isActive = false;
            
            // Remove from active sensors list
            const index = this.activeSensors?.indexOf(sensor);
            if (index > -1) {
                this.activeSensors.splice(index, 1);
            }
        }
    };

    getArmorModifier = (target, hitX, hitY, damage) => {
        // Determine armor slot based on blocking status and hit zone
        let armorSlot = 'breastplate'; // default to torso
        
        if (target.isBlocking) {
            // When blocking, use shield armor
            armorSlot = 'shieldFront';
        } else if (hitX !== undefined && hitY !== undefined) {
            // Calculate hit zone based on distance from target center
            const targetRadius = 28;
            const d = Phaser.Math.Distance.Between(hitX, hitY, target.x, target.y);
            
            if (d < targetRadius * 0.3) {
                // Head zone
                armorSlot = 'helmet';
            } else if (d < targetRadius * 0.7) {
                // Torso zone  
                armorSlot = 'breastplate';
            } else {
                // Limbs zone
                armorSlot = 'greaves';
            }
        }
        
        // Apply armor durability damage
        if (target.armorDur && target.armorDur[armorSlot] > 0) {
            target.armorDur[armorSlot] -= damage;
            if (target.armorDur[armorSlot] <= 0) {
                target.armor[armorSlot] /= 2;  // Halve protection when broken
                target.armorDur[armorSlot] = 0; // Mark as broken
            }
        }
        
        // Apply armor damage reduction: dmg *= (1 - armor[slot])
        const armorReduction = target.armor[armorSlot] || 0;
        return (1 - armorReduction);
    };

    applyDirectionalBlocking = (target, attacker, dmg) => {
        // Only apply if target is blocking
        if (!target.isBlocking) {
            return dmg;
        }
        
        // Calculate attack angle from attacker to target
        const hitAngle = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
        
        // Get target's facing direction
        const targetFacing = target === this.hero ? this.facing : target.facing;
        
        // Check if attack is within blocking arc
        if (this.withinArc(hitAngle, targetFacing, 90)) {
            // Apply extra 50% reduction for frontal blocks
            dmg *= 0.5;
        }
        
        return dmg;
    };

    withinArc = (hitAngle, targetFacing, arcDegrees) => {
        // Convert target facing direction to angle
        const targetAngle = this.getAngleFromDirection(targetFacing);
        
        // Convert to degrees for easier calculation
        const hitDegrees = Phaser.Math.RadToDeg(hitAngle);
        const targetDegrees = Phaser.Math.RadToDeg(targetAngle);
        
        // Calculate the difference between angles
        let angleDiff = Math.abs(hitDegrees - targetDegrees);
        
        // Handle angle wrap-around (e.g., 350° vs 10°)
        if (angleDiff > 180) {
            angleDiff = 360 - angleDiff;
        }
        
        // Check if within the specified arc (±45° for 90° total arc)
        return angleDiff <= (arcDegrees / 2);
    };

    getCritModifier = (attacker, target) => {
        // Basic crit system - can be expanded later
        const critChance = 0.1; // 10% crit chance
        if (Math.random() < critChance) {
            return 1.5; // 50% more damage on crit
        }
        return 1.0; // No crit
    };

    applyDamage = (target, damage) => {
        if (!target || target.isDead || target.isTakingDamage) return;

        target.health -= damage;
        target.isTakingDamage = true;
        
        if (target === this.hero) {
            this.updateHealthBar();
        } else if (target === this.purpleKnight) {
            this.updateKnightHealthBar();
        }

        // Death check
        if (target.health <= 0 && !target.isDead) {
            this.handleDeath(target);
        } else {
            this.time.delayedCall(500, () => { 
                target.isTakingDamage = false; 
            });
        }
    };

    applyKnockback = (target, attacker) => {
        // Only apply knockback to non-blocking targets
        if (target.isBlocking) return;
        
        const knockbackDistance = 15;
        const knockbackAngle = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
        const knockbackVelocity = new Phaser.Math.Vector2(
            Math.cos(knockbackAngle), 
            Math.sin(knockbackAngle)
        ).scale(knockbackDistance * 0.5);
        
        target.setVelocity(knockbackVelocity.x, knockbackVelocity.y);
        
        // Stop knockback after short duration
        this.time.delayedCall(150, () => {
            if (target.active && !target.isDead) {
                target.setVelocity(0, 0);
            }
        });
    };

    playHitReaction = (target) => {
        // Visual feedback
        target.setTint(0xff0000);
        
        // Play damage animation
        const attacker = target === this.hero ? this.purpleKnight : this.hero;
        let angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
        if (target === this.purpleKnight) {
            angle = Phaser.Math.Angle.Wrap(angle + Math.PI);
        }
        const direction = this.getDirectionFromAngle(angle);
        target.anims.play(`take-damage-${direction}`, true);
        
        // Reset tint after duration
        this.time.delayedCall(200, () => {
            if (target === this.purpleKnight) {
                target.setTint(0x9400D3);
            } else {
                target.clearTint();
            }
        });
    };

    dealDamage = (body, damage) => {
        const gameObject = body.gameObject;
        if (!gameObject || gameObject.isDead || gameObject.isTakingDamage) return;

        gameObject.health -= damage;
        gameObject.isTakingDamage = true;
        
        if (gameObject === this.hero) {
            this.updateHealthBar();
        } else if (gameObject === this.purpleKnight) {
            this.updateKnightHealthBar();
        }

        // Visual feedback
        gameObject.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            if (gameObject === this.purpleKnight) {
                gameObject.setTint(0x9400D3);
            } else {
                gameObject.clearTint();
            }
        });

        // Death check
        if (gameObject.health <= 0 && !gameObject.isDead) {
            this.handleDeath(gameObject);
        } else {
            this.time.delayedCall(500, () => { 
                gameObject.isTakingDamage = false; 
            });
        }
    };

    handleDeath = (victim) => {
        this.isDeathSequenceActive = true;
        victim.isDead = true;
        victim.setVelocity(0, 0);

        if (victim === this.purpleKnight) {
            const direction = this.getDirectionFromAngle(Phaser.Math.Angle.Between(this.hero.x, this.hero.y, victim.x, victim.y));
            this.hero.anims.playReverse(`unsheath-${direction}`);
            this.time.delayedCall(1000, () => {
                this.showGameOverScreen(true);
                this.time.delayedCall(2000, () => this.scene.restart());
            });
            this.knightHealthBarBg.setVisible(false);
            this.knightHealthBar.setVisible(false);
            this.knightNameText.setVisible(false);
        } else { // victim is hero
            const victor = this.purpleKnight;
            const direction = this.getDirectionFromAngle(Phaser.Math.Angle.Between(victor.x, victor.y, victim.x, victim.y));
            victor.anims.play(`idle-${direction}`, true);
            this.healthBarBg.setVisible(false);
            this.healthBar.setVisible(false);
            this.time.delayedCall(1500, () => {
                this.showGameOverScreen(false);
            });
        }

        victim.anims.play('die', true);
        victim.once('animationcomplete-die', () => {
            this.matter.world.remove(victim.body);  
            victim.body = null;
        });
    };


    update(time, delta) {
        if (this.gameOverActive) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.q)) {
                this.scene.restart();
            }
            return; // Lock all other updates
        }

        if (this.isDeathSequenceActive) {
            this.hero.setVelocity(0, 0);
            return;
        }

        // --- Purple Knight AI ---
        const knight = this.purpleKnight;
        if (knight.active) {
            if (knight.isDead) {
                return;
            }
            
            const knightAnim = knight.anims.currentAnim;
            const isKnightInAction = (knightAnim && (knightAnim.key.startsWith('take-damage-') || knightAnim.key.startsWith('shield-block-'))) || knight.isTakingDamage;

            if (!isKnightInAction) {
                const angle = Phaser.Math.Angle.Between(knight.x, knight.y, this.hero.x, this.hero.y);
                const direction = this.getDirectionFromAngle(angle);
                knight.facing = direction;

                // Calculate distance to player
                const distanceToPlayer = Phaser.Math.Distance.Between(knight.x, knight.y, this.hero.x, this.hero.y);
                
                // Move towards player if far enough away
                if (distanceToPlayer > 80) {
                    const knightSpeed = 2; // Matter physics uses different force scale
                    const moveVector = new Phaser.Math.Vector2(
                        Math.cos(angle) * knightSpeed,
                        Math.sin(angle) * knightSpeed
                    );
                    
                    knight.setVelocity(moveVector.x, moveVector.y);
                    knight.anims.play(`walk-${direction}`, true);
                } else {
                    // Stop and idle when close to player
                    knight.setVelocity(0, 0);
                    knight.anims.play(`idle-${direction}`, true);
                }
            }
        }


        if (this.redBoundaries && this.redBoundaries.visible) {
            this.redBoundaries.clear();
            this.redBoundaries.lineStyle(2, 0xff0000, 0.8);
            this.boundaryRects.forEach(r => {
                this.redBoundaries.strokeRect(r.x, r.y, r.w, r.h);
            });
            // Draw knight collision circle
            this.redBoundaries.strokeCircle(this.purpleKnight.x, this.purpleKnight.y, 28);
            // Draw hero collision circle  
            this.redBoundaries.strokeCircle(this.hero.x, this.hero.y, 28);
        }
        if (this.blueBoundaries && this.blueBoundaries.visible) {
            this.blueBoundaries.clear();
            this.blueBoundaries.lineStyle(2, 0x0000ff, 0.8);
            const heroCenterX = this.hero.x;
            const heroCenterY = this.hero.y;
            const heroRadius = 28;
            this.blueBoundaries.strokeCircle(heroCenterX, heroCenterY, heroRadius);
            for (let i = 0; i < 8; i++) {
                const angle = i * 45;
                const rad = Phaser.Math.DegToRad(angle);
                const endX = heroCenterX + heroRadius * Math.cos(rad);
                const endY = heroCenterY + heroRadius * Math.sin(rad);
                this.blueBoundaries.beginPath();
                this.blueBoundaries.moveTo(heroCenterX, heroCenterY);
                this.blueBoundaries.lineTo(endX, endY);
                this.blueBoundaries.strokePath();
            }
        }
        if (this.greenBoundaries && this.greenBoundaries.visible) {
            this.greenBoundaries.clear();
            this.greenBoundaries.lineStyle(2, 0x00ff00, 0.8);
            const knightCenterX = this.purpleKnight.x;
            const knightCenterY = this.purpleKnight.y;
            const knightRadius = 28;
            this.greenBoundaries.strokeCircle(knightCenterX, knightCenterY, knightRadius);
            for (let i = 0; i < 8; i++) {
                const angle = i * 45;
                const rad = Phaser.Math.DegToRad(angle);
                const endX = knightCenterX + knightRadius * Math.cos(rad);
                const endY = knightCenterY + knightRadius * Math.sin(rad);
                this.greenBoundaries.beginPath();
                this.greenBoundaries.moveTo(knightCenterX, knightCenterY);
                this.greenBoundaries.lineTo(endX, endY);
                this.greenBoundaries.strokePath();
            }
        }

        // --- Hero Input & Movement ---
        const { left, right, up, down, space, m, r, k, n, s, b, f } = this.keys;

        // Early return if in recovery period
        if (this.hero.isRecovering) return;
        
        const currentAnim = this.hero.anims.currentAnim;
        const isBlocking = currentAnim && (currentAnim.key.startsWith('shield-block-start-') || currentAnim.key.startsWith('shield-block-mid-'));
        const isActionInProgress = this.hero.isAttacking || (currentAnim && (currentAnim.key.startsWith('melee-') || currentAnim.key.startsWith('rolling-') || currentAnim.key.startsWith('kick-') || currentAnim.key.startsWith('melee2-') || currentAnim.key.startsWith('special1-') || currentAnim.key.startsWith('front-flip-')) && this.hero.anims.isPlaying);

        if (isBlocking) {
            this.hero.setVelocity(0, 0);
            if (b.isUp) {
                this.hero.anims.play(`idle-${this.facing}`, true);
            }
            return;
        }

        if (isActionInProgress) {
            if (currentAnim.key.startsWith('rolling-') || currentAnim.key.startsWith('front-flip-')) {
                const moveVelocity = new Phaser.Math.Vector2();
                switch (this.facing) {
                    case 'n': moveVelocity.y = -1; break;
                    case 's': moveVelocity.y = 1; break;
                    case 'w': moveVelocity.x = -1; break;
                    case 'e': moveVelocity.x = 1; break;
                    case 'nw': moveVelocity.set(-1, -1); break;
                    case 'ne': moveVelocity.set(1, -1); break;
                    case 'sw': moveVelocity.set(-1, 1); break;
                    case 'se': moveVelocity.set(1, 1); break;
                }
                const speed = currentAnim.key.startsWith('rolling-') ? 8 : 6; // Matter physics scaling
                moveVelocity.normalize().scale(speed);
                this.hero.setVelocity(moveVelocity.x, moveVelocity.y);
            } else {
                this.hero.setVelocity(0, 0);
            }
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(f)) {
            this.hero.anims.play(`front-flip-${this.facing}`, true);
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(b)) {
            this.hero.setVelocity(0, 0);
            this.hero.anims.play(`shield-block-start-${this.facing}`, true);
            return;
        }
        
        if (Phaser.Input.Keyboard.JustDown(m)) {
            this.performAttack(this.hero, 'melee');
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(r)) {
            this.hero.anims.play(`rolling-${this.facing}`, true);
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(k)) {
            this.performAttack(this.hero, 'kick');
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(n)) {
            this.performAttack(this.hero, 'melee2');
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(s)) {
            this.performAttack(this.hero, 'special1');
            return;
        }

        const velocity = new Phaser.Math.Vector2();

        // --- Determine direction from key presses ---
        let direction = this.facing;
        if (up.isDown) {
            if (left.isDown) direction = 'nw';
            else if (right.isDown) direction = 'ne';
            else direction = 'n';
        } else if (down.isDown) {
            if (left.isDown) direction = 'sw';
            else if (right.isDown) direction = 'se';
            else direction = 's';
        } else if (left.isDown) {
            direction = 'w';
        } else if (right.isDown) {
            direction = 'e';
        }

        // --- Set velocity based on keys pressed ---
        if (left.isDown) velocity.x = -1;
        else if (right.isDown) velocity.x = 1;
        if (up.isDown) velocity.y = -1;
        else if (down.isDown) velocity.y = 1;

        // --- Play animations ---
        if (velocity.length() > 0) {
            this.facing = direction;

            const currentSpeed = space.isDown ? 5 : 3; // Matter physics scaling
            velocity.normalize().scale(currentSpeed);

            const animPrefix = space.isDown ? 'run' : 'walk';
            this.hero.anims.play(`${animPrefix}-${this.facing}`, true);
        } else {
            this.hero.anims.play(`idle-${this.facing}`, true);
        }

        this.hero.setVelocity(velocity.x, velocity.y);
        
        // Ensure no visual rotation
        this.hero.setRotation(0);
        this.purpleKnight.setRotation(0);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: true,
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            enableSleep: false,       // keep bodies active
            positionIterations: 6,    // CCD robustness
            velocityIterations: 6
        }
    },
    scene: [PlayScene]
};

const game = new Phaser.Game(config); 