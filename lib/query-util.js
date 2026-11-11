import { sparqlEscapeUri } from 'mu';

const parseSparqlResults = (data) => {
  if (!data) return;
  const vars = data.head.vars;
  return data.results.bindings.map((binding) => {
    const obj = {};
    vars.forEach((varKey) => {
      if (binding[varKey]) {
        obj[varKey] = binding[varKey].value;
      }
    });
    return obj;
  });
};

const constructRelationPath = function (pathArray) {
  const sparqlPath = pathArray.map(p => {
    let uri = sparqlEscapeUri(p.uri);
    if (p.inverse) {
      uri = '^' + uri;
    }
    return uri;
  });
  return sparqlPath.join(' / ');
};

export {
  parseSparqlResults,
  constructRelationPath
};
