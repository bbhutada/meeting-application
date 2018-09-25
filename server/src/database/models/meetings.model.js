/**
 * User: bhagyashri.bhutada
 *
 * This module exposes range of methods to fetch data from DB.
 */

const
    mongoose = require('mongoose'),
    meetingsSchema = new mongoose.Schema({
                        start: Date,
                        end: Date,
                        topic: String,
                        participants: [String]
                    }),
    meetingsModel = mongoose.model('meeting', meetingsSchema);

/**
 * @method PRIVATE
 *
 * This method runs the aggregate pipeline and returns the result
 *
 * @param pipeline
 * @returns {Promise<any[]>} If successful resolves to array or else rejects with error
 */
function aggregate( pipeline ) {
    return meetingsModel.aggregate(pipeline);
}

/**
 * @method PUBLIC
 *
 * create meeting record in meetings collection
 *
 * @param {object} meetingObj
 * @returns {Promise<inserted meeting mongoose object>}
 */
function createMeeting( meetingObj ) {
    return new meetingsModel(meetingObj).save();
}

/**
 * @method PUBLIC
 *
 * Returns the total number of records in a collection
 *
 * @returns {Promise<number>} resolves to total number of records in the DB
 */
function totalMeetingsCount() {
    return meetingsModel.estimatedDocumentCount();
}

/**
 * @method PUBLIC
 *
 * This method returns next meeting schedule for each participant in meeting.
 *
 * Ex. response is:
 * [
 *   {
 *       name: <String, name of participant>,
 *       startTime: <Date, start time of meeting>,
 *       endTime: <Date, end time of meeting>
 *   }
 * ]
 *
 * @returns {Promise<*[{name:<String>, startTime: <Date>, endTime: <Date>}]>}
 */
function getNextMeetingPerParticipant() {
    const
        pipeline = [
            {$match: {start: {$gte: new Date()} } },
            {$sort: {start:1}},
            {$project: {participants: 1, start: 1, end: 1 }},
            {$unwind: "$participants" },
            {$group: {_id: "$participants", name: {"$first": "$participants"}, startTime: {"$first": "$start"}, endTime: {"$first": "$end"} } },
            {$project: {name: 1, startTime:1, endTime: 1, _id:0}}
        ];

    return aggregate(pipeline);
}

/**
 * @method PUBLIC
 *
 * This method returns average number of meetings per month.
 *
 * @returns {Promise<{averageMeetingsPerMonth: <Number>}[]>}
 */
function getAverageMeetingsPerMonth() {
    const
        pipeline = [
            {
                "$project": {
                    formattedDate: {
                        "$dateToString": { "format": "%Y-%m", "date": "$start" }
                    }
                }
            },
            {
                "$group": {
                    _id: "$formattedDate",
                    totalMeetingsPerMonth: { $sum: 1 }
                }
            },
            {
                "$group": {
                    _id: null,
                    averageMeetingsPerMonth: {"$avg": "$totalMeetingsPerMonth"}
                }
            }
        ];

    return aggregate(pipeline);
}

/**
 * @method PUBLIC
 *
 * This method returns average participants in the 'totalMeetings'. If 'totalMeetings' value is not provided then default 20 meetings
 * are taken by default
 *
 * @param {Number} totalMeetings :OPTIONAL: number of meetings to consider for calculating average participants per meeting
 * @returns {Promise<{averageParticipants: <Number>}[]>}
 */
function getAverageParticipantsByTotalMeetings( totalMeetings = 20 ) {
    const
        pipeline = [
            {$match: {start: { $gte: new Date() } } },
            {$sort: {start:1}},
            {$limit: totalMeetings},
            {$project: {numberOfParticipants: { $size: "$participants" } }},
            {$group: {_id: null, averageParticipants: {"$avg": "$numberOfParticipants"}}}
        ];

    return aggregate(pipeline);
}

/**
 * @method PUBLIC
 *
 * This method returns upcoming meetings based on 'limit'. If not provided then 'limit' defaults to 5.
 *
 * @param {Number} limit :OPTIONAL: number of upcoming meetings to query
 * @returns {Promise<{participants:String[], start: Date, end: Date, topic: String}[]>}
 */
function getUpcomingMeeting( limit = 5 ) {
    return meetingsModel.find({start: {$gte: new Date()}}, {participants:1, start:1, end:1, topic:1}, {sort: {start: 1}, limit});
}

/**
 * @method PUBLIC
 *
 * This method queries the last meeting
 *
 * @returns {Promise<mongoose document | null>}
 */
function getLastMeetingEndDate() {
    return meetingsModel.findOne({}, {end: 1}, {sort: {end: -1}});
}

module.exports = {
    createMeeting,
    totalMeetingsCount,
    getNextMeetingPerParticipant,
    getAverageMeetingsPerMonth,
    getAverageParticipantsByTotalMeetings,
    getUpcomingMeeting,
    getLastMeetingEndDate
};
