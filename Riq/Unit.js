
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
        storageIDs = [...storageIDs, ...this.creep.room.controller.memory.storages];
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
}

module.exports = Unit;
