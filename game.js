// Канвас и контекст
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Размеры канваса
canvas.width = 1200;
canvas.height = 800;

// Игрок
let player = {
	x: 100,
	y: 100,
	width: 30,
	height: 30,
	speed: 5,
	health: 100
};

// Враги
let enemies = [];

// Платформы
let platforms = [];

// Монеты
let coins = [];

// xp
let hearts = [];

// Пули
let bullets = [];

let score = 0;

let isDead = false;

// Флаги для клавиш
let keys = {
	ArrowUp: false,
	ArrowDown: false,
	ArrowLeft: false,
	ArrowRight: false,
	Space: false
};

// Уровень
let level = 1;

// Шрифт
ctx.font = '24px Open Sans';

// Градиентный фон
ctx.fillStyle = 'linear-gradient(to bottom, #333, #555)';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Цвета
platformColor = '#66cc00';
enemyColor = '#ff0000';
coinColor = '#ffff00';
bulletColor = '#ffffff';

// Тени и объемные эффекты
ctx.shadowColor = 'rgba(0, 0, 10, 0.5)';
ctx.shadowBlur = 10;

// Анимация
playerAnimation = {
	x: player.x,
	y: player.y,
	speed: 5
};

// Звуковые эффекты
shootSound = new Audio('shoot.mp3');
hitSound = new Audio('hit.mp3');
coinSound = new Audio('coin.mp3');
heartSound = new Audio('heart.mp3')

// Функция для генерации сердечек
function generateHearts() {
	if (level >= 15) {
		let numHearts = Math.floor(Math.random() * 3) + 1; // Генерируем от 1 до 3 сердечек
		for (let i = 0; i < numHearts; i++) {
			let heart = {
				x: Math.random() * (canvas.width - 20),
				y: Math.random() * (canvas.height - 20),
				width: 10,
				height: 10
			};
			hearts.push(heart);
		}
	}
}
function generateLevel(level) {
	// Очистка уровней
	platforms = [];
	enemies = [];
	coins = [];
	bullets = [];
	hearts = [];

	// Генерация платформ
	for (let i = 0; i < 10; i++) {
		let platformType = Math.random() < 0.5 ? 'tatic' : 'oving';
		let platform = {
			x: Math.random() * (canvas.width - 100),
			y: Math.random() * (canvas.height - 100),
			width: 100,
			height: 20,
			type: platformType
		};

		if (platformType === 'oving') {
			platform.speed = 2;
			platform.direction = Math.random() < 0.5 ? -1 : 1;
		}

		// Проверка на colision
		let isOverlapping = false;
		platforms.forEach(existingPlatform => {
			if (checkCollision(platform, existingPlatform)) {
				isOverlapping = true;
			}
		});

		if (!isOverlapping) {
			platforms.push(platform);
		}
	}

	// Генерация врагов
	let numEnemy = Math.floor(Math.random() * 15) + 1;
	for (let i = 0; i < numEnemy; i++) {
		let enemyType = Math.random() < 0.5 ? 'basic' : 'advanced';
		let enemy = {
			x: Math.random() * (canvas.width - 50),
			y: Math.random() * (canvas.height - 50),
			width: 20,
			height: 20,
			speed: 2,
			type: enemyType
		};

		if (enemyType === 'advanced') {
			enemy.speed = 4;
			enemy.shoots = true;
		}

		// Проверка, чтобы враг не генерировался слишком близко к игроку
		let distanceToPlayer = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
		while (distanceToPlayer < 55) { // 55 - радиус безопасности
			enemy.x = Math.random() * (canvas.width - 50);
			enemy.y = Math.random() * (canvas.height - 50);
			distanceToPlayer = Math.sqrt(Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2));
		}

		enemies.push(enemy);
	}

	// монетки
	let numCoins = Math.floor(Math.random() * 15) + 1;
	for (let i = 0; i < numCoins; i++) {
		let coin = {
			x: Math.random() * (canvas.width - 20),
			y: Math.random() * (canvas.height - 20),
			width: 10,
			height: 10
		};
		coins.push(coin);
	}
	generateHearts();
}
function updateEnemies() {
	enemies.forEach(enemy => {

		enemy.x += enemy.speed + (Math.random() * 2 - 1);

		// Проверка на столкновение с платформами
		platforms.forEach(platform => {
			if (checkCollision(enemy, platform)) {
				enemy.speed = -enemy.speed;
			}
		});

		// Проверка на выход за пределы канваса
		if (enemy.x + enemy.width > canvas.width || enemy.x < 0) {
			enemy.speed = -enemy.speed;
		}

		// Проверка на столкновение с игроком
		if (checkCollision(enemy, player)) {
			player.health -= 20;
			enemies.splice(enemies.indexOf(enemy), 1);
			hitSound.play();
		}
	});
}
// Функция обновления игрока
function updatePlayer() {
	if (keys.ArrowUp) {
		player.y -= player.speed;
		if (player.y < 0) {
			player.y = 0;
		}
	}
	if (keys.ArrowDown) {
		player.y += player.speed;
		if (player.y + player.height > canvas.height) {
			player.y = canvas.height - player.height;
		}
	}
	if (keys.ArrowLeft) {
		player.x -= player.speed;
		if (player.x < 0) {
			player.x = 0;
		}
	}
	if (keys.ArrowRight) {
		player.x += player.speed;
		if (player.x + player.width > canvas.width) {
			player.x = canvas.width - player.width;
		}
	}

	// Проверка столкновения с платформами
	platforms.forEach(platform => {
		if (checkCollision(player, platform)) {
			if (player.y + player.height > platform.y && player.y < platform.y + platform.height) {
				player.y = platform.y - player.height;
			}
		}
	});
}

