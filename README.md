# tarkov-crons ⏰

cronjobs to manage the Tarkov mysql database

## About 💡

In order to get data from the primary Tarkov mysql server to the API, we run cronjobs that sync data from the database to the cloudflare kv workers.

These cronjobs run in GitHub actions and their schedules can be found in the section below.

## Schedules 📆

|  Name  |  Cron  |  Status  |
|---|---|---|
| check-scans | `20 * * * *`  | [![check-scans](https://github.com/the-hideout/tarkov-crons/actions/workflows/check-scans.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/check-scans.yml) |
| update-cache  | `*/5 * * * *`  | [![update-cache](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-cache.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-cache.yml) |
| update-reset-timers  | `*/5 * * * *`  | [![update-reset-timers](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-reset-timers.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-reset-timers.yml) |
| update-barters |`*/5 * * * *` | [![update-barters](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-barters.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-barters.yml) |
| update-crafts | `*/5 * * * *` | [![update-crafts](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-crafts.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-crafts.yml) |
| update-hideout | `*/5 * * * *` | [![update-hideout](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-hideout.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-hideout.yml) |
| update-quests | `*/5 * * * *` | [![update-quests](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-quests.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-quests.yml) |
| update-existing-bases | `*/5 * * * *` | TODO |
| game-data | `*/5 * * * *` | TODO |
| update-historical-prices | `*/5 * * * *` | TODO |
| update-item-properties | `15 * * * *` | TODO |
| update-trader-prices | `45 * * * *` | TODO |
| update-currency-prices | `0 3,15 * * *` | TODO |
| clear-checkouts | `5 */6 * * *` | TODO |
| verify-wiki | `5 9 * * *` | TODO |

## Example 📸

Below is an example of a cron that can be adapted as needed:

```yaml
name: <cron-name>

on:
  push:
    branches: [main] # Run the job on commits to main
  schedule:
    - cron: "*/5 * * * *" # Every 5 minutes is the quickest GitHub supports

jobs:
  <cron-name>:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: <cron-name>
        run: docker-compose up --build --exit-code-from tarkov-cron
        env:
          TARKOV_CRON: <cron-name> # the name of the script in the ./jobs folder to run
          CLOUDFLARE_TOKEN: ${{ secrets.CLOUDFLARE_TOKEN }}
          MYSQL_USERNAME: ${{ secrets.PSCALE_USER }}
          MYSQL_PASSWORD: ${{ secrets.PSCALE_PASS }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```
