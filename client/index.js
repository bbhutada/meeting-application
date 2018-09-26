/**
 * User: bhagyashri.bhutada
 */

const meetingsManager = ( () => {
    const
        CREATE_MEETING_URL = '/meetings',
        AVERAGE_PARTICIPANTS_URL = '/meetings/average/participants',
        AVERAGE_MEETINGS_PER_MONTH_URL = '/meetings/average/permonth',
        NEXT_MEETING_SCHEDULE_PER_PERSON_URL = '/meetings/next/perparticipant',
        UPCOMING_MEETINGS_URL = '/meetings/upcoming',
        TOTAL_MEETINGS_URL = '/meetings/total';

    function clearResult( domId ){
        document.getElementById(domId).innerText = "LOADING";
    }

    function addResult( domId, resultJson, prettyFormat ) {
        document.getElementById( domId ).innerText = prettyFormat ? JSON.stringify(resultJson, null, 4) : JSON.stringify(resultJson);
    }

    function disableButton( buttonId, shouldDisable ) {
        document.getElementById(buttonId).disabled = shouldDisable;
    }

    function getValueOfTextDomById( domId ) {
        return document.getElementById(domId).value
    }

    async function fetchApi( URL, options = {} ) {
        const response = await fetch(URL, options);
        return response.json();
    }

    async function createMeetings( resultDomId, buttonDomId, optionsDomId ) {
        try{
            clearResult(resultDomId);
            disableButton(buttonDomId, true);

            const totalMeetings = getValueOfTextDomById( optionsDomId );
            const resultJson = await fetchApi(CREATE_MEETING_URL, {
                method: 'POST',
                body: JSON.stringify({totalMeetings, topic: "DEFAULT"}),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            });

            addResult( resultDomId,  resultJson );
            disableButton(buttonDomId, false);
        } catch(e) {
            addResult( resultDomId,  e.toString() );
            disableButton(buttonDomId, false);
        }
    }

    async function getAverageParticipants( resultDomId, buttonDomId, optionsDomId ) {
        try{
            clearResult(resultDomId);
            disableButton(buttonDomId, true);

            const totalMeetings = getValueOfTextDomById( optionsDomId );
            const resultJson = await fetchApi(`${AVERAGE_PARTICIPANTS_URL}?totalMeetings=${totalMeetings}`);

            addResult( resultDomId,  resultJson );
            disableButton(buttonDomId, false);
        } catch(e) {
            addResult( resultDomId,  e.toString() );
            disableButton(buttonDomId, false);
        }
    }

    async function getAverageMeetingsPerMonth( resultDomId, buttonDomId ) {
        try{
            clearResult(resultDomId);
            disableButton(buttonDomId, true);

            const resultJson = await fetchApi(`${AVERAGE_MEETINGS_PER_MONTH_URL}`);

            addResult( resultDomId,  resultJson );
            disableButton(buttonDomId, false);
        } catch(e) {
            addResult( resultDomId,  e.toString() );
            disableButton(buttonDomId, false);
        }
    }

    async function getNextMeetingSchedulePerPerson( resultDomId, buttonDomId ) {
        try{
            clearResult(resultDomId);
            disableButton(buttonDomId, true);

            const resultJson = await fetchApi(`${NEXT_MEETING_SCHEDULE_PER_PERSON_URL}`);

            addResult( resultDomId,  resultJson, true );
            disableButton(buttonDomId, false);
        } catch(e) {
            addResult( resultDomId,  e.toString() );
            disableButton(buttonDomId, false);
        }
    }

    async function getUpcomingMeetings( resultDomId, buttonDomId, optionsDomId ) {
        try{
            clearResult(resultDomId);
            disableButton(buttonDomId, true);

            const totalMeetings = getValueOfTextDomById( optionsDomId );
            const resultJson = await fetchApi(`${UPCOMING_MEETINGS_URL}?limit=${totalMeetings}`);

            addResult( resultDomId,  resultJson, true );
            disableButton(buttonDomId, false);
        } catch(e) {
            addResult( resultDomId,  e.toString() );
            disableButton(buttonDomId, false);
        }
    }

    async function getTotalMeetings( resultDomId, buttonDomId ) {
        try{
            clearResult(resultDomId);
            disableButton(buttonDomId, true);

            const resultJson = await fetchApi(`${TOTAL_MEETINGS_URL}`);

            addResult( resultDomId,  resultJson );
            disableButton(buttonDomId, false);
        } catch(e) {
            addResult( resultDomId,  e.toString() );
            disableButton(buttonDomId, false);
        }
    }

    return {
        createMeetings,
        getAverageParticipants,
        getAverageMeetingsPerMonth,
        getNextMeetingSchedulePerPerson,
        getUpcomingMeetings,
        getTotalMeetings
    }
} )();