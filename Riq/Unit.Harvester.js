
var Unit = require('Unit');

class UnitHarvester extends Unit
{
    allocateCreep()
    {
        var source = Game.getObjectById(this.creep.memory.sourceID);
        source.memory.harvesterAmount++;
    }

    getDepositStorage()
    {
        var source = Game.getObjectById(this.creep.memory.sourceID);
        var srcStorageIDs = source.memory.storages;
        if(srcStorageIDs && srcStorageIDs.length > 0)
            for(var x = 0; x < srcStorageIDs.length; x++)
            {
                var storage = Game.getObjectById(srcStorageIDs[x]);
                if(storage.store.energy < storage.storeCapacity)
                    return storage;
            }

        if(this.creep.room.hasCaravan)
            // return null for now, and wait caravan to empty the storages
            return null;
        return super.getDepositStorage();
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
            if(this.creep.harvest(Game.getObjectById(this.creep.memory.sourceID)) == ERR_NOT_IN_RANGE)
                this.confirmPath(Game.getObjectById(this.creep.memory.sourceID));
            else
                this.creep.memory.path = false;
        }

        if(this.creep.memory.path)
            this.move();
    }
}

module.exports = UnitHarvester;
