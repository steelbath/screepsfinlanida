graphics = {
    lines: [],
    points: [],
    walls: []
}
blockSize = 18;
offset = blockSize / 2;

var init = false;

function setup() {
    createCanvas(blockSize * 50,blockSize * 50);
}

function draw() {
    background(130);
    if(!init)
    {
        // Run tests - Running tests here allows drawing graphic during tests
        new TestEdgeDetection();
        init = true;
    }
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
                rect(x*blockSize, y*blockSize, blockSize, blockSize);
        }
    }

    stroke(255);
    var edges = graphics.lines;
    for(var i = 0; i < edges.length; i++)
    {
        var last = edges[i][0];
        if(last)
            line(last[0]*blockSize,
                 last[1]*blockSize,
                 edges[i][edges[i].length-1][0]*blockSize,
                 edges[i][edges[i].length-1][1]*blockSize);
        for(var j = 0; j < edges[i].length; j++)
        {
            try{
                line(last[0]*blockSize,
                     last[1]*blockSize,
                     edges[i][j][0]*blockSize,
                     edges[i][j][1]*blockSize);
            }
            catch(e){
                throw e;
            }
            last = edges[i][j];
        }
    }
    pop();
}
