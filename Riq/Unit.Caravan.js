
var Unit = require('Unit');

class UnitCaravan extends Unit
{
    allocateCreep()
    {

    }

    getFullestStorage(storages)
    {
        var storage = null;
        var missingFromFull = 999999;
        for(var x = 0; x < storages.length; x++)
        {
            let strg = Game.getObjectById(storages[x]);
            if((strg.storeCapacity - strg.store.energy) < missingFromFull)
            {
                missingFromFull = strg.storeCapacity - strg.store.energy;
                storage = strg;
            }
        }

        return storage;
    }

    getWithdrawStorage()
    {
        var target = null;
        var storages = [];
        for(var x = 0; x < this.creep.room.memory.sourceIDs.length; x++)
        {
            let source = Game.getObjectById(this.creep.room.memory.sourceIDs[x]);
            if(source.memory.storages.length > 0)
                storages.push(...source.memory.storages);
        }
        var storage = this.getFullestStorage(storages);

        if(storage)
        {
            if(storage.store.energy > this.creep.carryCapacity)
            {
              target = storage;
            }
        }
        return target;
    }

    update()
    {
        super.update();

        if(this.creep.memory.action === "storing" || this.creep.carry.energy === this.creep.carryCapacity)
        {
            var target = this.getDepositStorage();
            if(target)
            {
                var result = this.creep.transfer(target, RESOURCE_ENERGY);
                if(result === ERR_NOT_IN_RANGE)
                    this.confirmPath(target);
                else if(result === ERR_FULL || (result === OK && this.creep.carry.energy > 0))
                    this.creep.memory.action = "storing";
                else
                {
                    this.creep.memory.action = "traveling";
                    this.creep.memory.path = false;
                }
            }
        }
        else
        {
            var target = this.getWithdrawStorage();
            if(target)
            {
                if(this.creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    this.confirmPath(target);
                else
                    this.creep.memory.path = false;
            }
        }

        if(this.creep.memory.path)
            this.move();
    }
}

module.exports = UnitCaravan;
