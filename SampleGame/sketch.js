//images to be stored in these variables
var player;
var noImage;

//floor
var ground;
var ceiling;

//colliders so objects that go off screen get deleted
var leftSideScreen;
var rightSideScreen;

//declare group vars
var obstacles;
var nos;
var clocks;

// how often do i want to spawn?
var spawnObstacleInterval = 500; //half second
var lastSpawnTime1;	//track the last time spawn happened
var spawnBulletsInterval = 400;	//fraction of a second
var lastSpawnTime2;	//track the last time spawn happened

//global vars
var GRAVITY = 1;
var JUMP = 15;

//score
var score = 0;
var endingScore = 0;

//game over?
var gameOver = false;

//fonts
var menu;
var font1;

function preload() {
	//create a player sprite
	player = createSprite();
	//give him a couple animation
	player.addAnimation("running", "assets/player0.png", "assets/player1.png");
	player.addAnimation("jumping", "assets/pjump.png");
	//he runs too fast so put 6 frames between each image in sprite animation
	player.animation.frameDelay = 6;

	menu = loadFont('assets/lazy.ttf');
	font1 = loadFont('assets/whim.ttf');
}

function setup() {
	createCanvas(windowWidth, windowHeight);

	// adjust player position
	player.position.x = width/4;
	player.position.y = height-50;

	noImage = loadImage("assets/no.png");
	//create sprite for floor
	ground = createSprite(width/2, height-10, width, 10);
	ceiling = createSprite(width/2, -10, width, 10);

	//obstacles, clocks and nos are collections
	obstacles = new Group();
	clocks = new Group();
	nos = new Group();

	//if objects hit left side screen delete object
	leftSideScreen = createSprite(-10, height/2, 10, height);
	//if bullets hit right side screen delete object
	rightSideScreen = createSprite(width+20, height/2, 10, height);

	// start counting from this moment (for spawns)
	lastSpawnTime1 = millis();
	lastSpawnTime2 = millis();
}

function draw() {
	background(random(90,255),0,0);

	// did the game end?
	if(gameOver) {
		background(0);
		fill(255,255,0);
		textFont(menu);
		textSize(72);
		textAlign(CENTER);
		text("GAME OVER", width/2, height/2);
		textFont(font1);
		textSize(24);
		text("You lasted " + endingScore + " seconds", width/2, height/2 + 50);
	} 
	else {
		// game state

		// score is how long you live
		score = millis()/1000;

		// show score in yellow
		fill(255,255,0);
		textFont(font1);
		textSize(18);
		text("You have survived for " + int(score) + " seconds", 10, 30);

		// gravity push down!
		player.velocity.y += GRAVITY;

		//jumping
		if (keyWentDown(" ") || mouseWentDown(LEFT)) {
			player.changeAnimation("jumping");
			player.velocity.y = -JUMP;
		}

		//did player collide with the ground or ceiling?
		if (player.collide(ground)) {
			player.changeAnimation("running");
			player.velocity.y = 0;
		}
		if (player.collide(ceiling)) {
			player.velocity.y += 10;
		}

		//spawn obstacles logic
		if(millis()>lastSpawnTime1+spawnObstacleInterval) {
			//spawn new obstacle
			var newSprite = createSprite(width, random(height-50,height-70), 120, 105);

			//set the bounding box
			newSprite.setCollider("rectangle", 0, 0, 120, 105);
			newSprite.addAnimation("normal","assets/monster.png");
			//give a negative speed to go from right to left
			newSprite.velocity.x = random(-3,-7);

			//add to the obstacles group
			obstacles.add(newSprite);

			//reset
			lastSpawnTime1 = millis();
		}

		//spawn enemy logic
		if(millis()>lastSpawnTime2+spawnBulletsInterval) {
			//spawn new enemy
			var newEnemy = createSprite(width, random(20,height-20), 55, 59);

			//set the bounding box
			newEnemy.setCollider("rectangle", 0, 0, 55, 59);
			newEnemy.addAnimation("normal","assets/time.png");
			newEnemy.attractionPoint(random(1,4), player.position.x, player.position.y);
			//give a negative speed to go from right to left
			newEnemy.velocity.x = -8;

			//add it to the clocks group
			clocks.add(newEnemy);

			//reset
			lastSpawnTime2 = millis();
		}

		// shooting logic
		if(keyWentDown("x")&&nos.length<3){
		    var yell = createSprite(player.position.x+20, player.position.y);
		    yell.addImage(noImage);
		    yell.setSpeed(15, 360);
		    nos.add(yell);
		}

		// if player overlaps with anything get hit
		player.overlap(obstacles, hit);
		player.overlap(clocks, hit);

		//if nos overlaps with anything destroy nos and object collided with
		nos.overlap(obstacles, destroy);
		nos.overlap(clocks, destroy);

		//if obstacles hit left side of screen...
		leftSideScreen.overlap(obstacles, deleteObstacle);
		leftSideScreen.overlap(clocks, deleteObstacle);
		//if nos hit right side of screen...
		rightSideScreen.overlap(nos, deleteObstacle);

		//update all sprite objects
		drawSprites();

		//menu
		textFont(menu);
		textSize(42);
		textAlign(RIGHT);
		text("Time Catches Up", width-40, height-40);
		textFont(font1);
		textSize(18);
		textAlign(CENTER);
		text("Press X to shoot. Press SPACE to jump.", width-150, height-20);
	}
}

//collision
function hit(collider1, collider2) {
	//game over!
	gameOver = true;

	//set score in stone
	endingScore = int(score);
}

// delete objects that go off left side of screen
function deleteObstacle(col1, col2) {
	col2.remove();
}
// delete objects that collided
function destroy(col1, col2) {
	col1.remove();
	col2.remove();
}