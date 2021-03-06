const params = require('params');
const roleBase = require('role.base');

const roleSneaker = {
    run: function(creep) {
        const attack = params.ATTACK;

        if(creep.memory.dumping && creep.carry.energy < 50) {
            creep.memory.dumping = false;
            creep.say('🔄 sneak');
        }
        if(!creep.memory.dumping && creep.carry.energy === creep.carryCapacity) {
            creep.memory.dumping = true;
            creep.say('🚚 dump');
        }

        if (!creep.memory.dumping) {
            if (attack) {
                if (creep.room.name !== attack.roomName) {
                    const exitDir = creep.room.findExitTo(attack.roomName);
                    creep.moveTo(creep.pos.findClosestByRange(exitDir), {visualizePathStyle: {stroke: '#ffff00'}});
                } else {
                    let stealObject = Game.getObjectById(attack.stealID);

                    if (stealObject && (stealObject.store > 0 || stealObject.energy > 0)) {
                        if (creep.withdraw(stealObject, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(stealObject, {visualizePathStyle: {stroke: '#ffff00'}});
                        }
                    } else {
                        let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                        if (target) {
                            console.log(creep.name + ": Stealing dropped resources");
                            if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                            }
                        } else {
                            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return ((structure.structureType === STRUCTURE_CONTAINER
                                        || structure.structureType === STRUCTURE_STORAGE)
                                        && structure.store[RESOURCE_ENERGY] > 0)
                                        ||
                                        ((structure.structureType === STRUCTURE_EXTENSION
                                            || structure.structureType === STRUCTURE_SPAWN
                                            || structure.structureType === STRUCTURE_TOWER)
                                            && structure.energy > 0);
                                }
                            });
                            if (target) {
                                if (target.owner) {
                                    console.log(`${creep.name}: Stealing energy from ${target.owner.username}'s ${target.structureType}`);
                                } else {
                                    console.log(`${creep.name}: Stealing energy from ${target.structureType} in room ${target.room.name}`);
                                }
                                if (creep.harvest(target) === ERR_NOT_IN_RANGE
                                    || creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                                }
                            } else {
                                // done stealing
                            }
                        }
                    }

                }
            } else {
                creep.moveTo(creep.room.controller.pos, {visualizePathStyle: {stroke: '#ffffff'}})
            }
        } else {
            if (creep.room.name === Game.myRoomName) {
                creep.memory.target = null;
                let target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_EXTENSION
                            || structure.structureType === STRUCTURE_SPAWN
                            || structure.structureType === STRUCTURE_TOWER
                            || structure.structureType === STRUCTURE_CONTAINER
                            || structure.structureType === STRUCTURE_STORAGE)
                            && structure.energy < structure.energyCapacity;
                    }
                });
                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    creep.moveTo(creep.room.controller.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                creep.moveTo(new RoomPosition(25,25,params.homeRoom), {visualizePathStyle: {stroke: '#ffffff'}})
            }
        }

    },
};

module.exports = roleSneaker;