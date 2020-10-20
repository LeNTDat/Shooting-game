var canvas = document.getElementById('mygames');
var ctx = canvas.getContext("2d");
canvas.width = 700;
canvas.height = 500;

const SHIP_SIZE = 30;
const FPS = 60;
const TURN_SPEED = 360;
const SHIP_THRUST = 5; //accelerator 5 pixel
const FRICTION = 0.7; // HOLD UP BOYS
const DROIDS_NUM = 3;
const DROIDS_SPEED = 70;
const DROIDS_SIZE = 100;
const DROIDS_VERT = 10;
const DROIDS_JAGGED = 0.45;// ĐỘ NHỌN CỦA THIÊN THẠCH
const CIR_SHIP = false;
const CIR_ASTEROIDS = false;
const SHIP_EXPL_DUR = 0.3;
const SHIP_BLINK_DUR = 0.1;
const SHIP_INVISIBILITY_DUR = 3;
const AMMO_NUM = 10;
const AMMO_SPEED = 500;
const AMMO_DIST = 0.6; // KHOẢNG CÁCH ĐI ĐƯỢC CỦA ĐẠN SO VỚI canvas.width 
const TEXT_FADE_TIME = 2.5;
const LIVE = 1;
const S_SCORE = 30;
const M_SCORE = 10;
const L_SCORE = 5;

var text_alpha, level, text_level, lives, scores;
var best = 0;
var name = localStorage.getItem('name') || localStorage.setItem('name', "Guest");
function newGame() {
    level = 0;
    lives = LIVE;
    scores = 0;
    this.ammo = function () {
        newAmmo();
    }
    this.ammo();
    this.newShipgame = function () {
        newShip();
    }
    this.newShipgame();
    this.newLevel = function () {
        text_level = 'Level ' + (level + 1);
        text_alpha = 1.0;
        newAsteroids();
    }
    this.newLevel();
    this.gameOver = function () {
        best += scores;
        localStorage.setItem(name, best);
        ship.dead = true;
        text_level = 'Game Over';
        text_alpha = 1.0;
    }
}
newGame();
// ship
function newShip() {
    this.createShip = function () {
        ship = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            r: SHIP_SIZE / 2,
            a: 90 / 180 * Math.PI,
            rot: 0,
            explodingTime: 0,
            dead: false,
            canShoot: true,
            thrusting: false,
            blinkNum: Math.ceil(SHIP_INVISIBILITY_DUR / SHIP_BLINK_DUR),
            blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
            thrust: {
                x: 0,
                y: 0
            }
        }
        return ship;
    }
    this.createShip();
    this.drawShip = function (x, y, a) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = SHIP_SIZE / 20;
        ctx.beginPath();
        ctx.moveTo(
            // Nose
            x + 4 / 3 * ship.r * Math.cos(a),
            y - 4 / 3 * ship.r * Math.sin(a)
        );
        ctx.lineTo(
            // left
            x - ship.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
            y + ship.r * (2 / 3 * Math.sin(a) - Math.cos(a))
        );
        ctx.lineTo(
            // right
            x - ship.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
            y + ship.r * (2 / 3 * Math.sin(a) + Math.cos(a))
        );
        ctx.closePath();
        ctx.stroke();
    }
    this.explodeShip = function () {
        ship.explodingTime = Math.ceil(SHIP_EXPL_DUR * FPS);
    }
}
// Roids
function newAsteroids() {
    //Check distance
    this.checkDistance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    //create object asteroids
    this.create = function (x, y, r) {
        var faster = 1 + 0.1 * level;
        var roids = {
            x: x,
            y: y,
            xv: Math.random() * DROIDS_SPEED * faster / FPS * (Math.random() < 0.5 ? 1 : -1),
            yv: Math.random() * DROIDS_SPEED * faster / FPS * (Math.random() < 0.5 ? 1 : -1),
            r: r,
            a: Math.random() * Math.PI * 2,
            vert: Math.floor(Math.random() * (DROIDS_VERT + 1) + DROIDS_VERT / 2),
            offs: []
        }
        for (var i = 0; i < roids.vert; i++) {
            roids.offs.push(Math.random() * DROIDS_JAGGED * 2 + 1 - DROIDS_JAGGED);
        }
        return roids;
    }
    asteroids = [];
    //create array asteroids
    this.createRoids = function () {
        for (var i = 0; i < DROIDS_NUM + level; i++) {
            //find asteroid's( x ,y random )
            do {
                xroids = Math.floor(Math.random() * canvas.width);
                yroids = Math.floor(Math.random() * canvas.height);
            } while (this.checkDistance(ship.x, ship.y, xroids, yroids) < DROIDS_SIZE * 2 + ship.r)
            asteroids.push(this.create(xroids, yroids, Math.ceil(DROIDS_SIZE / 2)));
        }
        return asteroids;
    }
    this.createRoids();
    //create smaller asteroids and push it to array 
    this.destroyAsteroids = function (index) {
        var x = asteroids[index].x;
        var y = asteroids[index].y;
        var r = asteroids[index].r;
        if (r == Math.ceil(DROIDS_SIZE / 2)) {
            scores += L_SCORE;
            asteroids.push(this.create(x, y, Math.ceil(DROIDS_SIZE / 4)));
            asteroids.push(this.create(x, y, Math.ceil(DROIDS_SIZE / 4)));
        } else if (r == Math.ceil(DROIDS_SIZE / 4)) {
            scores += M_SCORE;
            asteroids.push(this.create(x, y, Math.ceil(DROIDS_SIZE / 8)));
            asteroids.push(this.create(x, y, Math.ceil(DROIDS_SIZE / 8)));
        } else {
            scores += S_SCORE;
        }
        //destroy asteroids 
        asteroids.splice(index, 1);

        //no more asteroids
        if (asteroids.length == 0) {
            level++;
            newLevel();
        }
    }

}
function newAmmo() {
    ammo = [];
    this.shootLaser = function () {
        if (ship.canShoot && ammo.length < AMMO_NUM) {
            ammo.push({
                x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                xv: AMMO_SPEED * Math.cos(ship.a) / FPS,
                yv: -AMMO_SPEED * Math.sin(ship.a) / FPS,
                dist: 0
            })
        }
    }
    return ammo;
}