// Функция обновления платформ
function updatePlatforms() {
	platforms.forEach(platform => {
		// Проверка коллизии с игроком
		if (checkCollision(player, platform)) {
			player.y = platform.y - player.height;
		}
	});
}

function showInterlevelScreen(text, buttonText, callback) {
	document.getElementById('interlevel-text').innerText = text;
	document.getElementById('interlevel-button').innerText = buttonText;
	document.getElementById('interlevel-screen').classList.add('show');
	document.getElementById('interlevel-button').addEventListener('click', () => {
		callback();
		document.getElementById('interlevel-screen').classList.remove('show');
	});
}

// Сохраняем состояние игры при обновлении страницы
window.addEventListener('beforeunload', () => {
	localStorage.setItem('level', level);
	localStorage.setItem('health', player.health);
	localStorage.setItem('score', score);
});

// Загружаем состояние игры при загрузке страницы
window.addEventListener('load', () => {
	level = localStorage.getItem('level') || 1;
	player.health = localStorage.getItem('health') || 100;
	score = localStorage.getItem('score') || 0;
});

function levelUp() {
	canvas.classList.add('fade-out');
	setTimeout(() => {
		canvas.classList.remove('fade-out');

		showInterlevelScreen(`You completed level ${level - 1}!`, 'Next Level', () => {
			canvas.classList.add('fade-in');
			setTimeout(() => {
				canvas.classList.remove('fade-in');
				level++;
				generateLevel(level);
			}, 2000);
		});
	}, 2000);
}

function gameOver() {
	canvas.classList.add('fade-out');
	setTimeout(() => {
		canvas.classList.remove('fade-out');
		showInterlevelScreen(`You died. Your score: ${score}`, 'Restart', () => {
			canvas.classList.add('fade-in');
			setTimeout(() => {
				canvas.classList.remove('fade-in');
				player.health = 100; // Reset player health
				level = 1; // Reset level to 1
				score = 0; // Reset score
				generateLevel(level); // Generate the first level again
			}, 2000);
		});
	}, 2000);
}
let allCoinsCollected = false;

// Функция обновления монет
function updateCoins() {
	coins.forEach(coin => {
		// player collision
		if (checkCollision(player, coin)) {
			score += 10;
			coins.splice(coins.indexOf(coin), 1);
			coinSound.play();
		}
	});
	// Проверка на сбор всех монет
	if (coins.length === 0 && !allCoinsCollected) {
		allCoinsCollected = true;
		levelUp();
	}
}
// Функция для обновления сердечек
function updateHearts() {
	hearts.forEach(heart => {
		// Проверка столкновения с игроком
		if (checkCollision(player, heart)) {
			player.health += Math.floor(Math.random() * 15) + 1; // Прибавляем от 1 до 15 хп игроку
			hearts.splice(hearts.indexOf(heart), 1);
			heartSound.play();
		}
	});
}


// Функция проверки коллизии
function checkCollision(obj1, obj2) {
	if (obj1.x + obj1.width > obj2.x &&
		obj1.x < obj2.x + obj2.width &&
		obj1.y + obj1.height > obj2.y &&
		obj1.y < obj2.y + obj2.height &&
		!obj1.canMoveThroughPlatforms) {
		return true;
	}
	return false;
}

