let spriteSheets = {};
let animations = {};
let currentAnimation1; // 角色1的當前動畫
let currentAnimation2; // 角色2的當前動畫
let isAnimating1 = false; // 角色1是否在動畫中
let isAnimating2 = false; // 角色2是否在動畫中
let facingRight1 = true;  // 角色1朝向
let facingRight2 = true;  // 角色2朝向
let characterX1 = -700;     // 角色1 X軸位置
let characterY1 = 0;     // 角色1 Y軸位置
let characterX2 = 700;     // 角色2 X軸位置
let characterY2 = 0;     // 角色2 Y軸位置
let velocityY1 = 0;      // 角色1 Y軸速度
let velocityY2 = 0;      // 角色2 Y軸速度
let isJumping1 = false;  // 角色1 跳躍狀態
let isJumping2 = false;  // 角色2 跳躍狀態
let moveDistance = 100; // 設定移動距離
let moveDistance2 = 100; // 設定2移動距離
let backgroundImage; 
const GRAVITY = 0.8;     // 重力
const JUMP_FORCE = -15;  // 跳躍力度
const MOVE_SPEED = 5;    // 移動速度
let floorY;              // 地板Y座標
let attackEffects = [];   // 攻擊特效物件陣列
const FLOOR_HEIGHT = 100; // 地板距離底部的高度
const ATTACK_MOVE_DISTANCE = 500; // 攻擊移動距離
const ATTACK_EFFECT_SPEED = 7;    // 攻擊特效移動速度

let isRunning1 = false; // 角色1是否在跑步
let isRunning2 = false; // 角色2是否在跑步

// 血量設定
let health1 = 100; // 角色1血量
let health2 = 100; // 角色2血量
let gameOver = false; // 遊戲結束狀態
let winner = ''; // 優勝者