//Keydown funtion 
document.addEventListener('keydown', keyDown = event => {
    if (ship.dead) {
        return;
    }
    switch (event.keyCode) {
        case 38:
            ship.thrusting = true;
            break;
        case 37:// turn left
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 39://turn right 
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 32:
            shootLaser();
            break;
    }
});
//Keyup funtion
document.addEventListener('keyup', keyUp = event => {
    if (ship.dead) {
        return;
    }
    switch (event.keyCode) {
        case 38:
            ship.thrusting = false;
            break;
        case 37://stop turn left
            ship.rot = 0;
            break;
        case 39://stop turn right 
            ship.rot = 0;
            break;
        case 32:
            ship.canShoot = true;
            break;
    }
});
var runGame = () => {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodingTime > 0;
    //space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //THRUST
    if (!exploding && !ship.dead) {
        if (blinkOn) {
            if (ship.thrusting) {
                ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
                ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
                // rocket 
                ctx.fillStyle = 'darkred';
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = SHIP_SIZE / 10;
                ctx.beginPath();
                ctx.moveTo(
                    // 
                    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.75 * Math.sin(ship.a)),
                    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.75 * Math.cos(ship.a))
                );
                ctx.lineTo(
                    // 
                    ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
                    ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
                );
                ctx.lineTo(
                    // 
                    ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.75 * Math.sin(ship.a)),
                    ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.75 * Math.cos(ship.a))
                );
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else {
                ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
                ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
            }
            //draw ship
            drawShip(ship.x, ship.y, ship.a);
            //circle around ship
            // if (CIR_SHIP) {
            //     ctx.strokeStyle = 'lime';
            //     ctx.beginPath();
            //     ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2)
            //     ctx.stroke();
            // }
        }
        if (ship.blinkNum > 0) {
            //reduce blink time
            ship.blinkTime--;
            //reduce blink num
            if (ship.blinkTime == 0 && !ship.dead) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS)
                ship.blinkNum--;
            }
        }
    } else {//explode animation
        ctx.fillStyle = 'darkred';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'orange';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    //asteroids create
    var x, y, r, a, vert, offs;
    for (var i = 0; i < asteroids.length; i++) {
        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = SHIP_SIZE / 20;
        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;
        offs = asteroids[i].offs;
        //draw asteroids
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );
        //
        for (var j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();
        //move asteroirds
        if (!exploding && !ship.dead) {
            asteroids[i].x += asteroids[i].xv;
            asteroids[i].y += asteroids[i].yv
        }

        //circle around asteroids
        // if (CIR_ASTEROIDS) {
        //     ctx.strokeStyle = 'lime';
        //     ctx.beginPath();
        //     ctx.arc(x, y, r, 0, Math.PI * 2)
        //     ctx.stroke();
        // }
    }
    //draw ammo
    for (var i = ammo.length - 1; i >= 0; i--) {
        // var i = 0; i < ammo.length; i++
        //draw 
        ctx.strokeStyle = 'red';
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(ammo[i].x, ammo[i].y, SHIP_SIZE / 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        //move ammo
        ammo[i].x += ammo[i].xv;
        ammo[i].y += ammo[i].yv;
        //calculate distance of ammo 
        ammo[i].dist += Math.sqrt(Math.pow(ammo[i].xv, 2) + Math.pow(ammo[i].yv, 2))
        //delete ammo
        if (ammo[i].dist > AMMO_DIST * canvas.width) {
            ammo.splice(i, 1);
            continue;
        }
        //out screen 
        if (ammo[i].x < 0) {
            ammo[i].x = canvas.width;
        } else if (ammo[i].x > canvas.width) {
            ammo[i].x = 0;
        }
        if (ammo[i].y < 0) {
            ammo[i].y = canvas.height;
        } else if (ammo[i].y > canvas.height) {
            ammo[i].y = 0;
        }
    }
    //detect hit asteroid and ammo
    for (var i = asteroids.length - 1; i >= 0; i--) {
        //get property asteroids and ammo
        let aX = asteroids[i].x;
        let aY = asteroids[i].y;
        let aR = asteroids[i].r;
        for (var j = ammo.length - 1; j >= 0; j--) {
            let amX = ammo[j].x;
            let amY = ammo[j].y;
            if (checkDistance(aX, aY, amX, amY) < aR) {
                //remove ammo
                ammo.splice(j, 1);
                //remove asteroid
                destroyAsteroids(i);
                break;
            }
        }
    }
    //draw text score
    ctx.fillStyle = "rgb(255,255,255 )";
    ctx.font = "30px Comic Sans MS";
    ctx.fillText('SCORE ' + scores, canvas.width - 100, canvas.height - 30);
    //draw level text
    if (text_alpha >= 0) {
        ctx.fillStyle = "rgba(255,255,255," + text_alpha + ")";
        ctx.font = "30px Comic Sans MS";
        ctx.textAlign = "center";
        ctx.fillText(text_level, canvas.width / 2, canvas.height * 3 / 4);
        text_alpha -= (1.0 / TEXT_FADE_TIME / FPS);
    }
    // draw lives
    for (var i = 0; i < lives; i++) {
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, Math.PI * 0.5)
    }
    // checck distance and reset game if u die
    if (!exploding && !ship.dead) {
        if (ship.blinkNum == 0) {
            for (var i = asteroids.length - 1; i >= 0; i--) {
                if (checkDistance(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                    explodeShip();
                    destroyAsteroids(i);
                    break;
                }
            }
        }
        //rotate
        ship.a += ship.rot
        //thrust 
        ship.x += ship.thrust.x
        ship.y += ship.thrust.y
    } else {
        ship.explodingTime--;
        if (ship.explodingTime == 0) {
            lives--;
            if (lives == 0) {
                gameOver();
            } else {
                newShipgame();
            }
        }
    }
    //handle ship out screen
    if (ship.x < 0) {
        ship.x = canvas.width;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0;
    }
    if (ship.y < 0 - ship.r)
        ship.y = canvas.height;
    else if (ship.y > canvas.height + ship.r)
        ship.y = 0;
    //handle asteroids out screen
    for (var i = 0; i < asteroids.length; i++) {
        if (asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canvas.width + asteroids[i].r;
        } else if (asteroids[i].x > canvas.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r;
        }
        if (asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canvas.height + asteroids[i].r;
        } else if (asteroids[i].y > canvas.height + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r;
        }
    }
}
setInterval(runGame, 1000 / FPS)//loop runGame

