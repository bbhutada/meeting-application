/**
 * User: bhagyashri.bhutada
 *
 * This module is a standard express router config file
 */

const
    express = require('express'),
    router = express.Router(),
    MeetingsController = require('../controller/meetings.controller');

router.post('/', [
    MeetingsController.createMeetings
]);

router.get('/average/participants', [
    MeetingsController.getAverageParticipantsByTotalMeetings
]);

router.get('/average/permonth', [
    MeetingsController.getAverageMeetingsPerMonth
]);

router.get('/next/perparticipant', [
    MeetingsController.getNextMeetingPerParticipant
]);

router.get('/upcoming', [
    MeetingsController.getUpcomingMeeting
]);

router.get('/total', [
    MeetingsController.totalMeetingsCount
]);

module.exports = router;