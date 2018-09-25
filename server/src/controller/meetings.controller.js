/**
 * User: bhagyashri.bhutada
 *
 * This module exposes Meetings controller method's which are connected to /meetings REST endpoints
 */

const
    MeetingsModel = require('../database/models/meetings.model'),
    {formatPromiseResult, ObjParse, getNextStartDate} = require('../utils'),
    {getParticipants, getRandomHours} = require('../config');

/**
 * @method PUBLIC
 * @RestApi POST /meetings
 *          request body = {totalMeetings: <Number, OPTIONAL. Default to 5000>, topic: <String, required>}
 *
 * This method creates 5000 meetings in the database. If the database is empty then first meeting will be scheduled after
 * 1 hour from now (just to keep some buffer time :)) and rest of the meetings will be kept from 5 minutes gap from each other.
 *
 *
 * An example output response is as below:
 * {insertedMeetings: <Number>, errorMeetings: <Number, total number of meetings not created>}
 *
 * @param {object} req Express request object
 * @param {string} :OPTIONAL: req.body.totalMeetings total meeting to create in the DB
 * @param {string} req.body.topic topic of the meetings
 * @param {object} res Express response object
 * @returns {Promise<void>}
 */
async function createMeetings( req, res ) {
    let
        {totalMeetings, topic} = req.body || {},
        err,
        result,
        lastMeetingEndDate,
        responseObj = {insertedMeetings: 0, errorMeetings: 0};

    // ----------------------------- 1. Validate input -----------------------------------------------------------------------
    if( !topic || typeof topic !== "string" ) {
        return res.status(400).send(`Missing 'topic' from the request body.`);
    }

    if( totalMeetings ) {
        totalMeetings = parseInt(totalMeetings);

        if( !Number.isInteger(totalMeetings) || totalMeetings <= 0 || totalMeetings > 5000 ) {
            return res.status(400).send(`Invalid 'totalMeetings' passed in request body. 'totalMeetings' must be number > 0 and < 5000`);
        }
    } else {
        totalMeetings = 5000;
    }
    // ------------------------------------------ 1. END ----------------------------------------------------------------------


    // ---------------------------- 2. Get last meeting end date --------------------------------------------------------------
    [err, result] = await formatPromiseResult( MeetingsModel.getLastMeetingEndDate() );

    if( err ) {
        return res.status(500).send(err);
    }

    if( result && result.end ) {
        lastMeetingEndDate = result.end;
    }
    // -------------------------------------- 2. END --------------------------------------------------------------------------


    // ---------- 3. Create 'totalMeetings' meetings records in DB after 'lastMeetingEndDate' ---------------------------------
    for( let index = 0; index <totalMeetings; index++ ) {
        /**
         * If 'lastMeetingEndDate' is not set, meaning empty database or past meeting then 'start' date will be 1 hour from now.
         */
        const
            start = getNextStartDate(lastMeetingEndDate),
            end = new Date(+start),
            participants = getParticipants();

        end.setHours( start.getHours() + getRandomHours());

        [err, result] = await formatPromiseResult(
                                MeetingsModel.createMeeting({ start, end, topic, participants})
                              );

        if( err ) {
            responseObj.errorMeetings++;
            console.log(`createMeetings: error saving meeting no: ${index}. Error: ${err.stack || err}`);
        } else if( !result ) {
            responseObj.errorMeetings++;
            console.log(`createMeetings: Failed to Insert meeting no: ${index}`);
        } else {
            console.log(`createMeetings: Inserted meeting no: ${index}`);
            responseObj.insertedMeetings++;
            lastMeetingEndDate = end;
        }
    }
    // ------------------------------------- 3. END ---------------------------------------------------------------------------

    res.json(responseObj);
}

/**
 * @method PUBLIC
 * @RestApi GET /meetings/average/participants?totalMeetings=<Number>
 *              Query param 'totalMeetings' is optional and defaults to 20
 *
 * This method returns average number of participants in next 20 meetings. If 'totalMeetings' query param is passed then
 * average participants will be calculated based on 'totalMeetings' being passed
 *
 * An example output response is as below:
 * {averageMeetingsPerMonth: <Number>}
 *
 * @param {object} req Express request object
 * @param {string} :OPTIONAL: req.query.totalMeetings Meetings to consider for computing average participants
 * @param {object} res Express response object
 * @returns {Promise<void>}
 */
