var SpawnManager = require('SpawnManager');
var util = require('TechUtility');
var units = require('Units');

RoomStatus = {'CONNECT': 1, 'TRADE': 2, 'BUILD': 3, 'FORTIFY': 4, 'DEFEND': 5, 'ATTACK': 6, 'HARVEST': 7}; // describes the most important need of actions in the current room

status = RoomStatus.HARVEST; // default room status
spawner = "None";
UPGRADERS_NEEDED = 3;
CARAVANS_NEEDED = 2;
BUILDERS_NEEDED = 2;
profiler = require('screeps-profiler');

// createPriorizedConstruction(Game.getObjectById("87d4ada5af2d3c9").room, 25, 18, "extension", 97)
createPriorizedConstruction = function(room, x, y, structureType, priority)
{
    var result = room.createConstructionSite(x, y, structureType);
    console.log("Can create construction: ", result === OK);
    if(result === OK)
    {
        pushToQueue(
            "room",
            room,
            "addBuildingToPriorityQueue",
            {
                x: x,
                y: y,
                structure: structureType,
                priority: priority
            }
        );
    }
    return result;
}

function createStorageForSource(room, x, y, sourceID)
{
    var result = createPriorizedConstruction(room, x, y, STRUCTURE_CONTAINER, 0)
    if(result === OK)
    {
        console.log("creating storage for source: "+source.id, result);
        pushToQueue(
            "room",
            room,
            "addSiteToSource",
            {
                x: x,
                y: y,
                structure: STRUCTURE_CONTAINER,
                sourceID: sourceID
            }
        );
    }
    return result;
}

function createRoomStorage(room, x, y, structureType, priority=50)
{
    if(structureType !== STRUCTURE_CONTAINER
    && structureType !== STRUCTURE_EXTENSION
    && structureType !== STRUCTURE_STORAGE)
        return -50;

    var result = createPriorizedConstruction(room, x, y, structureType, priority)
    if(result === OK)
    {
        actionData = {
            x: x,
            y: y,
            structure: structureType
        };
        setCompletionActionToBuilding(
            room,
            x,
            y,
            structureType,
            "addStorageToRoom",
            actionData
        )
    }
    return result;
}

function createStorageForObject(room, x, y, objectID, priority=50)
{
    var result = createPriorizedConstruction(room, x, y, STRUCTURE_CONTAINER, priority)
    if(result === OK)
    {
        actionData = {
            x: x,
            y: y,
            structure: STRUCTURE_CONTAINER,
            objectID: objectID
        };
        setCompletionActionToBuilding(
            room,
            x,
            y,
            STRUCTURE_CONTAINER,
            "registerStorageToMemory",
            actionData
        )
    }
    return result;
}

function setCompletionActionToBuilding(room, x, y, structureType, action, actionData)
{
    pushToQueue(
        "room",
        room,
        "addActionToBuilding",
        {
            x: x,
            y: y,
            structure: structureType,
            action: {
                type: "onComplete",
                onComplete: action,
                data: actionData
            }
        }
    );
}

function buildStorageAround(room, pos, dist=3)
{
    var size = dist-2;
    positions = [];
    positions.push([pos.x - dist, pos.y + dist]);
    positions.push([pos.x + dist, pos.y + dist]);
    positions.push([pos.x + dist, pos.y - dist]);
    positions.push([pos.x - dist, pos.y - dist]);
    for(var i = 1; i <= size; i++)
    {
        // South West
        positions.push([pos.x - dist + i, pos.y + dist]);
        positions.push([pos.x - dist, pos.y + dist - i]);

        // South East
        positions.push([pos.x + dist - i, pos.y + dist]);
        positions.push([pos.x + dist, pos.y + dist - i]);

        // North East
        positions.push([pos.x + dist - i, pos.y - dist]);
        positions.push([pos.x + dist, pos.y - dist + i]);

        // North West
        positions.push([pos.x - dist + i, pos.y - dist]);
        positions.push([pos.x - dist, pos.y - dist + i]);
    }

    let roomExtensions = room.find(
        FIND_STRUCTURES, {
            filter: (structure) => {return (structure.structureType == STRUCTURE_EXTENSION);}
        }
    ).length;
    let roomMaxExtensions = roomLevelData[room.controller.level].extensions;

    for(key in positions)
    {
        if(roomExtensions === roomMaxExtensions)
            break;

        var results = room.lookAt(positions[key][0], positions[key][1])
        var canCreate = true;
        for(resKey in results)
        {
            result = results[resKey];
            if(result.type === "structure" || result.type === "terrain" && result.terrain === "wall")
            {
                canCreate = false;
                break;
            }
        }

        if(canCreate)
        {
            let res = createRoomStorage(room, positions[key][0], positions[key][1], STRUCTURE_EXTENSION, 100);
            if(res === OK)
                roomExtensions++;
        }
    }
}

