var canvas = document.getElementById('mygames');
var ctx = canvas.getContext("2d");
canvas.width = 700;
canvas.height = 500;

const SHIP_SIZE = 30;
const FPS = 60;
const TURN_SPEED = 360;
const SHIP_THRUST = 5; //accelerator 5 pixel
const FRICTION = 0.7; // HOLD UP BOYS

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

        //fire from rocket 
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

setInterval(runGame, 1000 / FPS)
