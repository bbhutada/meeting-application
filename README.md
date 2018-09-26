## Author: Bhagyashri Bhutada

# Meeting Application
This is a full stack Javscript/node.js meeting web application built using Express running on node.js, mongoose & mongodb, also exposed with simple interface ( Javascript/Html ) for interaction. 
It can schedule up to 5000 meetings at a time and provides all the statistics of the meetings like total amount of meetings, average meetings per month, upcoming meetings etc.

Note: As per the requirement, interface is kept simple. But in ideal senario, frontend can be built using appropriate javascript library React.js/Redux along with bootstrap.

#### The node.js server is written in latest ES 2017 syntax completely with async/await and latest node.js version (10.11) is used. Also, code is completely documented along with design/pattern decision description and method usage documentation

## pre-requisites
1] mongodb server must be installed

## npm dependencies
1] express.js (latest)<br/>
2] mongodb (latest)

## File Structure
<b>Client:</b> <br/>Contains all client code ( html/javascript)<br/>

<b>Server:</b> <br/>
1] ./server/src/server.js -> Start point of the server <br/>
2] ./server/src/serverConfig.json -> Contains http server and mongodb database configuration (user should configure this) <br/>
3] ./server/src/defaultData.json -> Contains participants and meeting time range<br/>
4] ./server/src/config/index.js -> Exposes methods to get random participants and hours for meetings<br/>
5] ./server/src/controller/meetings.controller.js -> Exposes methods connected to /meetings REST end points<br/>
6] ./server/src/database/models/meetings.model.js -> Exposes schema and range of methods to fetch data from mongodb server<br/>
7] ./server/src/database/index.js -> Exposes init method to connect mongoose client to mongodb server<br/>
8] ./server/src/routes/mettings.routes.js -> Exposes all the required ( urls ) end points<br/>
9] ./server/src/utils/index.js -> Just exposes 'formatPromiseResult' method to be used with async/await and other helper functions<br/>

## Exposed REST Endpoints

### POST <base_url>/meetings
  * request body = {totalMeetings: <Number, OPTIONAL. Default to 5000>, topic: <String, required>}
  * This method creates 5000 meetings in the database. If the database is empty then it will start scheduling the meetings from next hour  (just to keep some buffer ) and rest of the meetings will be scheduled with gap of 5 minutes.
  * An example output response is as follows: ```{insertedMeetings: <Number>, errorMeetings: <Number, total number of meetings not created>}```

### GET /meetings/average/participants?totalMeetings = < Number >
  * Query param 'totalMeetings' is optional and defaults to 20
  * This method returns average number of participants in next 20 meetings. If 'totalMeetings' query param is passed then average participants will be calculated based on 'totalMeetings' being passed.
  * An example output response is as follows: ```{averageMeetingsPerMonth: <Number>}```
  
### GET /meetings/average/permonth
  * This method returns average number of meetings scheduled per month
  * An example output response is as follows: ```{averageMeetingsPerMonth: <Number>}```
  
### GET /meetings/next/perparticipant
  * This method returns the next meeting scheduled for each unique participant.
  * An example output response is as follows ( SCROLLABLE ): 
            ```[{ 
            name: <String, name of the participant>, 
            startTime: <Date, start dateTime of meeting>,
            endTime: <Date, end dateTime of meeting>
            }]```

### GET /meetings/upcoming?limit = < number >
  * Query param 'limit' is optional and defaults to 5
  * This method returns the 5 upcoming meetings. If the'limit' query param is set then the number of upcoming meetings returned is equal to the value of limit.
  * An example output response is as follows ( SCROLLABLE ): 
            ```[{ 
            participants: <[String]>, 
            start: <Date>,
            end: <Date>, 
            topic: <String>
            }]```
           
### GET /meetings/total   
  * This method returns the total number of meetings in the database. 
  * An example output response is as follows: ```{totalMeetings: <Number>}```
  
## How to run
  1. git clone the project
  2. cd meeting-application
  3. npm i
  4. npm start
  5. Go to http://localhost:3000 to see UI interface
