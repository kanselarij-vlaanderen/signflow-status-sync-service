import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';

import * as deltaUtil from './lib/delta-util';
import { SUBCASE_ACTIVITY_PREDICATES } from './config';
import { syncStatusForSignSubcase } from './lib/status-sync-util';

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
  const pathUpdates = deltaUtil.filterByPredicate(insertionDeltas, updateablePredicates);
  if (pathUpdates.length) {
    console.log(`Received deltas for ${pathUpdates.length} activities that might imply a change in status for their signflow.`);
  }
  for (const d of pathUpdates) {
    const signSubcaseUri = d.subject.value;
    await syncStatusForSignSubcase(signSubcaseUri);
  }
});

app.use(errorHandler);