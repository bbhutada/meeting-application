/**
 * User: bhagyashri.bhutada
 *
 * This module exposes methods which return participants and random hours based on 'defaultData.json' configuration
 */

const
    {getRandomInt} = require('../utils'),
    {participants, hoursRange} = require('../defaultData');

/**
 * @method PUBLIC
 *
 * This method returns random participants names in array based on configured participants in 'defaultData.json'
 *
 * @returns {String[]}
 */
function getParticipants(){
    let
        start = getRandomInt(0, participants.length - 1),
        end = getRandomInt(0, participants.length - 1);

    if(start > end) {
        [start, end] = [end, start];
    } else if( start === end ) {
        end = end +1;
    }
    return participants.slice(start, end+1);
}

/**
 * @method PUBLIC
 *
 * This method returns the random hours between 'minimum' and 'maximum' hours as configured in 'defaultData.json'
 *
 * @returns {Number}
 */
function getRandomHours() {
    return getRandomInt( hoursRange.minimum, hoursRange.maximum );
}

module.exports = {
    getParticipants,
    getRandomHours
};