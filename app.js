import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';

import * as deltaUtil from './lib/delta-util';
import { ACTIVITY_PREDICATES, SUBCASE_ACTIVITY_PREDICATES } from './config';
import { syncStatusForSignSubcase } from './lib/status-sync-util';
import { fetchSignSubcaseUri } from './lib/fetch-subcase';

app.post('/delta', bodyParser.json(), async (req, res) => {
  res.status(202).end();
  const insertionDeltas = deltaUtil.insertionDeltas(req.body);
  const deletionDeltas = deltaUtil.deletionDeltas(req.body);
  if (insertionDeltas.length || deletionDeltas.length) {
    console.debug(`Received deltas (${insertionDeltas.length + deletionDeltas.length} total)`);
  } else {
    return; // Empty delta message received on startup?
  }

  // UPDATES in group path (entities need graph-moving)
  let updateablePredicates = [];
  for (const predicate in SUBCASE_ACTIVITY_PREDICATES) {
    if (SUBCASE_ACTIVITY_PREDICATES.hasOwnProperty(predicate)) {
      updateablePredicates.push(SUBCASE_ACTIVITY_PREDICATES[predicate]);
    }
  }
  for (const predicate in ACTIVITY_PREDICATES) {
    if (ACTIVITY_PREDICATES.hasOwnProperty(predicate)) {
      updateablePredicates.push(ACTIVITY_PREDICATES[predicate]);
    }
  }
  const pathUpdates = deltaUtil.filterByPredicate(insertionDeltas, updateablePredicates);
  if (pathUpdates.length) {
    console.log(`Received deltas for ${pathUpdates.length} activities that might imply a change in status for their signflow.`);
  }
  for (const d of pathUpdates) {
    let signSubcaseUri;

    const predicate = d.predicate.value;
    if (Object.values(SUBCASE_ACTIVITY_PREDICATES).includes(predicate)) {
      signSubcaseUri = d.object.value;
    } else {
      signSubcaseUri = await fetchSignSubcaseUri(d.subject.value);
    }

    if (signSubcaseUri) {
      await syncStatusForSignSubcase(signSubcaseUri);
    }
  }
});

app.use(errorHandler);
