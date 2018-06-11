var Unit = require('Unit');

class UnitUpgrader extends Unit
{
    allocateCreep()
    {

    }

    update()
    {
        super.update();
        var controller = this.creep.room.controller;

        if(this.creep.memory.action === "upgrade" || this.creep.carry.energy === this.creep.carryCapacity)
        {
            var result = this.creep.upgradeController(controller);
            if(result == ERR_NOT_IN_RANGE)
                this.confirmPath(controller);
            else if(result == ERR_NOT_ENOUGH_RESOURCES)
                this.creep.memory.action = "travel";
            else
            {
                this.creep.memory.action = "upgrade";
                this.creep.memory.path = false;
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

module.exports = UnitUpgrader
