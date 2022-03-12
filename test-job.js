jobName = process.argv[2];

const jobModule = require(`./jobs/${jobName}`);
console.log(`Running ${jobName}`);

jobModule();
