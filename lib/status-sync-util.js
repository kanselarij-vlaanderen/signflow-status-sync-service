import { updateSudo } from '@lblod/mu-auth-sudo';
import { sparqlEscapeUri } from 'mu';
import { SIGNFLOW_GRAPH, SIGN_FLOW_TYPE, STATUS_PREDICATE, SIGN_FLOW_SUBCASE_PREDICATE, SUBCASE_ACTIVITY_PREDICATES, SIGNFLOW_STATUSES, ACTIVITY_PREDICATES } from '../config';

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
      (COUNT(?markingActivity) AS ?markingActivities)
      (COUNT(?preparationActivity) AS ?preparationActivities)
      (COUNT(?signingStartDate) AS ?signingStartDates)
      (COUNT(?approvalStartDate) AS ?approvalStartDates)
      (COUNT(?refusalActivity) AS ?refusalActivities)
      (COUNT(?cancellationActivity) AS ?cancellationActivities)
      (COUNT(?completionActivity) AS ?completionActivities)
    WHERE {
      GRAPH ${sparqlEscapeUri(SIGNFLOW_GRAPH)} {
        ?signflow a ${sparqlEscapeUri(SIGN_FLOW_TYPE)} ;
                  ${sparqlEscapeUri(SIGN_FLOW_SUBCASE_PREDICATE)} ${sparqlEscapeUri(signSubcaseUri)} .
        OPTIONAL { ?signflow ${sparqlEscapeUri(STATUS_PREDICATE)} ?oldStatus . }
        OPTIONAL { ?markingActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.MARKING_ACTIVITY)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?preparationActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.PREPARATION_ACTIVITY)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL {
          ?signingActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.SIGNING_ACTIVITIES)} ${sparqlEscapeUri(signSubcaseUri)} .
          ?signingActivity ${sparqlEscapeUri(ACTIVITY_PREDICATES.START_DATE)} ?signingStartDate .
        }
        OPTIONAL {
          ?approvalActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.APPROVAL_ACTIVITIES)} ${sparqlEscapeUri(signSubcaseUri)} .
          ?approvalActivity ${sparqlEscapeUri(ACTIVITY_PREDICATES.START_DATE)} ?approvalStartDate .
        }
        OPTIONAL { ?refusalActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.REFUSAL_ACTIVITIES)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?cancellationActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.CANCELLATION_ACTIVITY)} ${sparqlEscapeUri(signSubcaseUri)} . }
        OPTIONAL { ?completionActivity ${sparqlEscapeUri(SUBCASE_ACTIVITY_PREDICATES.COMPLETION_ACTIVITY)} ${sparqlEscapeUri(signSubcaseUri)} . }
      }
    }
  }
  BIND (
    IF(?refusalActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.REFUSED)},
      IF(?cancellationActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.CANCELED)},
        IF(?completionActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.SIGNED)},
          IF(?signingStartDates > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.TO_BE_SIGNED)},
            IF(?approvalStartDates > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.TO_BE_APPROVED)},
              IF(?preparationActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.PREPARED)},
                IF(?markingActivities > 0, ${sparqlEscapeUri(SIGNFLOW_STATUSES.MARKED)}, ?oldStatus)
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
