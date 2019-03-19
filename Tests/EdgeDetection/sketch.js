graphics = {
    lines: [],
    points: [],
    walls: [],
    caves: []
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
            line(last.x*blockSize,
                 last.y*blockSize,
                 edges[i][edges[i].length-1].x*blockSize,
                 edges[i][edges[i].length-1].y*blockSize);
        for(var j = 0; j < edges[i].length; j++)
        {
            try{
                line(last.x*blockSize,
                     last.y*blockSize,
                     edges[i][j].x*blockSize,
                     edges[i][j].y*blockSize);
            }
            catch(e){
                throw e;
            }
            last = edges[i][j];
        }
    }

    stroke(0, 255, 0);
    var caves = graphics.caves;
    for(var i = 0; i < caves.length; i++)
    {
        var last = caves[i].entrance[0];
        if(last)
            line(
                last.x*blockSize,
                last.y*blockSize,
                caves[i].entrance[caves[i].entrance.length-1].x*blockSize,
                caves[i].entrance[caves[i].entrance.length-1].y*blockSize
            );
        for(var j = 0; j < caves[i].entrance.length; j++)
        {
            try{
                line(
                    last.x*blockSize,
                    last.y*blockSize,
                    caves[i].entrance[j].x*blockSize,
                    caves[i].entrance[j].y*blockSize
                );
            }
            catch(e){
                throw e;
            }
            last = caves[i].entrance[j];
        }
    }
    pop();
}
