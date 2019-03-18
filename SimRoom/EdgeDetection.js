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
            //console.log(JSON.stringify(data));
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
            [x+xOff, y+yOff]
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
    let directions = [
        's',
        'sw',
        'w',
        'nw',
        'n',
        'ne',
        'e',
        'se'
    ]
    let startDir = null;

    if(lastDir)
        switch(lastDir)
        {
            case 's':
                startDir = 0;
                break;
            case 'sw':
                startDir = 1;
                break;
            case 'w':
                startDir = 2;
                break;
            case 'nw':
                startDir = 3;
                break;
            case 'n':
                startDir = 4;
                break;
            case 'ne':
                startDir = 5;
                break;
            case 'e':
                startDir = 6;
                break;
            case 'se':
                startDir = 7;
                break;
            default:
                console.log("error! following dir didnt match switchcase:",
                            "'" + lastDir.toString() + "'",
                            typeof lastDir);
                startDir = 0;
                break;
        }
    else
        startDir = 0;

    var _checked = new Array(8);
    var hasFound = false;
    var foundResp;
    var foundDir;
    var resp;
    var i = startDir;
    var cnt = 0;
    for(;; i++)
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
            if(currentEdges[0][0] == resp[1][0] && currentEdges[0][1] == resp[1][1])
            {
                return foundResp;
            }
        }
        if(_checked[i])
            break;
        _checked[i] = true;
        cnt++;
        if(cnt > 2)
        {
            if(hasFound)
            {
                lastDir = foundDir;
                return foundResp;
            }
            break;
        }
    }

    _checked = new Array(8);
    i = startDir;
    for(;;)
    {
        // If nothing found from CW, turn CCW until land found
        if(resp[0])
        {
            checked[resp[1][0]][resp[1][1]] = true;
            lastDir = directions[i];
            return resp[1];
        }
        if(_checked[i])
            break;
        _checked[i] = true;

        i--;
        if(i === -1)
            i = directions.length -1;
        resp = checkWallAt(walls, x, y, directions[i]);
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

function getWallEdges(room)
{
    var data = getWallMap(room);
    var walls = data[0];
    checked = data[1];
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
                    currentEdges = [[x, y]];
                    var edgePart = null;
                    lastDir = "s";
                    var finderX = x;
                    var finderY = y;
                    while((edgePart = getNextEdgePart(walls, finderX, finderY)))
                    {
                        finderX = edgePart[0];
                        finderY = edgePart[1];
                        checked[finderX][finderY] = true;
                        if(currentEdges[0][0] == finderX && currentEdges[0][1] == finderY)
                            break;
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

function update(room)
{
    var edges = getWallEdges(room);
    for(var i = 0; i < edges.length; i++)
    {
        var last = edges[i][0];
        if(last)
            room.visual.line(last[0], last[1], edges[i][edges[i].length-1][0], edges[i][edges[i].length-1][1]);
        for(var j = 0; j < edges[i].length; j++)
        {
            try{
                room.visual.line(last[0], last[1], edges[i][j][0], edges[i][j][1]);
            }
            catch(e){
                throw e;
            }
            last = edges[i][j];
        }
    }
}
