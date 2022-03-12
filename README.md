# tarkov-crons ⏰

cronjobs to manage the Tarkov mysql database

## About 💡

In order to get data from the primary Tarkov mysql server to the API, we run cronjobs that sync data from the database to the cloudflare kv workers.

These cronjobs run in GitHub actions and their schedules can be found in the section below.

## Schedules 📆

- check-scans: `20 * * * *`
- update-cache: `*/5 * * * *`
- update-reset-timers: `*/5 * * * *`
- update-barters: `*/5 * * * *`
- update-crafts: `1-59/5 * * * *`
- update-hideout: `2-59/5 * * * *`
- update-quests: `3-59/5 * * * *`
- update-existing-bases: `4-59/5 * * * *`
- game-data: `*/5 * * * *`
- update-historical-prices: `5-59/15 * * * *`
- update-item-properties: `15 * * * *`
- update-trader-prices: `45 * * * *`
- update-currency-prices: `0 3,15 * * *`
- clear-checkouts: `5 */6 * * *`
- verify-wiki: `5 9 * * *`

## Example 📸

Below is an example of a cron that can be adapted as needed:

```yaml
name: <cron-name>

on:
  push:
      branches: [ main ] # Run the job on commits to main
  schedule:
    - cron: "*/5 * * * *" # Every 5 minutes is the quickest GitHub supports

jobs:
  <cron-name>:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: <cron-name>
        run: docker-compose up --build
        env:
          TARKOV_CRON: <cron-name> # the name of the script in the ./jobs folder to run
          CLOUDFLARE_TOKEN: ${{ secrets.CLOUDFLARE_TOKEN }}
          MYSQL_USERNAME: ${{ secrets.PSCALE_USER }}
          MYSQL_PASSWORD: ${{ secrets.PSCALE_PASS }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```
