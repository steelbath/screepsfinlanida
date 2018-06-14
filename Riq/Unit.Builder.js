
var Unit = require("Unit");

class UnitBuilder extends Unit
{
    allocateCreep()
    {

    }

    update()
    {
        super.update();
        var sites = this.creep.room.unfinishedStructures;

        if(sites.length)
        {
            if(this.creep.memory.action === "build" || this.creep.carry.energy == this.creep.carryCapacity)
            {
                if(!this.creep.memory.targetID)
                {
                    var target = this.creep.pos.findClosestByRange(sites);
                    this.creep.memory.targetID = target.id;
                }
                else
                    var target = Game.getObjectById(this.creep.memory.targetID);

                this.build(target);
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
        }

        if(this.creep.memory.path)
            this.move();
    }
}

module.exports = UnitBuilder;
