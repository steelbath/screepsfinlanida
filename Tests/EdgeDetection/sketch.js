// Set module to by pass NPM module exports which dont exist in testing context
module = {};
module.exports = {};

// Initialize screep Game placeholder
Game = {};
Game.cpu = {};
Game.cpu.getUsed = function(){return 0;}

graphics = {
    lines: [],
    points: []
}

function setup() {
    createCanvas(600,600);
}

function draw() {
    background(0);
    stroke(255);

    var edges = graphics.lines;
    var last = [];
    var offset = 50;
    for(var i = 0; i < edges.length; i++)
    {
        for(var j = 0; j < edges[i].length; j++)
        {
            try{
                line(offset + last[0]*10,
                     offset + last[1]*10,
                     offset + edges[i][j][0]*10,
                     offset + edges[i][j][1]*10);
            }
            catch(e){
                throw e;
            }
            last = edges[i][j];
        }
    }
}
