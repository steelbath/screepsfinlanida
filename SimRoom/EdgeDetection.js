module.exports.loop = function () {

    for (var key in Game.rooms)
    {
        update(Game.rooms[key]);
    }
}


function getWallMap(room)
{
    let results = room.lookAtArea(0, 0, 49, 49, false);
    let walls = [];
    let emptyArr = [];
    console.log(Game.cpu.getUsed());
    for(var y = 0; y < 50; y++)
    {
        walls.push([]);
        emptyArr.push([]);
        for(var x = 0; x < 50; x++)
        {
            let data = results[x][y][0];
            if(data.type === "terrain" && data.terrain === "wall")
                walls[y].push(true);
            else
                walls[y].push(false);
            emptyArr.push([]);
        }
    }
    return [walls, emptyArr];
}

// North, East, South, West
var n = true,
    e = true,
    s = true,
    w = true,
    lastDir = null,
    checked = [],
    currentEdges = [];
var directions = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];
var dirMap = {
    s: 0,
    sw: 1,
    w: 2,
    nw: 3,
    n: 4,
    ne: 5,
    e: 6,
    se: 7
}
var angleMap = {
    s: 180,
    sw: 225,
    w: 270,
    nw: 315,
    n: 0,
    ne: 45,
    e: 90,
    se: 135
};

function getPossibleDirections(x, y)
{
    n = true;
    e = true;
    s = true;
    w = true;

    if(x === 0) w = false;
    if(y === 0) n = false;
    if(x === 49) e = false;
    if(y === 49) s = false;
}

function checkWallAt(walls, x, y, direction)
{
    let returnDataAt = function(xOff, yOff){
        return [
            walls[x+xOff][y+yOff],
            {x: x+xOff, y: y+yOff}
        ];
    }
    try{
        switch(direction)
        {
            case 'n':
                return returnDataAt(0, -1);
            case 'e':
                return returnDataAt(+1, 0);
            case 's':
                return returnDataAt(0, +1);
            case 'w':
                return returnDataAt(-1, 0);
            case 'ne':
                if(!returnDataAt(+1, 0)[0] && !returnDataAt(0, -1)[0])
                    return [false];
                return returnDataAt(+1, -1);
            case 'nw':
                if(!returnDataAt(-1, 0)[0] && !returnDataAt(0, -1)[0])
                    return [false];
                return returnDataAt(-1, -1);
            case 'se':
                if(!returnDataAt(+1, 0)[0] && !returnDataAt(0, +1)[0])
                    return [false];
                return returnDataAt(+1, +1);
            case 'sw':
                if(!returnDataAt(-1, 0)[0] && !returnDataAt(0, +1)[0])
                    return [false];
                return returnDataAt(-1, +1);
            default:
                console.log("ran default");
                return [false];
        }
    }
    catch(e){
        return [false];
    }
}

function getNextEdgePart(walls, x, y)
{
    var foundResp, foundDir, resp;
    var hasFound = false

    var startDir = dirMap[lastDir] || 0;
    var i = startDir;
    for(var cnt = 0; cnt < 3; i++, cnt++)
    {
        // Try to turn 2 steps Clock Wise
        if(i === directions.length)
            i = 0;
        resp = checkWallAt(walls, x, y, directions[i]);

        if(resp[0])
        {
            hasFound = true;
            foundResp = resp[1];
            foundDir = directions[i];
            if(currentEdges[0].x == resp[1].x && currentEdges[0].y == resp[1].y)
            {
                foundResp.angle = angleMap[directions[i]];
                return foundResp;
            }
        }
    }
    if(hasFound)
    {
        lastDir = foundDir;
        foundResp.angle = angleMap[lastDir];
        return foundResp;
    }

    i = startDir - 1;
    for(var cnt = 0; cnt < 8; i--, cnt++)
    {
        // If nothing found from CW, turn CCW until land found
        if(i === -1)
            i = directions.length -1;
        resp = checkWallAt(walls, x, y, directions[i]);
        if(resp[0])
        {
            checked[resp[1].x][resp[1].y] = true;
            lastDir = directions[i];
            resp[1].angle = angleMap[lastDir];
            return resp[1];
        }
    }
    return null;
}

