// script used by Actions to run cron jobs

jobName = process.argv[2];

const jobModule = require(`./jobs/${jobName}`);
console.log(`Running ${jobName}`);

jobModule();
