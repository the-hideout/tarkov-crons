# tarkov-crons ⏰

cronjobs to manage the Tarkov mysql database

## Schedules

- check-scans: `20 * * * *`
- update-cache: `* * * * *`
- update-reset-timers: `* * * * *`
- update-barters: `*/5 * * * *`
- update-crafts: `1-59/5 * * * *`
- update-hideout: `2-59/5 * * * *`
- update-quests: `3-59/5 * * * *`
- update-existing-bases: `4-59/5 * * * *`
- game-data: `* * * * *`
- update-historical-prices: `5-59/15 * * * *`
- update-item-properties: `15 * * * *`
- update-trader-prices: `45 * * * *`
- update-currency-prices: `0 3,15 * * *`
- clear-checkouts: `5 */6 * * *`
- verify-wiki: `5 9 * * *`
