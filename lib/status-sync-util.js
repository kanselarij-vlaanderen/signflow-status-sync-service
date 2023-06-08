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
      (COALESCE (?markingActivity, 0) AS ?markingActivity)
      (COALESCE (?preparationActivity, 0) AS ?preparationActivity)
      (COUNT(?signingActivity) AS ?signingActivities)
      (COUNT(?approvalActivity) AS ?approvalActivities)
      (COUNT(?refusalActivity) AS ?refusalActivities)
      (COALESCE (?cancellationActivity, 0) AS ?cancellationActivity)
      (COALESCE (?completionActivity, 0) AS ?completionActivity)
    WHERE {
      GRAPH ${sparqlEscapeUri(SIGNFLOW_GRAPH)} {
        ?signflow a ${sparqlEscapeUri(SIGN_FLOW_TYPE)} ;
                  ${sparqlEscapeUri(SIGN_FLOW_SUBCASE_PREDICATE)} ${sparqlEscapeUri(signSubcaseUri)} .
        OPTIONAL { ?signflow ${sparqlEscapeUri(STATUS_PREDICATE)} ?oldStatus . }
        OPTIONAL { ?markingActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.MARKING_ACTIVITY)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?preparationActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.PREPARATION_ACTIVITY)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?signingActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.SIGNING_ACTIVITIES)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?approvalActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.APPROVAL_ACTIVITIES)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?refusalActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.REFUSAL_ACTIVITIES)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?cancellationActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.CANCELLATION_ACTIVITY)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?completionActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.COMPLETION_ACTIVITY)} ${sparqlEscapeUri(signSubcaseUri)} . }
      }
    }
  }
  BIND (
    IF(?refusalActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.REFUSED)},
      IF(?cancellationActivity != 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.CANCELED)},
        IF(?completionActivity != 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.SIGNED)},
          IF(?signingActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.TO_BE_SIGNED)},
            IF(?approvalActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.TO_BE_APPROVED)},
              IF(?preparationActivity != 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.PREPARED)},
                IF(?markingActivity != 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.MARKED)}, ?oldStatus)
              )
            )
          )
        )
      )
    ) AS ?newStatus
  )
}
  `;
  await updateSudo(queryString);
}

module.exports = {
  syncStatusForSignSubcase
};