function allocateRoom(room)
{
    room.storages = room.find(
        FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_SPAWN);
            }
        });
    if(!room.storages || room.storages.length == 0)
        return;

    room.memory.caravans = 0;
    room.memory.sourceIDs = _.map(getSources(room), function(source){return source.id;});
    room.memory.level = room.controller.level;
    room.memory.storageIDs = _.map(room.storages, function(store){return store.id;});
    room.memory.harvestersNeeded = 0;
    for(key in room.memory.sourceIDs)
    {
        source = Game.getObjectById(room.memory.sourceIDs[key]);
        source.memory.maxHarvesters = 0;

        /* Temp hack for development to always recheck harvester amount */
        temp = _.filter(Game.creeps, (creep) => creep.memory.sourceID === source.id);
        source.memory.harvesterAmount = temp.length;

        positions = [];
        positions.push([source.pos.x -1,    source.pos.y +1 ]);
        positions.push([source.pos.x -1,    source.pos.y    ]);
        positions.push([source.pos.x -1,    source.pos.y -1 ]);
        positions.push([source.pos.x,       source.pos.y -1 ]);
        positions.push([source.pos.x +1,    source.pos.y -1 ]);
        positions.push([source.pos.x +1,    source.pos.y    ]);
        positions.push([source.pos.x +1,    source.pos.y +1 ]);
        positions.push([source.pos.x ,      source.pos.y +1 ]);
        for(key in positions)
        {
            var results = room.lookAt(positions[key][0], positions[key][1])
            for(resKey in results)
            {
                result = results[resKey];
                if(result.type === "terrain" && result.terrain !== "wall")
                {
                    if(!source.memory.storages && !source.memory.pendingStorages)
                    {
                        source.memory.storages = [];
                        source.memory.pendingStorages = [];
                        result = createStorageForSource(
                            room,
                            positions[key][0],
                            positions[key][1],
                            source.id
                        );
                    }
                    source.memory.maxHarvesters++;
                }
            }
        }
        room.memory.harvestersNeeded += source.memory.maxHarvesters;
    }
    room.memory.allocated = true;
    console.log("Room "+room.name+" allocated")
}

function getSpawners(room)
{
    return room.find(FIND_MY_SPAWNS);
}

function getSources(room)
{
    return room.find(FIND_SOURCES);
}

function getOptimalSource(sourceIDs)
{
    var optimalSourceID = sourceIDs[0];
    var leastUsers = 9999999;
    for(var key in sourceIDs)
    {
        var source = Game.getObjectById(sourceIDs[key]);
        var users = source.memory.harvesterAmount;
        if(users < source.memory.maxHarvesters && users < leastUsers)
        {
            leastUsers = users;
            optimalSourceID = source.id;
        }
    }
    return optimalSourceID;
}

function getNextUnit(room)
{
    let canSpawnCaravan =  false;
    let sourceStorageIDs = [];
    let sourceStorageConstSiteIDs = [];
    for(var x = 0; x < room.memory.sourceIDs.length; x++)
    {
        let id = room.memory.sourceIDs[x];
        if(Memory.sources[id].storages.length > 0)
        {
            canSpawnCaravan = true;
            sourceStorageIDs = [sourceStorageIDs, ...Memory.sources[id].storages];
        }
        if(Memory.sources[id].pendingStorages.length > 0)
            sourceStorageConstSiteIDs = [sourceStorageConstSiteIDs, ...Memory.sources[id].pendingStorages];
    }

    let canSpawnBuilders = (BUILDERS_NEEDED > 0 && room.unfinishedStructures.length > sourceStorageConstSiteIDs.length)
    if(canSpawnCaravan && room.harvesters.length > 0 && room.caravans.length < CARAVANS_NEEDED)
    {
        neededUnit = units.makeCaravan(room);
    }
    else if(canSpawnBuilders
         && room.builders.length == 0
         && room.harvesters.length >= room.memory.sourceIDs.length
         && room.builders.length < room.unfinishedStructures.length)
    {
        neededUnit = units.makeBuilder(room);
    }
    else if(room.harvesters.length < room.memory.harvestersNeeded && room.caravans.length == 0
         || room.harvesters.length < room.memory.sourceIDs.length)
    {
        neededUnit = units.makeHarvester(room);
        let optimSourceID = getOptimalSource(room.memory.sourceIDs);
        neededUnit.memory = util.joinDicts(neededUnit.memory, {'sourceID': optimSourceID});
    }
    else if(room.upgraders.length < UPGRADERS_NEEDED && sourceStorageIDs.length > 0)
    {
        neededUnit = units.makeUpgrader(room);
    }
    else if(canSpawnBuilders && room.builders.length < BUILDERS_NEEDED)
    {
        neededUnit = units.makeBuilder(room);
    }
    return neededUnit;
}