async function getAverageParticipantsByTotalMeetings( req, res ) {
    let
        {totalMeetings} = req.query,
        err,
        result;

    // --------------------------- 1. Validate query param -------------------------------------------------------
    if( totalMeetings ) {
        totalMeetings = parseInt(totalMeetings);

        if( !Number.isInteger(totalMeetings) || totalMeetings <= 0) {
            return res.status(400).send(`Invalid query param 'totalMeetings'. 'totalMeetings' must be numbers > 0`);
        }
    } else {
        totalMeetings = 20;
    }
    // ------------------------------------ 1. END ---------------------------------------------------------------


    // --------------------------- 2. Get average participants based on total meetings ----------------------------
    [err, result] = await formatPromiseResult( MeetingsModel.getAverageParticipantsByTotalMeetings(totalMeetings) );

    if( err ) {
        return res.status(500).send(err);
    }

    res.json({averageParticipants: ObjParse(result).getKey(0).getKey('averageParticipants').getVal() || 0});
    // ------------------------------------- 2. END ---------------------------------------------------------------
}

/**
 * @method PUBLIC
 * @RestApi GET /meetings/average/permonth
 *
 * This method returns average number of meetings scheduled per month
 *
 * An example output response is as below:
 * {averageMeetingsPerMonth: <Number>}
 *
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {Promise<void>}
 */
async function getAverageMeetingsPerMonth( req, res ) {
    let
        err,
        result;

    [err, result] = await formatPromiseResult( MeetingsModel.getAverageMeetingsPerMonth() );

    if(err) {
        return res.status(500).send(err)
    }

    res.json({averageMeetingsPerMonth: ObjParse(result).getKey(0).getKey('averageMeetingsPerMonth').getVal() || 0});
}

/**
 * @method PUBLIC
 * @RestApi GET /meetings/next/perparticipant
 *
 * This method returns the next meeting schedule for each unique participant in the database.
 *
 * An example output response is as below:
 * [
 *    {
 *        name: <String, name of the participant>,
 *        startTime: <Date, start dateTime of meeting>,
 *        endTime: <Date, end dateTime of meeting>
 *    },
 *    ...
 * ]
 *
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {Promise<void>}
 */
async function getNextMeetingPerParticipant( req, res ) {
    let
        err,
        result;

    [err, result] = await formatPromiseResult( MeetingsModel.getNextMeetingPerParticipant() );

    if(err) {
        return res.status(500).send(err)
    }

    res.json(result);
}

/**
 * @method PUBLIC
 * @RestApi GET /meetings/upcoming?limit=<number>
 *              Query param 'limit' is optional and defaults to 5
 *
 * This method returns the upcoming 5 meetings by default. If 'limit' query param is passed then number of upcoming meetings
 * returned is equal to the value of limit.
 *
 * An example output response is as below:
 * [
 *     {
 *         participants: <[String]>,
 *         start: <Date>,
 *         end: <Date>,
 *         topic: <String>
 *     },
 *     ...
 * ]
 *
 * @param {object} req Express request object
 * @param {string} :OPTIONAL: req.query.limit number of upcoming meeting to query
 * @param {object} res Express response object
 * @returns {Promise<void>}
 */
async function getUpcomingMeeting( req, res ) {
    let
        {limit} = req.query,
        err,
        result;

    if( limit ) {
        limit = parseInt(limit);

        if( !Number.isInteger(limit) || limit <= 0 ) {
            return res.status(400).send(`Invalid query param 'limit'. 'limit' must be number > 0`);
        }
    } else {
        limit = 5;
    }

    [err, result] = await formatPromiseResult( MeetingsModel.getUpcomingMeeting(limit) );

    if(err) {
        return res.status(500).send(err);
    }

    return res.json(result);
}

/**
 * @method PUBLIC
 * @RestApi GET /meetings/total
 *
 * This method returns the total number of meetings in the database.
 * An example output response is as below:
 * {totalMeetings: <Number>}
 *
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {Promise<void>}
 */
async function totalMeetingsCount( req, res ){
    let
        err,
        totalMeetings;

    [err, totalMeetings] = await formatPromiseResult(MeetingsModel.totalMeetingsCount());

    if( err ) {
        return res.status(500).send(err);
    }

    res.json({totalMeetings: totalMeetings });
}

module.exports = {
    createMeetings,
    getAverageParticipantsByTotalMeetings,
    getAverageMeetingsPerMonth,
    getNextMeetingPerParticipant,
    getUpcomingMeeting,
    totalMeetingsCount
};