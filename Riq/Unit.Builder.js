
var Unit = require("Unit");

var actions = {
    registerToSource: function(room, x, y, structureType, sourceID){
        actionData = {
            x: x,
            y: y,
            structure: structureType,
            sourceID: sourceID
        };
        pushToQueue(
            "room",
            room,
            "registerStorageToSource",
            actionData
        );
    }
};

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
                        if(Memory.constructionSites[targetID] && Memory.constructionSites[targetID].onComplete)
                        {
                            Memory.constructionSites[targetID].onComplete(
                                Memory.constructionSites[targetID].onCompleteData
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