// Функция рисования платформ
function drawPlatforms() {
	platforms.forEach(platform => {
		ctx.fillStyle = platformColor;
		ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
		ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
		ctx.shadowBlur = 10;
		ctx.fillRect(platform.x + 2, platform.y + 2, platform.width - 4, platform.height - 4);
	});
}

// Функция рисования игрока
function drawPlayer() {
	ctx.strokeStyle = 'black';
	ctx.lineWidth = 0;
	ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
	ctx.fillStyle = 'blue';
	ctx.fillRect(player.x, player.y, player.width, player.height);

	// Отображаем здоровье игрока
	ctx.font = '20px Arial';
	ctx.fillStyle = 'yellow';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'top';
	ctx.fillText(`Health: ${player.health}`, 10, 20);
}

// Функция рисования врагов
function drawEnemies() {
	enemies.forEach(enemy => {
		ctx.fillStyle = enemyColor;
		ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
		ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
		ctx.shadowBlur = 10;
		ctx.fillRect(enemy.x + 2, enemy.y + 2, enemy.width - 4, enemy.height - 4);
	});
}

// Функция для рисования сердечек
function drawHearts() {
	ctx.font = '25px Arial'; // Set a font that supports emojis
	ctx.fillStyle = 'red';
	hearts.forEach(heart => {
		ctx.fillText('♡', heart.x, heart.y); // Draw the heart symbo
	});
}
//coin render
function drawCoins() {
	ctx.font = '19px Arial'; // Set a font that supports symbols
	ctx.fillStyle = 'gold';
	coins.forEach(coin => {
		ctx.fillText('✪', coin.x, coin.y); // Draw the coin symbol
	});
}

let fps = 0;
let slowestObject = null;
let slowestTime = 0;


// Функция обновления игры
function update() {
  let startTime = performance.now();
  //if (player.health <= 0 &&!isDead) {
  //isDead = true;
  //gameOver();
  //}
  updatePlayer();
  let playerTime = performance.now() - startTime;
  if (playerTime > slowestTime) {
    slowestObject = 'Player';
    slowestTime = playerTime;
  }

  startTime = performance.now();
  updatePlatforms();
  let platformsTime = performance.now() - startTime;
  if (platformsTime > slowestTime) {
    slowestObject = 'Platforms';
    slowestTime = platformsTime;
  }

  startTime = performance.now();
  updateEnemies();
  let enemiesTime = performance.now() - startTime;
  if (enemiesTime > slowestTime) {
    slowestObject = 'Enemies';
    slowestTime = enemiesTime;
  }

  startTime = performance.now();
  updateCoins();
  let coinsTime = performance.now() - startTime;
  if (coinsTime > slowestTime) {
    slowestObject = 'Coins';
    slowestTime = coinsTime;
  }

  startTime = performance.now();
  updateHearts();
  let heartsTime = performance.now() - startTime;
  if (heartsTime > slowestTime) {
    slowestObject = 'Hearts';
    slowestTime = heartsTime;
  }
}

// Функция рисования игры
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatforms();
  drawPlayer();
  drawEnemies();
  drawCoins();
  drawHearts();
  // Отображаем уровень и очки
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`Level: ${level}`, 10, 40);
  ctx.fillText(`Score: ${score}`, 10, 60);

  // Отображаем FPS
  ctx.font = '17px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`FPS: ${Math.round(fps)}`, canvas.width - 10, 20);

  // Отображаем элемент, который тормозит игру
  ctx.font = '20px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`Slowest object: ${slowestObject}`, canvas.width - 10, 40);
}

function animate(timestamp) {
	fps = 1000 / (timestamp - animate.prevTimestamp);
	animate.prevTimestamp = timestamp;
	update();
	draw(); 
	requestAnimationFrame(animate); 
  }
   
  animate.prevTimestamp = performance.now(); // initialize prevTimestamp
  requestAnimationFrame(animate);
// Функция инициализации игры
function init() {
	gameOver()
	generateLevel();
	update();
	draw();
}

// Инициализация игры
init();

// Обработка событий
document.addEventListener('keydown', event => {
	if (event.key === 'ArrowUp') {
		keys.ArrowUp = true;
	}
	if (event.key === 'ArrowDown') {
		keys.ArrowDown = true;
	}
	if (event.key === 'ArrowLeft') {
		keys.ArrowLeft = true;
	}
	if (event.key === 'ArrowRight') {
		keys.ArrowRight = true;
	}
	if (event.key === ' ') {
		keys.Space = true;
	}
});