function checkWallSurrounding(walls, x, y)
{
    // Return true if this wall part has possibility to continue edge
    if(!walls[x][y])
        return false;

    // Check corners
    if(n && w && !walls[x-1][y-1] && walls[x-1][y] && walls[x][y-1] && checked[x-1][y] && checked[x][y-1]  // NW
    || n && e && !walls[x+1][y-1] && walls[x+1][y] && walls[x][y-1] && checked[x+1][y] && checked[x][y-1]  // NE
    || s && e && !walls[x+1][y+1] && walls[x+1][y] && walls[x][y+1] && checked[x+1][y] && checked[x][y+1]  // SE
    || s && w && !walls[x-1][y+1] && walls[x-1][y] && walls[x][y+1] && checked[x-1][y] && checked[x][y+1]) // SW
        return false;

    // Is surrounded by walls?
    if((!w || walls[x-1][y] && !n || walls[x-1][y-1] && !s || walls[x-1][y+1])
    && (!e || walls[x+1][y] && !n || walls[x+1][y-1] && !s || walls[x+1][y+1])
    && (!n || walls[x][y-1] && !s || walls[x][y+1]))
        return false;

    // Has atleast some wall around where to continue?
    if(n && walls[x][y-1]
    || e && walls[x+1][y]
    || s && walls[x][y+1]
    || w && walls[x-1][y])
        return true;
    return false;
}

function getWallEdges(wallData)
{
    var walls = wallData[0];
    checked = wallData[1];
    console.log(Game.cpu.getUsed());
    var edges = [];
    lastDir = null;

    for(var y = 0; y < 50; y++)
    {
        for(var x = 0; x < 50; x++)
        {
            if(walls[x][y] && !checked[x][y])
            {
                getPossibleDirections(x, y);
                if(checkWallSurrounding(walls, x, y, lastDir))
                {
                    currentEdges = [{x, y}];
                    lastDir = "s";
                    var edgePart = null;
                    var finderX = x;
                    var finderY = y;
                    while((edgePart = getNextEdgePart(walls, finderX, finderY)))
                    {
                        finderX = edgePart.x;
                        finderY = edgePart.y;
                        checked[finderX][finderY] = true;
                        if(currentEdges[0].x == finderX && currentEdges[0].y == finderY)
                        {
                            currentEdges[0].angle = edgePart.angle; // Add angle to first item in arr
                            break;
                        }
                        currentEdges.push(edgePart);
                    }
                    edges.push(currentEdges);
                }
            }
            checked[x][y] = true;
        }
    }
    return edges;
}

/* Cave finder code */

/*
    Cave specific algorithm, compares if first (base angle) is still pointing
    outwards compared to second angle
*/
function compareBiggerAngle(a1, a2)
{
    if(a2 < a1 || (a2 + 180) % 360 > a1)
        return true;
    return false;
}

/*
    Note: Doesn't use square root for correct results - just to save cpu
*/
function calcDistance(from, to)
{
    var deltaV = {
        x: from.x - to.x,
        y: from.y - to.y
    }
    return (deltaV.x*deltaV.x + deltaV.y*deltaV.y)
}

/*
    Return true and first hit point if wall found
    Ignores the given start and end points

    @returns: hit <bool>, if no collision: traversed cells - else wall that was hit
*/
function rayTestGrid(from, to, walls)
{
    var deltaX = from.x - to.x;
    var deltaY = from.y - to.y;
    var steps = deltaX > deltaY ? deltaX : deltaY;
    var stepX = deltaX / steps;
    var stepY = deltaY / steps;
    var cells = [];

    // Could maybe double the steps by halving step size to get 99.999% time all grid cells
    // if done, needs also small shift of 0,0001 to half steps to avoid floating point errors
    for(var i = 1; i < steps - 1; i++)
    {
        let gridX = Math.floor(from.x + stepX * i);
        let gridY = Math.floor(from.y + stepY * i);
        if(walls[gridX][gridY])
            return {hit: true, wall: {x: gridX, y: gridY}};
        cells.push({x: gridX, y: gridY});
    }
    return {hit: false, cells: cells};
}

