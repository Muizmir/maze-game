
const { Engine, Render, Runner, World, Bodies, Body, Events, MouseConstraint, Mouse } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 15;
const cellsVertical = 10;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine)

World.add(world, MouseConstraint.create(engine, {
    mouse: Mouse.create(render.Canvas)
}))

//walls

const walls = [
    Bodies.rectangle(width / 2, 0, width, 5, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 5, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 5, height, { isStatic: true }),
]

World.add(world, walls);

// for(let i=0; i < 40; i++){
//     if(Math.random() > 0.5){
//         World.add(world, Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50));
//     }else{
//         World.add(world, Bodies.circle(Math.random() * width, Math.random() * height, 30));
//     }
// }

//generate maze

const shuffle = arr => {
    let counter = arr.length;

    while(counter > 0){
        const index = Math.floor(Math.random() * counter)
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }

    return arr;
}

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const navigateCells = (row, column) => {
    // if visited, return true
    if(grid[row][column]){
        return true;
    }

    //if not, mark as visited
    grid[row][column] = true

    //assemble and randomise the neighbours
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ])

    //check each neighbour
    for(let neighbour of neighbours){
        const [nextRow, nextColumn, direction] = neighbour;

        //invalid neigbour coordinates
        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
            continue;
        }

        //already visited
        if(grid[nextRow][nextColumn]){
            continue;
        }

        //delete a wall
        if(direction === 'left'){
            verticals[row][column - 1] = true;
        } else if(direction === 'right'){
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        navigateCells(nextRow, nextColumn)
    }
}

navigateCells(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open){
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            10,
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'red'
                }
            }
        )

        World.add(world, wall);
    })
})

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            10,
            unitLengthY,
            {
                isStatic: true,
                label: 'wall',
                render: {
                    fillStyle: 'red'
                }
            }
        )

        World.add(world, wall);
    })
})

//goal

const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'green'
        }
    }
)

World.add(world, goal);

//ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2,ballRadius, { label: 'ball' });
World.add(world, ball);

//movements of ball

document.addEventListener('keydown', e => {
    const { x, y } = ball.velocity;

    if(e.keyCode === 38){
        Body.setVelocity(ball, { x, y : y - 5 });
    }
    if (e.keyCode === 39) {
        Body.setVelocity(ball, { x : x + 5, y: y });
    }
    if (e.keyCode === 40) {
        Body.setVelocity(ball, { x, y: y + 5 });
    }
    if (e.keyCode === 37) {
        Body.setVelocity(ball, { x : x - 5, y });
    }
})

// win

Events.on(engine, 'collisionStart', e => {
    e.pairs.forEach(collision => {
        const labels = ['goal', 'ball'];

        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if(body.label === 'wall'){
                    Body.setStatic(body, false);
                }
            })
        }

    })
})