document.addEventListener('keyup', event => {
	if (event.key === 'ArrowUp') {
		keys.ArrowUp = false;
	}
	if (event.key === 'ArrowDown') {
		keys.ArrowDown = false;
	}
	if (event.key === 'ArrowLeft') {
		keys.ArrowLeft = false;
	}
	if (event.key === 'ArrowRight') {
		keys.ArrowRight = false;
	}
	if (event.key === ' ') {
		keys.Space = false;
	}
});

// Обновление игры
setInterval(() => {
	update();
	draw();
}, 16); // 16ms = 60fps

let consoleInput = document.getElementById('console-input');
let consoleOutput = document.getElementById('console-output');

consoleOutput.innerHTML += '<span class="console-prompt">➤</span> Type <code>help</code> to discover available commands<br>';

consoleInput.addEventListener('keypress', event => {
	if (event.key === 'Enter') {
		const command = consoleInput.value.trim();
		switch (command) {
			case '$hack god':
				player.health = 99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999;
				consoleOutput.innerHTML += `<span class="console-output">${command}</span><br>`;
				break;
			case '$hack level':
				level++;
				generateLevel(level);
				consoleOutput.innerHTML += `<span class="console-output">${command}</span><br>`;
				break;
			case '$hack score':
				score += 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999;
				consoleOutput.innerHTML += `<span class="console-output">${command}</span><br>`;
				break;
			case '$clear':
				consoleInput.value = '';
				consoleOutput.innerHTML = '<span class="console-prompt">$</span> Type <code>help</code> to discover available commands<br>';
				break;
			case '$hack noclip':
				player.canMoveThroughPlatforms = true;
				consoleOutput.innerHTML += `<span class="console-output">${command}</span><br>`;
				break;
			case '$hack invincibility':
				player.invincible = true;
				consoleOutput.innerHTML += `<span class="console-output">${command}</span><br>`;
				break;
			case '$hack speed':
				player.speed = 20;
				consoleOutput.innerHTML += `<span class="console-output">${command}</span><br>`;
				break;
			case 'help':
				consoleOutput.innerHTML += `<span class="console-output">Available commands:</span><br>`;
				consoleOutput.innerHTML += `<span class="console-output">$hack godmode - god mode</span><br>`;
				consoleOutput.innerHTML += `<span class="console-output">$hack level - next level</span><br>`;
				consoleOutput.innerHTML += `<span class="console-output">$hack score- add a lot of points</span><br>`;
				consoleOutput.innerHTML += `<span class="console-output">$clear - clear console</span><br>`;
				consoleOutput.innerHTML += `<span class="console-output">$hack noclip - no clipping</span><br>`;
				consoleOutput.innerHTML += `<span class="console-output">$hack invincibility - invincibility</span><br>`;
				consoleOutput.innerHTML += `<span class="console-output">$hack speed - speed </span><br>`;
				break;
			case 'credits':
				consoleOutput.innerHTML += `<span class="console-output">Game developers:</span><br>`;
				consoleOutput.innerHTML += `<span class="console-output">FearOfRevenge - coder</span><br>`;
				break;
			case 'version':
				consoleOutput.innerHTML += `<span class="console-output">Game version: 1.0.0</span><br>`;
				break;
			case '$debug uplevel':
				levelUp();
				consoleOutput.innerHTML += `<span class="console-output">${command}</span><br>`;
				break;
			default:
				if (command !== '') {
					consoleOutput.innerHTML += `<span class="console-warning"><strong>[⚠️]</strong> Unknown command: ${command}</span><br>`;
				} else {
					consoleOutput.innerHTML += `<span class="console-error"><strong>[❌]</strong> Command cannot be empty.</span><br>`;
				}
				break;
		}
	}
});

let console = document.getElementById('console');
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

console.addEventListener('mousedown', (event) => {
	isDragging = true;
	offsetX = event.clientX - console.offsetLeft;
	offsetY = event.clientY - console.offsetTop;
});

document.addEventListener('mousemove', (event) => {
	if (isDragging) {
		console.style.left = `${event.clientX - offsetX}px`;
		console.style.top = `${event.clientY - offsetY}px`;
	}
});

document.addEventListener('mouseup', () => {
	isDragging = false;
});