function getCaverns(edges, walls, entranceSizeTreshold=100)
{
    var caves = [];

    for(var index = 0; index < edges.length; index++)
    {
        var edgeParts = edges[index];
        // Loop through all the edge pieces in order to find caves
        for(var i = 0; i < edgeParts.length; i++)
        {
            let nextIndex = i + 1;
            if(nextIndex == edgeParts.length)
                nextIndex = 0;
            let edge = edgeParts[i];
            let next = edgeParts[nextIndex];

            // If path takes a dip towards center of island (or simply curves around)
            if(compareBiggerAngle(edge.angle, next.angle))
            {
                let caveStart = {
                    edge: edge,
                    index: i
                };
                let caveEnd = {
                    edge: null,
                    index: 0
                };
                let entranceFound = false;
                let stepsTaken = 0;
                let foundAt = -1;
                let entrance = [];

                // Loop maximum of half the island finding cave ending
                // Shouldn't be possible to cave extending farther than that
                for(var j = i; stepsTaken < edgeParts.length / 2; j++, stepsTaken++)
                {
                    if(j == edgeParts.length)
                        j = 0;
                    let caveEdge = edgeParts[j];
                    let rayResult;

                    if(!compareBiggerAngle(edge.angle, caveEdge.angle)          // Test if the cave edge angle is pointing outwards
                    && calcDistance(edge, caveEdge) <= entranceSizeTreshold     // Test distance between blocks is within treshold
                                                                                // MISSING - Test that angle between points is on island side
                    && !(rayResult = rayTestGrid(edge, caveEdge, walls)).hit)   // Test that there is clear line between caveStart and caveEdge
                    {
                        entrance = rayResult.cells;
                        entranceFound = true;
                        foundAt = stepsTaken;
                        caveEnd.edge = caveEdge;
                        caveEnd.index = j;
                    }

                    if(entranceFound && stepsTaken > foundAt + 20)
                        break;
                }

                if(entranceFound)
                {
                    caves.push({
                        start: caveStart,
                        end: caveEnd,
                        entrance: entrance
                    });
                }
            }
        }
    }

    return caves;
}

function getColorByAngle(angle)
{
    var colors = {
        "0": "red",
        "45": "orange",
        "90": "gold",
        "135": "cyan",
        "180": "blue",
        "225": "purple",
        "270": "green",
        "315": "brown",
    }
    return colors[angle];
}

function update(room)
{
    var data = getWallMap(room);
    var edges = getWallEdges(data);
    var caves = getCaverns(edges, data[0]);

    // Default
    for(var i = 0; i < edges.length; i++)
    {
        var last = edges[i][0];
        if(last)
            room.visual.line(last.x, last.y, edges[i][edges[i].length-1].x, edges[i][edges[i].length-1].y);
        for(var j = 0; j < edges[i].length; j++)
        {
            try{
                room.visual.line(last.x, last.y, edges[i][j].x, edges[i][j].y, {color: getColorByAngle(edges[i][j].angle)});
            }
            catch(e){
                throw e;
            }
            last = edges[i][j];
        }
    }

    for(var i = 0; i < caves.length; i++)
    {
        var last = caves[i].entrance[0];
        if(last)
            room.visual.line(last.x, last.y, caves[i].entrance[caves[i].entrance.length-1].x, caves[i].entrance[caves[i].entrance.length-1].y);
        for(var j = 0; j < caves[i].entrance.length; j++)
        {
            try{
                room.visual.line(last.x, last.y, caves[i].entrance[j].x, caves[i].entrance[j].y);
            }
            catch(e){
                throw e;
            }
            last = caves[i].entrance[j];
        }
    }

    /*
    // Loopy - pretty shitty due to low fps in screeps
    var drawCount = Memory.drawCount || 0;
    for(var i = 0; i < edges.length; i++)
    {
        var last = edges[i][drawCount % edges[i].length];
        for(var tempJ = drawCount + 1; tempJ < drawCount + 3; tempJ++)
        {
            var j = tempJ % edges[i].length;
            try{
                room.visual.line(last[0], last[1], edges[i][j][0], edges[i][j][1]);
            }
            catch(e){
                throw e;
            }
            last = edges[i][j];
        }
    }
    drawCount++;
    Memory.drawCount = drawCount;
    */
}
