// file scope vars so we dont need to explicitly always instantiate them
var room;
var creep;

function getConstructionAt(room, x, y, type, structureType)
{
    var construction = null;
    var objs = room.lookAt(x, y);
    for(var objKey in objs)
    {
        var obj = objs[objKey];
        if(obj.type === type
        && obj[type].structureType === structureType)
        {
            construction = obj[type];
            break;
        }
    }
    return construction;
}

function roomQueue()
{
    if(!Memory.rooms[room.name].queuedActions)
        Memory.rooms[room.name].queuedActions = {};

    actions = Memory.rooms[room.name].queuedActions
    for(var action in actions)
    {
        try{
            roomActions[action](actions[action]);
        }
        catch(e){
            console.log("[QueueManager]: ", action, " is not a defined action!");
            console.log(e);
        }
        /*
        // Legacy code
        switch(action)
        {
            case "addBuildingToPriorityQueue":
            case "addActionToBuilding":
            case "registerStorageToSource":
                roomActions[action](actions[action]);
                break;
            default:
                console.log("[QueueManager]: ", action, " is not a defined action!");
                break;
        }
        */
    }
}

var roomActions = {
    addBuildingToPriorityQueue: function(buildingData){
        if(buildingData.length !== 0)
        {
            console.log("Building added to priority queue!")
            for(var x = 0; x < buildingData.length; x++)
            {
                var cnstrData = buildingData[x];
                var building = getConstructionAt(room, cnstrData.x, cnstrData.y,
                                                 "constructionSite", cnstrData.structure);
                if(building)
                {
                    room.buildingPriorityQueue.push({
                        id: building.id,
                        priority: cnstrData.priority
                    });
                    buildingData.splice(x, 1);
                    x--;
                }
            }
        }
    },
    addActionToBuilding: function(buildingData){
        if(buildingData.length !== 0)
        {
            console.log("Action added to building!")
            for(var x = 0; x < buildingData.length; x++)
            {
                var cnstrData = buildingData[x];
                var building = getConstructionAt(room, cnstrData.x, cnstrData.y,
                                                "constructionSite", cnstrData.structure);
                if(building)
                {
                    var actionType = cnstrData.action.type;
                    if(!Memory.constructionSites[building.id])
                        Memory.constructionSites[building.id] = {};
                    Memory.constructionSites[building.id][actionType] = cnstrData.action[actionType];
                    Memory.constructionSites[building.id][actionType+"Data"] = cnstrData.action.data;
                    buildingData.splice(x, 1);
                    x--;
                }
            }
        }
    },
    registerStorageToSource: function(storageData){
        if(storageData.length !== 0)
        {
            for(var x = 0; x < storageData.length; x++)
            {
                var cnstrData = storageData[x];
                var building = getConstructionAt(room, cnstrData.x, cnstrData.y,
                                                 "structure", cnstrData.structure);
                if(building)
                {
                    var source = Game.getObjectById(cnstrData.sourceID);
                    source.memory.storages.push(building.id);
                    console.log("Registered storage for source: " + source.id)
                    storageData.splice(x, 1);
                    x--;
                }
            }
        }
    }
}

// Target is the object type and obj is actual instance of that object type
checkQueue = function(target, obj){
    switch(target)
    {
        case "room":
            room = obj;
            roomQueue();
            break;
        case "creep":
            break;
        default:
            console.log("[QueueManager]: Undefined queue check target!");
            break;
    }
}

// Target is the object type and obj is actual instance of that object type
pushToQueue = function(target, targetObj, action, actionData){
    switch(target)
    {
        case "room":
            try{
                targetObj.memory.queuedActions[action].push(actionData);
            }
            catch(e){
                targetObj.memory.queuedActions[action] = [];
                targetObj.memory.queuedActions[action].push(actionData);
            }
            break;
        case "creep":
            break;
        default:
            console.log("[QueueManager]: Undefined queue push target!");
            break;
    }
}
