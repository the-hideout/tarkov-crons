# tarkov-crons ⏰

cronjobs to manage the Tarkov mysql database

## About 💡

In order to get data from the primary Tarkov mysql server to the API, we run cronjobs that sync data from the database to the cloudflare kv workers.

These cronjobs run in GitHub actions and their schedules can be found in the section below.

## Schedules 📆

|  Name  |  Cron  |  Status  |
|---|---|---|
| update-cache  | `*/10 * * * *`  | [![update-cache](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-cache.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-cache.yml) |
| update-reset-timers  | `*/10 * * * *`  | [![update-reset-timers](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-reset-timers.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-reset-timers.yml) |
| update-barters |`*/10 * * * *` | [![update-barters](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-barters.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-barters.yml) |
| update-crafts | `*/10 * * * *` | [![update-crafts](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-crafts.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-crafts.yml) |
| update-hideout | `*/10 * * * *` | [![update-hideout](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-hideout.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-hideout.yml) |
| update-quests | `*/10 * * * *` | [![update-quests](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-quests.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-quests.yml) |
| update-existing-bases | `*/10 * * * *` | [![update-existing-bases](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-existing-bases.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-existing-bases.yml) |
| update-historical-prices | `*/10 * * * *` | [![update-historical-prices](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-historical-prices.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-historical-prices.yml) |
| game-data | `*/15 * * * *` | [![game-data](https://github.com/the-hideout/tarkov-crons/actions/workflows/game-data.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/game-data.yml) |
| update-currency-prices | `0 3,15 * * *` | [![update-currency-prices](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-currency-prices.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-currency-prices.yml) |
| verify-wiki | `5 9 * * *` | [![verify-wiki](https://github.com/the-hideout/tarkov-crons/actions/workflows/verify-wiki.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/verify-wiki.yml) |
| update-item-properties | `15 * * * *` | [![update-item-properties](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-item-properties.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-item-properties.yml) |
| update-trader-prices | `45 * * * *` | [![update-trader-prices](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-trader-prices.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-trader-prices.yml) |
| check-scans | `20 * * * *`  | [![check-scans](https://github.com/the-hideout/tarkov-crons/actions/workflows/check-scans.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/check-scans.yml) |
| clear-checkouts | `5 */6 * * *` | [![clear-checkouts](https://github.com/the-hideout/tarkov-crons/actions/workflows/clear-checkouts.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/clear-checkouts.yml) |
| update-prices-tm | `30 * * * *` | [![clear-checkouts](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-prices-tm.yml/badge.svg)](https://github.com/the-hideout/tarkov-crons/actions/workflows/update-prices-tm.yml) |

## Example 📸

Below is an example of a cron that can be adapted as needed:

```yaml
name: <cron-name>

on:
  push:
    branches: [main] # Run the job on commits to main
  schedule:
    - cron: "*/10 * * * *" # Every 5 minutes is the quickest GitHub supports

jobs:
  <cron-name>:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: satackey/action-docker-layer-caching@46d2c640b1d8ef50d185452ad6fb324e6bd1d052 # pin@v0.0.11
        continue-on-error: true
      - name: <cron-name>
        run: docker-compose up --build --exit-code-from tarkov-cron
        env:
          TARKOV_CRON: <cron-name> # the name of the script in the ./jobs folder to run
          CLOUDFLARE_TOKEN: ${{ secrets.CLOUDFLARE_TOKEN }}
          PSCALE_USER: ${{ secrets.PSCALE_USER }}
          PSCALE_PASS: ${{ secrets.PSCALE_PASS }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## Local Testing 🧪

To test locally, it is highly suggested to use Docker (and docker-compose) as this is what runs in CI with GitHub Actions

Setup:

- Install [Docker](https://docs.docker.com/get-docker/)
- Install [docker-compose](https://docs.docker.com/compose/install/)

Run the following commands in a bash terminal to setup your environment variables correctly:

```bash
export CLOUDFLARE_TOKEN=<token>
export PSCALE_USER=<planetscale-username>
export PSCALE_PASS=<planetscale-password>
export AWS_ACCESS_KEY_ID=<aws-access-key-id>
export AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
export WEBHOOK_URL=<discord-webhook-url> # optional
```

Run:

```bash
TARKOV_CRON=update-hideout docker-compose up --build
```

The syntax of the command above can be explained as follows:

```bash
TARKOV_CRON=<cron-command-to-run> docker-compose up --build
```

> Where `<cron-command-to-run>` is the name of a script in the `./jobs` folder
