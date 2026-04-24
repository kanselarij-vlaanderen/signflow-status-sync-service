import { app, errorHandler } from 'mu';
import bodyParser from 'body-parser';
import cron from 'node-cron';

import * as deltaUtil from './lib/delta-util';
import { ALLOWED_DELTA_SIZE, ACTIVITY_PREDICATES, SUBCASE_ACTIVITY_PREDICATES } from './config';
import { syncStatusForSignSubcase, syncAllSignflowStatuses } from './lib/status-sync-util';
import { fetchSignSubcaseUri } from './lib/fetch-subcase';

const CRON_PATTERN = process.env.CRON_PATTERN || '0 0 * * *';

cron.schedule(CRON_PATTERN, async () => {
  try {
    console.log(`[cron] Running signflow status sync (pattern: ${CRON_PATTERN})...`);
    await syncAllSignflowStatuses();
    console.log('[cron] Signflow status sync completed.');
  } catch (err) {
    console.trace(err);
  }
});

app.post('/run', async (req, res, next) => {
  try {
    console.log('Running signflow status sync...');
    await syncAllSignflowStatuses();
    console.log('Signflow status sync completed.');
    return res.status(200).send({ message: 'Signflow status sync completed.' });
  } catch (err) {
    console.trace(err);
    const error = new Error(err.message || 'Something went wrong while running signflow status sync.');
    error.status = 500;
    return next(error);
  }
});

app.post('/delta', bodyParser.json({ limit: ALLOWED_DELTA_SIZE }), async (req, res) => {
  console.log(req)
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
