// Set module to by pass NPM module exports which dont exist in testing context
module = {};
module.exports = {};

// Initialize screep Game placeholder
Game = {};
Game.cpu = {};
Game.cpu.getUsed = function(){return 0;}

graphics = {
    lines: [],
    points: [],
    walls: []
}
offset = 5;

function setup() {
    createCanvas(500,500);
}

function draw() {
    background(130);
    push();
    translate(offset, offset);

    stroke(0);
    fill(70);
    rectMode(CENTER);
    for(var x = 0; x < graphics.walls.length; x++)
    {
        for(var y = 0; y < graphics.walls[x].length; y++)
        {
            if(graphics.walls[x][y])
                rect(x*10, y*10, 10, 10);
        }
    }

    stroke(255);
    var edges = graphics.lines;
    var last = [];
    for(var i = 0; i < edges.length; i++)
    {
        for(var j = 0; j < edges[i].length; j++)
        {
            try{
                line(last[0]*10,
                     last[1]*10,
                     edges[i][j][0]*10,
                     edges[i][j][1]*10);
            }
            catch(e){
                throw e;
            }
            last = edges[i][j];
        }
    }
    pop();
}
