/**
 * User: bhagyashri.bhutada
 */
const
    express = require('express'),
    app = express(),
    meetingsRouter = require('./routes/meetings.routes'),
    {httpServer, mongodbConfig} = require('./serverConfig'),
    database = require('./database/index'),
    {formatPromiseResult} = require('./utils');


/**
 * Immediately invoking async method which does all the standard server startup routine.
 */
(async () =>{
    let
        err,
        result;

    // --------------------- 1. Add all the required express middleware ---------------------
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(`${process.cwd()}/client`));

    app.use('/meetings', meetingsRouter);
    // ---------------------------- 1. END -------------------------------------------------

    // -------------------- 2. initialize database -----------------------------------------
    [err] = await formatPromiseResult( database.init(mongodbConfig) );

    if( err ) {
        console.log(`Failed to connect to mongodb. Error: ${err.stack || err}. Stopping server...`);
        process.exit(1);
    }

    console.log(`Connected to database: ${mongodbConfig.dbName}`);
    // -------------------- 2. END --------------------------------------------------------


    // ------------------- 3. Start Http Server -------------------------------------------
    await new Promise((resolve, reject) => {
            app.listen(httpServer.port, () => {
                resolve();
            });
          });

    console.log(`Server is listening on port = ${httpServer.port}`);
    // -------------------- 3. END -------------------------------------------------------
})();