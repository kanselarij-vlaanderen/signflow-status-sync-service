import { updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';
import { SIGNFLOW_GRAPH, SIGN_FLOW_TYPE, STATUS_PREDICATE, SIGN_FLOW_SUBCASE_PREDICATE, SUBCASE_ACTIVITY_PREDICATES, SIGNFLOW_STATUSES } from '../config';

async function syncStatusForSignSubcase (signSubcaseUri) {

  const queryString = `
DELETE {
  GRAPH ${sparqlEscapeUri(SIGNFLOW_GRAPH)} {
    ?signflow ${sparqlEscapeUri(STATUS_PREDICATE)} ?oldStatus .
  }
}
INSERT {
  GRAPH ${sparqlEscapeUri(SIGNFLOW_GRAPH)} {
    ?signflow ${sparqlEscapeUri(STATUS_PREDICATE)} ?newStatus .
  }
}
WHERE {
  {
    SELECT ?signflow ?oldStatus
      COALESCE (?markingActivity, 0) AS ?markingActivity
      COALESCE (?preparationActivity, 0) AS ?preparationActivity
      COUNT(?signingActivity) AS ?signingActivities
      COUNT(?approvalActivity) AS ?approvalActivities
      COUNT(?refusalActivity) AS ?refusalActivities
      COALESCE (?cancellationActivity, 0) AS ?cancellationActivity
      COALESCE (?completionActivity, 0) AS ?completionActivity
    WHERE {
      GRAPH ${sparqlEscapeUri(SIGNFLOW_GRAPH)} {
        ?signflow a ${sparqlEscapeUri(SIGN_FLOW_TYPE)} ;
                  ${sparqlEscapeUri(SIGN_FLOW_SUBCASE_PREDICATE)} ${sparqlEscapeUri(signSubcaseUri)} .
        OPTIONAL { ?signflow ${sparqlEscapeUri(STATUS_PREDICATE)} ?oldStatus . }
        OPTIONAL { ?markingActivity ${sparqlEscapeUri(signSubcaseUri)} ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.MARKING_ACTIVITY)} . }
        OPTIONAL { ?preparationActivity ${sparqlEscapeUri(signSubcaseUri)} ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.PREPARATION_ACTIVITY)} . }
        OPTIONAL { ?signingActivity ${sparqlEscapeUri(signSubcaseUri)} ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.SIGNING_ACTIVITIES)} . }
        OPTIONAL { ?approvalActivity ${sparqlEscapeUri(signSubcaseUri)} ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.APPROVAL_ACTIVITIES)} . }
        OPTIONAL { ?refusalActivity ${sparqlEscapeUri(signSubcaseUri)} ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.REFUSAL_ACTIVITIES)} . }
        OPTIONAL { ?cancellationActivity ${sparqlEscapeUri(signSubcaseUri)} ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.CANCELLATION_ACTIVITY)} . }
        OPTIONAL { ?completionActivity ${sparqlEscapeUri(signSubcaseUri)} ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.COMPLETION_ACTIVITY)} . }
      }
    }
  }
  BIND (
    IF(?refusalActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.REFUSED)},
      IF(?completionActivity != 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.SIGNED)},
        IF(?signingActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.TO_BE_SIGNED)},
          IF(?approvalActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.TO_BE_APPROVED)},
            IF(?preparationActivity != 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.PREPARED)},
              IF(?markingActivity != 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.MARKED)}, ?oldStatus)
            )
          )
        )
      )
    ) AS ?newStatus
  )
}
  `;
  console.log(queryString);
  await updateSudo(queryString);
}

module.exports = {
  syncStatusForSignSubcase
};