function preload() {
  backgroundImage = loadImage('background.png');
  // 載入角色1的精靈圖片
  spriteSheets.character1 = {
    stance: loadImage('stance.png'),
    jump: loadImage('jump.png'),
    run: loadImage('run.png'),
    explotion: loadImage('explotion.png'),
    attack1: loadImage('1attack.png'),
    attack2: loadImage('2attack.png'),
    attackEffect: loadImage('1attack_air.png')
  };

  // 載入角色2的精靈圖片
  spriteSheets.character2 = {
    stance: loadImage('2stance.png'),
    jump: loadImage('2jump.png'),
    run: loadImage('2run.png'),
    explotion: loadImage('2explotion.png'),
    attack1: loadImage('3attack.png'),
    attack2: loadImage('4attack.png'),
    attackEffect: loadImage('3attack_air.png')
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  floorY = height - FLOOR_HEIGHT;  // 確保地板位置正確
  characterY1 = floorY - height / 2; // 確保角色1在地板上
  characterY2 = floorY - height / 2; // 確保角色2在地板上

  // 為角色1設置動畫參數
  animations.character1 = {
    stance: createAnimation(spriteSheets.character1.stance, 88, 109, 9, 10),
    jump: createAnimation(spriteSheets.character1.jump, 86, 123, 5, 10),
    run: createAnimation(spriteSheets.character1.run, 88, 90, 6, 5),
    explotion: createAnimation(spriteSheets.character1.explotion, 185, 192, 11, 8),
    attack1: createAnimation(spriteSheets.character1.attack1, 140, 172, 10, 2),
    attack2: createAnimation(spriteSheets.character1.attack2, 132, 153, 9, 5),
    attackEffect: createAnimation(spriteSheets.character1.attackEffect, 63, 123, 1, 500)
  };

  // 為角色2設置動畫參數
  animations.character2 = {
    stance: createAnimation(spriteSheets.character2.stance, 114.444444444, 86, 9, 10),
    jump: createAnimation(spriteSheets.character2.jump, 106, 123, 5, 10),
    run: createAnimation(spriteSheets.character2.run, 88, 90, 6, 100),
    explotion: createAnimation(spriteSheets.character2.explotion, 184.545454545, 192, 11, 8),
    attack1: createAnimation(spriteSheets.character2.attack1, 132.444444444, 153, 10, 3),
    attack2: createAnimation(spriteSheets.character2.attack2, 116, 116, 9, 5),
    attackEffect: createAnimation(spriteSheets.character2.attackEffect, 67, 64, 1, 500)
  };

  currentAnimation1 = animations.character1.stance; // 初始動畫為角色1的站立
  currentAnimation2 = animations.character2.stance; // 初始動畫為角色2的站立
}

function createAnimation(sheet, frameWidth, frameHeight, frames, frameDelay) {
  return {
    sheet: sheet,
    frameWidth: frameWidth,
    frameHeight: frameHeight,
    frames: frames,
    frameIndex: 0,
    frameDelay: frameDelay
  };
}

class AttackEffect {
  constructor(x, y, facingRight, character) {
    this.x = x;
    this.y = y;
    this.facingRight = facingRight;
    this.character = character;
    this.animation = character === 1 ? animations.character1.attackEffect : animations.character2.attackEffect;
    this.frameIndex = 0;
    this.active = true;
    this.distanceMoved = 0;
  }

  update() {
    // 根據角色的朝向移動攻擊特效
    this.x += (this.facingRight ? ATTACK_EFFECT_SPEED : -ATTACK_EFFECT_SPEED);
    this.distanceMoved += ATTACK_EFFECT_SPEED;

    // 碰撞檢測
    if (this.facingRight) {
      if (this.x > characterX2 - 50 && this.x < characterX2 + 50 && this.y === characterY2) {
        if (health2 > 0) health2 -= 10; // 扣除角色2血量
        this.active = false; // 攻擊特效消失
      }
    } else {
      if (this.x < characterX1 + 50 && this.x > characterX1 - 50 && this.y === characterY1) {
        if (health1 > 0) health1 -= 10; // 扣除角色1血量
        this.active = false; // 攻擊特效消失
      }
    }

    // 如果攻擊特效移動超過一定距離，則消失
    if (this.distanceMoved >= ATTACK_MOVE_DISTANCE) {
      this.active = false;
    }

    // 更新動畫幀
    if (frameCount % this.animation.frameDelay === 0) {
      this.frameIndex++;
      if (this.frameIndex >= this.animation.frames) {
        this.active = false;
      }
    }
  }

  draw() {
    push();
    translate(width / 2 + this.x, height / 2 + this.y);
    if (!this.facingRight) {
      scale(-1, 1); // 如果角色面向左側，則翻轉
    }
    image(
      this.animation.sheet,
      -this.animation.frameWidth / 2,
      -this.animation.frameHeight / 2,
      this.animation.frameWidth,
      this.animation.frameHeight,
      this.animation.frameWidth * this.frameIndex,
      0,
      this.animation.frameWidth,
      this.animation.frameHeight
    );
    pop();
  }
}



function draw() {
  image(backgroundImage, 0, 0, width, height);
  if (gameOver) {
    // 當遊戲結束時，畫面變成全灰
    background(128); // 灰色背景
    fill(0); // 黑色文字
    textSize(32);
    textAlign(CENTER);
    text(`贏家是: ${winner}`, width / 2, height / 2 - 20);
    textSize(24);
    text("按下 R 鍵即可重製遊戲", width / 2, height / 2 + 20);
  // 繪製 "TKUET" 文字
    fill(255); // 設定文字顏色為白色
    textSize(100); // 設定文字大小
    textAlign(CENTER); // 文字居中對齊
    text("TKUET", width / 2, height / 2 - 250); // 在畫面正中間上方顯示文字
    return; // 退出函數，避免繪製其他內容
  }
  // 繪製 "TKUET" 文字
  fill(255); // 設定文字顏色為白色
  textSize(100); // 設定文字大小
  textAlign(CENTER); // 文字居中對齊
  text("TKUET", width / 2, height / 2 - 250); // 在畫面正中間上方顯示文字
  //角色操作方式
  fill(0); // 設定文字顏色為白色
  textSize(20); // 設定文字大小
  textAlign(LEFT); // 文字居中對齊
  text("操作方式：上跳躍、下回血、左右移動、1發射攻擊、2位移", width/2-width/2.1, height / 2 - 250);
  //角色操作方式
  fill(0); // 設定文字顏色為白色
  textSize(20); // 設定文字大小
  textAlign(RIGHT); // 文字居中對齊
  text("操作方式：w跳躍、s回血、ad移動、j發射攻擊、k位移", width/2+width/2.1, height / 2 - 250);

  // 繪製地板
  stroke(0);
  strokeWeight(2);
  line(0, floorY, width, floorY);

  // 更新角色1的物理
  updateCharacter(1);
  // 更新角色2的物理
  updateCharacter(2);

  // 更新和繪製攻擊特效
  for (let i = attackEffects.length - 1; i >= 0; i--) {
    let effect = attackEffects[i];
    if (effect.active) {
      effect.update();
      effect.draw();
    } else {
      attackEffects.splice(i, 1); // 移除不活躍的攻擊特效
    }
  }

  // 繪製角色1
  drawCharacter(1);
  // 繪製角色2
  drawCharacter(2);

  // 繪製血量條
  drawHealthBars();

  // 檢查是否有角色血量歸0
  if (health1 <= 0 || health2 <= 0) {
    gameOver = true;
    winner = health1 <= 0 ? '角色二' : '角色一';
  }


  // 持續移動角色1
  if (isRunning1) {
    characterX1 += (facingRight1 ? MOVE_SPEED * 1.5 : -MOVE_SPEED * 1.5); // 增加移動速度
    currentAnimation1 = animations.character1.run; // 切換到跑步動畫
    currentAnimation1.frameIndex = (currentAnimation1.frameIndex + 1) % currentAnimation1.frames; // 更新動畫幀
  }

  // 持續移動角色2
  if (isRunning2) {
    characterX2 += (facingRight2 ? MOVE_SPEED * 1.5 : -MOVE_SPEED * 1.5); // 增加移動速度
    currentAnimation2 = animations.character2.run; // 切換到跑步動畫
    currentAnimation2.frameIndex = (currentAnimation2.frameIndex + 1) % currentAnimation2.frames; // 更新動畫幀
  }
}

function updateCharacter(character) {
  let characterX = character === 1 ? characterX1 : characterX2;
  let characterY = character === 1 ? characterY1 : characterY2;
  let isJumping = character === 1 ? isJumping1 : isJumping2;
  let velocityY = character === 1 ? velocityY1 : velocityY2;

  // 處理跳躍物理
  if (isJumping) {
    velocityY += GRAVITY;
    characterY += velocityY;

    // 著地檢測
    if (characterY >= floorY - height / 2) {
      characterY = floorY - height / 2;
      velocityY = 0;
      isJumping = false;
    }
  }

  // 更新角色位置
  if (character === 1) {
    characterX1 = characterX;
    characterY1 = characterY;
    isJumping1 = isJumping;
    velocityY1 = velocityY;
  } else {
    characterX2 = characterX;
    characterY2 = characterY;
    isJumping2 = isJumping;
    velocityY2 = velocityY;
  }
}

function drawCharacter(character) {
  let characterX = character === 1 ? characterX1 : characterX2;
  let characterY = character === 1 ? characterY1 : characterY2;
  let anim = character === 1 ? currentAnimation1 : currentAnimation2;

  push();
  translate(width / 2 + characterX, height / 2 + characterY);
  if (character === 1 && !facingRight1) {
    scale(-1, 1);
  } else if (character === 2 && !facingRight2) {
    scale(-1, 1);
  }
  image(
    anim.sheet,
    -anim.frameWidth / 2,
    -anim.frameHeight / 2,
    anim.frameWidth,
    anim.frameHeight,
    anim.frameWidth * anim.frameIndex,
    0,
    anim.frameWidth,
    anim.frameHeight
  );
  pop();

  // 更新動畫幀
  if (frameCount % anim.frameDelay === 0) {
    anim.frameIndex = (anim.frameIndex + 1) % anim.frames;

    // 如果動畫播放完畢且不是stance動作，則返回stance
    if (anim.frameIndex === 0 && (character === 1 ? isAnimating1 : isAnimating2)) {
      if (character === 1) {
        currentAnimation1 = animations.character1.stance; // 默認返回角色1的站立
        isAnimating1 = false;
      } else {
        currentAnimation2 = animations.character2.stance; // 默認返回角色2的站立
        isAnimating2 = false;
      }
    }
  }
}

function drawHealthBars() {
  // 繪製角色1的血量條
  fill(255, 0, 0);
  rect(characterX1 + width / 2 - 50, characterY1 + height / 2 - 80, 100, 20); // 背景
  fill(0, 255, 0);
  rect(characterX1 + width / 2 - 50, characterY1 + height / 2 - 80, health1, 20); // 當前血量
  fill(0); // 黑色文字
  textSize(20);
  textAlign(CENTER); // 文字居中
  text("角色一", characterX1 + width / 2, characterY1 + height / 2 - 90); // 角色1標籤

  // 繪製角色2的血量條
  fill(255, 0, 0);
  rect(characterX2 + width / 2 - 50, characterY2 + height / 2 - 80, 100, 20); // 背景
  fill(0, 255, 0);
  rect(characterX2 + width / 2 - 50, characterY2 + height / 2 - 80, health2, 20); // 當前血量
  fill(0); // 黑色文字
  textSize(20);
  textAlign(CENTER); // 文字居中
  text("角色二", characterX2 + width / 2, characterY2 + height / 2 - 90); // 角色2標籤
}



function keyPressed() {
  // 如果遊戲結束，按下 R 鍵重製
  if (gameOver && key === 'r') {
    resetGame();
    return;
  }

  // 角色1控制
  if (keyCode === UP_ARROW && !isJumping1) {
    velocityY1 = JUMP_FORCE;
    isJumping1 = true;
    currentAnimation1 = animations.character1.jump;
    currentAnimation1.frameIndex = 0;
    isAnimating1 = true;
  } else if (keyCode === DOWN_ARROW && !isAnimating1 && !isJumping1) {
    currentAnimation1 = animations.character1.explotion;
    currentAnimation1.frameIndex = 0;
    isAnimating1 = true;
    recoverHealth(1); // 角色1爆氣時回復血量
  } else if (key === '1' && !isAnimating1) {
    currentAnimation1 = animations.character1.attack1;
    currentAnimation1.frameIndex = 0;
    isAnimating1 = true;
    let effectX = characterX1 + (facingRight1 ? 100 : -100);
    attackEffects.push(new AttackEffect(effectX, characterY1, facingRight1, 1));
  } else if (key === '2' && !isAnimating1) {
    currentAnimation1 = animations.character1.attack2;
    currentAnimation1.frameIndex = 0;
    isAnimating1 = true;
    characterX1 += (facingRight1 ? moveDistance : -moveDistance); // 根據角色朝向移動
  }

  // 角色2控制
  if (key === 'w' && !isJumping2) {
    velocityY2 = JUMP_FORCE;
    isJumping2 = true;
    currentAnimation2 = animations.character2.jump;
    currentAnimation2.frameIndex = 0;
    isAnimating2 = true;
  } else if (key === 's' && !isAnimating2 && !isJumping2) {
    currentAnimation2 = animations.character2.explotion;
    currentAnimation2.frameIndex = 0;
    isAnimating2 = true;
    recoverHealth(2); // 角色2爆氣時回復血量
  } else if (key === 'j' && !isAnimating2) {
    currentAnimation2 = animations.character2.attack1;
    currentAnimation2.frameIndex = 0;
    isAnimating2 = true;
    let effectX = characterX2 + (facingRight2 ? 100 : -100);
    attackEffects.push(new AttackEffect(effectX, characterY2, facingRight2, 2));
  } else if (key === 'k' && !isAnimating2) {
    currentAnimation2 = animations.character2.attack2;
    currentAnimation2.frameIndex = 0;
    isAnimating2 = true;
    characterX2 += (facingRight2 ? moveDistance2 : -moveDistance2); // 根據角色朝向移動
  }

  // 控制角色1的移動
  if (keyCode === LEFT_ARROW) {
    facingRight1 = false;
    isRunning1 = true;
  } else if (keyCode === RIGHT_ARROW) {
    facingRight1 = true;
    isRunning1 = true;
  }

  // 控制角色2的移動
  if (key === 'a') {
    facingRight2 = false;
    isRunning2 = true;
  } else if (key === 'd') {
    facingRight2 = true;
    isRunning2 = true;
  }
}

function keyReleased() {
  // 停止角色1的移動
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    isRunning1 = false;
    currentAnimation1 = animations.character1.stance; // 返回站立動畫
  }

  // 停止角色2的移動
  if (key === 'a' || key === 'd') {
    isRunning2 = false;
    currentAnimation2 = animations.character2.stance; // 返回站立動畫
  }
}

