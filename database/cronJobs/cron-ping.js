//const cron = require('node-cron');
import cron from 'node-cron';
//const hello = require("../../backend/orm_functions/session_key");


// Schedule tasks to be run on the server every day
cron.schedule('10 * * * * *', function() {
    console.log("hello()");
    console.log('running a task every day');
  });