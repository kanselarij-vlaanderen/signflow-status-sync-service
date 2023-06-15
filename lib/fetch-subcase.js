import { querySudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';
import { APPROVAL_ACTIVITY_TYPE, SIGNFLOW_GRAPH, SIGNING_ACTIVITY_TYPE, SUBCASE_ACTIVITY_PREDICATES } from '../config';
import { parseSparqlResults } from './query-util';

async function fetchSignSubcaseUri (activityUri) {
  const queryString = `
SELECT DISTINCT ?signSubcase
WHERE {
  GRAPH ${sparqlEscapeUri(SIGNFLOW_GRAPH)} {
    VALUES ?activity { ${sparqlEscapeUri(activityUri)} }
    {
      ?activity a ${sparqlEscapeUri(SIGNING_ACTIVITY_TYPE)} .
      ?activity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.SIGNING_ACTIVITIES)} ?signSubcase .
    }
    UNION
    {
      ?activity a ${sparqlEscapeUri(APPROVAL_ACTIVITY_TYPE)} .
      ?activity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.APPROVAL_ACTIVITIES)} ?signSubcase .
    }
  }
}
LIMIT 1
  `;
  const response = await querySudo(queryString);
  const results = parseSparqlResults(response);
  if (results.length) {
    const result = results[0];
    return result.signSubcase;
  }
}

export {
  fetchSignSubcaseUri
};