function recoverHealth(character) {
  if (character === 1) {
    health1 = Math.min(health1 + 10, 100); // 角色1回復5滴血，最多不超過100
  } else if (character === 2) {
    health2 = Math.min(health2 + 10, 100); // 角色2回復5滴血，最多不超過100
  }
}

// 更新角色位置的函數
function updateCharacterPosition() {
  // 更新角色1的位置
  if (isRunning1) {
    characterX1 += facingRight1 ? MOVE_SPEED : -MOVE_SPEED;
  }
  // 更新角色1的Y軸位置
  characterY1 += velocityY1;
  velocityY1 += GRAVITY; // 應用重力

  // 更新角色2的位置
  if (isRunning2) {
    characterX2 += facingRight2 ? MOVE_SPEED : -MOVE_SPEED;
  }
  // 更新角色2的Y軸位置
  characterY2 += velocityY2;
  velocityY2 += GRAVITY; // 應用重力

  // 確保角色不會掉出地板
  if (characterY1 >= floorY) {
    characterY1 = floorY;
    isJumping1 = false;
  }
  if (characterY2 >= floorY) {
    characterY2 = floorY;
    isJumping2 = false;
  }
}



function resetGame() {
  health1 = 100;
  health2 = 100;
  characterX1 = -700;
  characterY1 = floorY - height / 2;
  characterX2 = 700;
  characterY2 = floorY - height / 2;
  isJumping1 = false;
  isJumping2 = false;
  isAnimating1 = false;
  isAnimating2 = false;
  isRunning1 = false;
  isRunning2 = false;
  gameOver = false;
  winner = '';
  currentAnimation1 = animations.character1.stance;
  currentAnimation2 = animations.character2.stance;
  attackEffects = []; // 清空攻擊特效
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  floorY = height - FLOOR_HEIGHT; // 更新地板位置
}

