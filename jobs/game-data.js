const bsgData = require('./update-bsg-data');
const updateGameData = require('./update-game-data');
const updateTranslations = require('./update-translations');
const updateTypes = require('./update-types');

module.exports = async () => {
    try {
        console.log('Running bsgData...');
        await bsgData();
        console.log('Completed bsgData...');
    } catch (updateError){
        console.error(updateError);

        return false;
    }

    try {
        console.log('Running updateGameData...');
        await updateGameData();
        console.log('Completed updateGameData...');
    } catch (updateError){
        console.error(updateError);

        return false;
    }

    try {
        console.log('Running updateTranslations...');
        await updateTranslations();
        console.log('Completed updateTranslations...');
    } catch (updateError){
        console.error(updateError);
    }

    try {
        console.log('Running updateTypes...');
        await updateTypes();
        console.log('Completed updateTypes...');
    } catch (updateError){
        console.error(updateError);
    }

    // Possibility to POST to a Discord webhook here with cron status details
    console.log(`Process completed`);
    process.exit(0);
}