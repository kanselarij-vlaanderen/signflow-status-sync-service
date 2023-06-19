# Signflow status sync service

The status of a signflow in Kaleidos is derived from the existence of activities on its subcases.

Because this is unpractical to work with in queries that require filtering on status, we added a redundant `adms:status` property to `sign:Handtekenaangelegenheid`.

This service acts as a reasoner, and keeps the signflow statuses up-to-date.

# Installation

Use the following in docker-compose.yml

```
  signflow-status-sync:
    image: kanselarij/signflow-status-sync-service:0.0.3
    restart: always
```

When deploying this on an existing stack, run `one-off-migrations/sync-signing-statuses.sparql` once.

Use following snippet in delta-notifier config:
```js
{
  match: {
    predicate: {
      type: 'uri',
      value: 'http://mu.semte.ch/vocabularies/ext/handtekenen/markeringVindtPlaatsTijdens'
    }
  },
  callback: {
    url: 'http://signflow-status-sync/delta',
    method: 'POST'
  },
  options: {
    resourceFormat: 'v0.0.1',
    gracePeriod: 5000,
    ignoreFromSelf: true
  }
},
{
  match: {
    predicate: {
      type: 'uri',
      value: 'http://mu.semte.ch/vocabularies/ext/handtekenen/voorbereidingVindtPlaatsTijdens'
    }
  },
  callback: {
    url: 'http://signflow-status-sync/delta',
    method: 'POST'
  },
  options: {
    resourceFormat: 'v0.0.1',
    gracePeriod: 5000,
    ignoreFromSelf: true
  }
},
{
  match: {
    predicate: {
      type: 'uri',
      value: 'http://mu.semte.ch/vocabularies/ext/handtekenen/handtekeningVindtPlaatsTijdens'
    }
  },
  callback: {
    url: 'http://signflow-status-sync/delta',
    method: 'POST'
  },
  options: {
    resourceFormat: 'v0.0.1',
    gracePeriod: 5000,
    ignoreFromSelf: true
  }
},
{
  match: {
    predicate: {
      type: 'uri',
      value: 'http://mu.semte.ch/vocabularies/ext/handtekenen/goedkeuringVindtPlaatsTijdens'
    }
  },
  callback: {
    url: 'http://signflow-status-sync/delta',
    method: 'POST'
  },
  options: {
    resourceFormat: 'v0.0.1',
    gracePeriod: 5000,
    ignoreFromSelf: true
  }
},
{
  match: {
    predicate: {
      type: 'uri',
      value: 'http://mu.semte.ch/vocabularies/ext/handtekenen/weigeringVindtPlaatsTijdens'
    }
  },
  callback: {
    url: 'http://signflow-status-sync/delta',
    method: 'POST'
  },
  options: {
    resourceFormat: 'v0.0.1',
    gracePeriod: 5000,
    ignoreFromSelf: true
  }
},
{
  match: {
    predicate: {
      type: 'uri',
      value: 'http://mu.semte.ch/vocabularies/ext/handtekenen/annulatieVindtPlaatsTijdens'
    }
  },
  callback: {
    url: 'http://signflow-status-sync/delta',
    method: 'POST'
  },
  options: {
    resourceFormat: 'v0.0.1',
    gracePeriod: 5000,
    ignoreFromSelf: true
  }
},
{
  match: {
    predicate: {
      type: 'uri',
      value: 'http://mu.semte.ch/vocabularies/ext/handtekenen/afrondingVindtPlaatsTijdens'
    }
  },
  callback: {
    url: 'http://signflow-status-sync/delta',
    method: 'POST'
  },
  options: {
    resourceFormat: 'v0.0.1',
    gracePeriod: 5000,
    ignoreFromSelf: true
  }
}
```

## Available endpoints

#### POST /delta

Internal endpoint for receiving deltas from the [delta-notifier](https://github.com/mu-semtech/delta-notifier)