function roomUpgrade(room)
{
    for(var key in room.spawners)
        buildStorageAround(room, room.spawners[key].pos);

    let controller = room.controller;
    if(!controller.memory.storages || controller.memory.storages.length == 0)
    {
        positions = [];
        positions.push([controller.pos.x -1,    controller.pos.y +1 ]);
        positions.push([controller.pos.x -1,    controller.pos.y    ]);
        positions.push([controller.pos.x -1,    controller.pos.y -1 ]);
        positions.push([controller.pos.x,       controller.pos.y -1 ]);
        positions.push([controller.pos.x +1,    controller.pos.y -1 ]);
        positions.push([controller.pos.x +1,    controller.pos.y    ]);
        positions.push([controller.pos.x +1,    controller.pos.y +1 ]);
        positions.push([controller.pos.x ,      controller.pos.y +1 ]);
        for(key in positions)
        {
            var results = room.lookAt(positions[key][0], positions[key][1])
            let isFree = false;
            for(resKey in results)
            {
                result = results[resKey];
                if(result.type === "terrain" && result.terrain !== "wall")
                {
                    isFree = true;
                    break;
                }
            }
            if(isFree)
            {
                var response = createStorageForObject(room, positions[key][0], positions[key][1], room.controller.id, 100);
                if(response === OK)
                    break;
            }
        }
    }

    return true;
}

// profiler.registerObject(Harvester, "Harvester");
profiler.registerObject(Builder, "Builder");
profiler.registerObject(Upgrader, "Upgrader");

module.exports = {
    update(room)
    {
        if(!room.controller || !room.controller.my)
            return;

        if(!room.memory.heaps)
            room.memory.heaps = {};

        buildingPriorityQueue = undefined;
        if(!room.memory.buildingPriorityQueue)
            room.buildingPriorityQueue = new BinaryHeap.MaxPriorityHeap();
        else
            room.buildingPriorityQueue = BinaryHeap.MaxPriorityHeap.deserialize(
                room.memory.heaps.buildingPriorityQueue
            );

        room.unfinishedStructures = _.filter(Game.constructionSites, (site) => site.room.id === room.id);
        room.spawners = getSpawners(room);

        if(!room.memory.allocated)
            allocateRoom(room);
        if(!room.memory.allocated)
            return;

        room.oldLevel = parseInt(room.memory.level);
        if(room.oldLevel !== room.controller.level)
        {
            if(room.oldLevel < room.controller.level)
            {
                console.log("room has upgraded!");
                if(roomUpgrade(room))
                    room.memory.level = room.controller.level;
            }
            else
            {
                console.log("room has downgraded!");
            }
        }

        checkQueue("room", room);
        var roomCreepsDict = units.getRoomCreepsDict(room);
        room.harvesters = roomCreepsDict['harvester'];
        room.upgraders = roomCreepsDict['upgrader'];
        room.builders = roomCreepsDict['builder'];
        room.caravans = roomCreepsDict['caravan'];
        room.hasCaravan = room.caravans.length > 0;

        /* Get room situation and set status accordingly */
        neededUnit = null
        noBuild = false;
        noUpgrade = false;
        if(room.harvesters.length < room.memory.harvestersNeeded/2)
        {
            noBuild = true;
            noUpgrade = true;
        }

        /* Choose actions for this room, based on status */

        /*
        switch(status){
            case RoomStatus.BUILD:

                break;
            case RoomStatus.CONNECT:

                break;
            case RoomStatus.WAR:

                break;

            default:
                break;
        }

        /* Update creeps */
        for(var creep of room.caravans)
        {
            let caravan = new Caravan(creep);
            caravan.update();
        }
        for(var creep of room.harvesters)
        {
            let harvester = new Harvester(creep);
            harvester.update();
        }
        for(var creep of room.upgraders)
        {
            let upgrader = new Upgrader(creep);
            upgrader.update();
        }
        for(var creep of room.builders)
        {
            let builder = new Builder(creep);
            builder.update();
        }

        var hasAvailableSpawner = false;
        for(var key in room.spawners)
            if(room.spawners[key].spawning == null)
            {
                if(room.energyAvailable >= room.energyCapacityAvailable -50
                && room.energyAvailable >= 300
                || room.caravans.length == 0
                && room.energyAvailable >= 300)
                {
                    hasAvailableSpawner = true;
                    spawner = room.spawners[key];
                    break;
                }
            }

        if(hasAvailableSpawner)
        {
            neededUnit = getNextUnit(room);
            if(neededUnit)
                SpawnManager.update(spawner, neededUnit, room)
        }

        room.memory.heaps.buildingPriorityQueue = room.buildingPriorityQueue.getData();
    }
};
