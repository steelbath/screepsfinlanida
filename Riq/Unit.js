
/*
    Should be somewhat slower than just running functions, but this enables
    class inheritance that simplifies code
*/
class Unit
{
    constructor(creep)
    {
        this.creep = creep;

        if(!this.creep.memory.allocated)
        {
            this.allocateCreep();
            this.creep.memory.allocated = true;
        }
    }

    update()
    {
        if(this.creep.spawning)
            return
    }

    allocateCreep()
    {
        // code to be ran only once in creeps lifetime
        throw new Error("This unit doesnt have allocation method!");
    }

    getDepositStorage()
    {
        var target = null;
        var storageIDs = this.creep.room.memory.storageIDs;
        var controllerStorageIDs = this.creep.room.controller.memory.storages;
        storageIDs = [...storageIDs, ...controllerStorageIDs ? controllerStorageIDs : []];
        var storages = [];
        for(var key in storageIDs)
        {
            var storage = Game.getObjectById(storageIDs[key]);
            var store;
            if(storage.store)
            {
              store = storage.store;
              if(storage.store.energy < storage.storeCapacity)
                  storages.push(storage);
            }
            else
                if(storage.energy < storage.energyCapacity)
                    storages.push(storage);
        }
        if(storages.length > 0)
            target = this.creep.pos.findClosestByRange(storages);

        return target;
    }

    getWithdrawStorage()
    {
        var target = null;
        var storageIDs = this.creep.room.memory.storageIDs;
        if(this.creep.room.harvesters.length > 1 && this.creep.room.caravans.length == 2)
            for(var key in storageIDs)
            {
                var storage = Game.getObjectById(storageIDs[key]);
                var store;
                if(storage.store)
                  store = storage.store.energy;
                else
                  store = storage.energy;

                if(store > this.creep.carryCapacity)
                {
                  target = storage;
                  break;
                }
            }
        return target;
    }

    confirmPath(target)
    {
        if(target)
        {
            this.creep.memory.targetID = target.id;
            this.creep.memory.path = true;
            //this.creep.memory.path = this.creep.pos.findPathTo(target);
        }
        else
            this.creep.memory.path = false;
    }

    move()
    {
      this.creep.moveTo(Game.getObjectById(this.creep.memory.targetID));
      /*
        itemsOnNextStep = this.creep.room.lookAt(
            this.creep.memory.path[0].x,
            this.creep.memory.path[0].y
        )
        pathObstructed = false;
        for(var key in itemsOnNextStep)
        {
            obj = itemsOnNextStep[key];
            if(obj.type == 'creep' && obj.creep.name != this.creep.name)
            {
                this.creep.say("bad path!");
                pathObstructed = true;
                break;
            }
        }

        if(!pathObstructed)
        {
            err = this.creep.moveByPath(this.creep.memory.path);
            console.log(err);
            if(err)
            {
                if(err == ERR_NO_PATH)
                {
                    this.creep.memory.path = this.creep.pos.findPathTo(this.creep.memory.target);
                    console.log("refound the path!");
                }
                this.creep.moveByPath(this.creep.memory.path);
            }
        }
        else
        {
            console.log("remaking path!");
            this.creep.memory.path = this.creep.pos.findPathTo(this.creep.memory.target.pos.x, this.creep.memory.target.pos.y);
            this.creep.moveByPath(this.creep.memory.path);
        }
      */
    }

    build(target)
    {
        var result = this.creep.build(target);

        switch(result)
        {
            case ERR_NOT_IN_RANGE:
                this.confirmPath(target);
                break;
            case ERR_NOT_ENOUGH_RESOURCES:
                this.creep.memory.action = "travel";
                break;
            case ERR_INVALID_TARGET:
                let targetID = this.creep.memory.targetID;
                let target = Memory.constructionSites[targetID];
                if(target && target.onComplete)
                {
                    for(var x = 0; x < target.onCompleteData.length; x++)
                        buildEvents[target.onComplete](
                            this.creep.room,
                            target.onCompleteData[x]
                        );
                    delete Memory.constructionSites[targetID];
                }
                this.creep.memory.targetID = null;
                break;
            default:
                this.creep.memory.action = "build";
                this.creep.memory.path = false;
                break;
        }
        return result;
    }
}

// we cant send functions over ticks, so we have to have named array for that,
// so we can call those functions by name
var buildEvents = {
    registerToSource: function(room, eventData){
        pushToQueue(
            "room",
            room,
            "registerStorageToSource",
            eventData
        );
    },
    addStorageToRoom: function(room, eventData){
        pushToQueue(
            "room",
            room,
            "addStorageToRoom",
            eventData
        );
    },
    registerStorageToMemory: function(room, eventData){
        pushToQueue(
            "room",
            room,
            "registerStorageToMemory",
            eventData
        );
    }
};

module.exports = Unit;
