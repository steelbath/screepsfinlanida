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
    for(var x = 0; x < 50; x++)
    {
        walls.push([]);
        emptyArr.push([]);
        for(var y = 0; y < 50; y++)
        {
            let data = results[x][y][0];
            //console.log(JSON.stringify(data));
            if(data.type === "terrain" && data.terrain === "wall")
                walls[x].push(true);
            else
                walls[x].push(false);
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
    checked = [];

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
        let wasChecked = checked[x+xOff][y+yOff];
        checked[x+xOff][y+yOff] = true;
        return [
            walls[x+xOff][y+yOff] && !wasChecked,
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
                return returnDataAt(+1, -1);
            case 'nw':
                return returnDataAt(-1, -1);
            case 'se':
                return returnDataAt(+1, +1);
            case 'sw':
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
        'n',
        'ne',
        'e',
        'se',
        's',
        'sw',
        'w',
        'nw'
    ]
    let startDir = null;

    if(lastDir)
        switch(lastDir)
        {
            case 'n':
                startDir = 0;
                break;
            case 'ne':
                startDir = 1;
                break;
            case 'e':
                startDir = 2;
                break;
            case 'se':
                startDir = 3;
                break;
            case 's':
                startDir = 4;
                break;
            case 'sw':
                startDir = 5;
                break;
            case 'w':
                startDir = 6;
                break;
            case 'nw':
                startDir = 7;
                break;
            default:
                console.log("error! following last dir didnt match switchcase:",
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
    for(var i = startDir; true; i++)
    {
        var resp = checkWallAt(walls, x, y, directions[i]);
        if(hasFound && !resp[0])
        {
            lastDir = foundDir;
            return foundResp;
        }
        else if(resp[0])
        {
            hasFound = true;
            foundResp = resp[1];
            foundDir = directions[i];
        }

        if(_checked[i])
            break;
        _checked[i] = true;

        if(i === directions.length -1)
            i = -1;
    }
    return null;
}

function checkWallSurrounding(walls, x, y)
{
    // Return true if this wall part has possibility to continue edge
    if(!walls[x][y])
        return false;

    // Is surrounded by walls?
    if((!w || walls[x-1][y] && !n || walls[x-1][y-1] && !s || walls[x-1][y+1])
    && (!e || walls[x+1][y] && !n || walls[x+1][y-1] && !s || walls[x+1][y+1])
    && (!n || walls[x][y-1] && !s || walls[x][y+1]))
        return false;

    // Has atleast some wall around where to continue?
    if(n && walls[x][y-1] && lastDir !== 's'
    || e && walls[x+1][y] && lastDir !== 'w'
    || s && walls[x][y+1] && lastDir !== 'n'
    || w && walls[x-1][y] && lastDir !== 'e')
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
    for(var x = 0; x < 50; x++)
    {
        for(var y = 0; y < 50; y++)
        {
            if(walls[x][y] && !checked[x][y])
            {
                getPossibleDirections(x, y);
                if(checkWallSurrounding(walls, x, y, lastDir))
                {
                    edges.push([]);
                    var edgePart = null;
                    var cnt = 0;
                    var finderX = x;
                    var finderY = y;
                    while((edgePart = getNextEdgePart(walls, finderX, finderY)) && cnt < 1000)
                    {
                        cnt++;
                        finderX = edgePart[0];
                        finderY = edgePart[1];
                        edges[edges.length - 1].push(edgePart);
                    }
                    /*
                    if(y > 0)
                        return edges;
                    */
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
    console.log("edges: ", edges);
    let last = [];

    for(var i = 0; i < edges.length; i++)
    {
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
