const SIGNFLOW_GRAPH = 'http://mu.semte.ch/graphs/system/signing';
const SIGNFLOW_STATUSES = {
  MARKED: 'http://themis.vlaanderen.be/id/handtekenstatus/f6a60072-0537-11ee-bb35-ee395168dcf7',
  PREPARED: 'http://themis.vlaanderen.be/id/handtekenstatus/1dd296c2-053a-11ee-bb35-ee395168dcf7',
  TO_BE_APPROVED: 'http://themis.vlaanderen.be/id/handtekenstatus/2fd72150-0538-11ee-bb35-ee395168dcf7',
  TO_BE_SIGNED: 'http://themis.vlaanderen.be/id/handtekenstatus/47508452-0538-11ee-bb35-ee395168dcf7',
  SIGNED: 'http://themis.vlaanderen.be/id/handtekenstatus/29d4e7d2-0539-11ee-bb35-ee395168dcf7',
  REFUSED: 'http://themis.vlaanderen.be/id/handtekenstatus/3128aae6-0539-11ee-bb35-ee395168dcf7',
  CANCELED: 'http://themis.vlaanderen.be/id/handtekenstatus/2d043722-053a-11ee-bb35-ee395168dcf7',
}
const SIGN_FLOW_TYPE = "http://mu.semte.ch/vocabularies/ext/handtekenen/Handtekenaangelegenheid";
const SIGN_FLOW_SUBCASE_PREDICATE = "http://mu.semte.ch/vocabularies/ext/handtekenen/doorlooptHandtekening";
const STATUS_PREDICATE = "http://www.w3.org/ns/adms#status";

const SUBCASE_ACTIVITY_PREDICATES = {
  MARKING_ACTIVITY: "http://mu.semte.ch/vocabularies/ext/handtekenen/markeringVindtPlaatsTijdens",
  PREPARATION_ACTIVITY: "http://mu.semte.ch/vocabularies/ext/handtekenen/voorbereidingVindtPlaatsTijdens",
  SIGNING_ACTIVITIES: "http://mu.semte.ch/vocabularies/ext/handtekenen/handtekeningVindtPlaatsTijdens",
  APPROVAL_ACTIVITIES: "http://mu.semte.ch/vocabularies/ext/handtekenen/goedkeuringVindtPlaatsTijdens",
  REFUSAL_ACTIVITIES: "http://mu.semte.ch/vocabularies/ext/handtekenen/weigeringVindtPlaatsTijdens",
  CANCELLATION_ACTIVITY: "http://mu.semte.ch/vocabularies/ext/handtekenen/annulatieVindtPlaatsTijdens",
  COMPLETION_ACTIVITY: "http://mu.semte.ch/vocabularies/ext/handtekenen/afrondingVindtPlaatsTijdens"
};

module.exports = {
  SIGNFLOW_GRAPH,
  SIGNFLOW_STATUSES,
  SIGN_FLOW_TYPE,
  SIGN_FLOW_SUBCASE_PREDICATE,
  STATUS_PREDICATE,
  SUBCASE_ACTIVITY_PREDICATES
};