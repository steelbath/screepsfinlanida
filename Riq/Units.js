Harvester = require('Unit.Harvester');
Upgrader = require('Unit.Upgrader');
Builder = require('Unit.Builder');
Caravan = require('Unit.Caravan');

var defaults = {
    /* Early game creeps */
    smallHarvester: {
        body: [CARRY, WORK, WORK, MOVE],
        namePrefix: 'Small_Harverster_',
        role: 'harvester',
        memory: {}
    },

    smallUpgrader: {
        body: [CARRY, CARRY, WORK, MOVE, MOVE],
        namePrefix: 'Small_Upgrader_',
        role: 'upgrader',
        memory: {}
    },

    smallBuilder: {
        body: [CARRY, CARRY, WORK, MOVE, MOVE],
        namePrefix: 'Small_Builder_',
        role: 'builder',
        memory: {}
    },

    smallCaravan: {
        body: [CARRY, CARRY, CARRY, MOVE, MOVE, MOVE],
        namePrefix: 'Small_Caravan_',
        role: 'caravan',
        memory: {}
    }
}

module.exports = {
    /*
        Cost Table:

        MOVE:           50
        WORK:           100
        CARRY:          50
        ATTACK:         80
        RANGED_ATTACK:	150
        HEAL:           250
        TOUGH:          10
        CLAIM:          600
    */


    /* Scaling creeps */
    makeHarvester: function(room){
        if(room.energyAvailable < 300)
            return null;

        var total = room.energyCapacityAvailable;
        if(total < 400)
            return defaults.smallHarvester;

        var excessEnergy = room.energyAvailable -100;
        var parts = [CARRY, MOVE];
        for(; excessEnergy >= 100; excessEnergy -= 100)
            parts = [...parts, WORK];

        if(excessEnergy >= 50)
            parts = [...parts, MOVE];

        return {
            body: parts,
            namePrefix: 'MK-'+parts.length+' Harverster ',
            role: 'harvester',
            memory: {}
        }
    },

    makeUpgrader: function(room){
        if(room.energyAvailable < 300)
            return null;

        var total = room.energyCapacityAvailable;
        if(total < 400)
            return defaults.smallUpgrader;

        var excessEnergy = room.energyAvailable -100;
        var parts = [CARRY, MOVE];
        for(; excessEnergy >= 100; excessEnergy -= 100)
            parts = [...parts, WORK];

        if(excessEnergy >= 50)
            parts = [...parts, MOVE];

        return {
            body: parts,
            namePrefix: 'MK-'+parts.length+' Upgrader ',
            role: 'upgrader',
            memory: {}
        }
    },

    makeBuilder: function(room){
        if(room.energyAvailable < 300)
            return null;

        var total = room.energyCapacityAvailable;
        if(total < 400)
            return defaults.smallBuilder;

        var excessEnergy = room.energyAvailable;
        var parts = [];
        for(; excessEnergy >= 200; excessEnergy -= 200)
            parts = [...parts, CARRY, MOVE, WORK];

        for(; excessEnergy >= 50; excessEnergy -= 50)
            parts = [...parts, MOVE];

        return {
            body: parts,
            namePrefix: 'MK-'+parts.length+' Builder ',
            role: 'builder',
            memory: {}
        }
    },

    makeCaravan: function(room){
        if(room.energyAvailable < 300)
            return null;

        var total = room.energyCapacityAvailable;
        if(total < 400)
            return defaults.smallCaravan;

        var excessEnergy = room.energyAvailable -100;
        var parts = [CARRY, MOVE];
        for(; excessEnergy >= 100; excessEnergy -= 100)
            parts = [...parts, CARRY, MOVE];

        return {
            body: parts,
            namePrefix: 'MK-'+parts.length+' Caravan ',
            role: 'caravan',
            memory: {}
        }
    },

    getRoomCreepsDict(room)
    {
      roomCreeps = {
        'harvester': [],
        'upgrader': [],
        'builder': [],
        'caravan': []
      };
      for(var name in Game.creeps)
      {
        if(Game.creeps[name].memory.owner === room.name)
          for(var role in roomCreeps)
            if(Game.creeps[name].memory.role === role)
            {
              roomCreeps[role].push(Game.creeps[name]);
              break;
            }
      }
      return roomCreeps;
    }
};
