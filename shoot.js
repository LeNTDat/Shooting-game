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
const DROIDS_JAGGED = 0.45;
// ship Property
var ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI,
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}
// Roids
function newAsteroids(size, num, speed, fps, vert, xShip, jag) {
    this.create = function () {
        do {
            xroids = Math.floor(Math.random() * canvas.width);
            yroids = Math.floor(Math.random() * canvas.height)
        } while (this.checkDistance(xShip.x, xShip.y, xroids, yroids) < size * 2 + xShip.r)
        var roids = {
            x: xroids,
            y: yroids,
            xv: Math.random() * speed / fps * (Math.random() < 0.5 ? 1 : -1),
            yv: Math.random() * speed / fps * (Math.random() < 0.5 ? 1 : -1),
            r: size / 2,
            a: Math.random() * Math.PI * 2,
            vert: Math.floor(Math.random() * (vert + 1) + vert / 2),
            offs: []
        }
        for (var i = 0; i < roids.vert; i++) {
            roids.offs.push(Math.random() * jag * 2 + 1 - jag);
        }
        return roids
    }
    this.checkDistance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    this.createRoids = function () {
        asteroids = [];
        for (var i = 0; i < num; i++) {
            asteroids.push(this.create());
        }
        return asteroids;
    }
    this.createRoids();
}
//call newAsteroids 
newAsteroids(DROIDS_SIZE, DROIDS_NUM, DROIDS_SPEED, FPS, DROIDS_VERT, ship, DROIDS_JAGGED);
//Keydown funtion 
document.addEventListener('keydown', keyDown = event => {
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
        // case 32:
        // break;
    }
});
//Keyup funtion
document.addEventListener('keyup', keyUp = event => {
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
        // case 32:
        // break;
    }
});
var runGame = () => {
    //space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //THRUST
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
    ctx.strokeStyle = 'white';
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
        // Nose
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo(
        // left
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo(
        // right
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();
    //asteroids create
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = SHIP_SIZE / 20;
    for (var i = 0; i < asteroids.length; i++) {
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
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv
        //handle asteroids
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
    //rotate
    ship.a += ship.rot
    //center ship
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, 1, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
    //thrust 
    ship.x += ship.thrust.x
    ship.y += ship.thrust.y
    //out screen
    if (ship.x < 0) {
        ship.x = canvas.width;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0;
    }
    if (ship.y < 0 - ship.r)
        ship.y = canvas.height;
    else if (ship.y > canvas.height + ship.r)
        ship.y = 0;
}
setInterval(runGame, 1000 / FPS)//loop runGame
