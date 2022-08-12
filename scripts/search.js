import http from 'k6/http';
import { group, sleep } from 'k6';
import {
  makeGraphQLQuery,
  processResponse,
  searchTestQueries,
  uri,
  params,
  graphqlEndpoint,
} from './utils/helpers.js';
/* 
The test starts with 0 vitual users and ramp up from 0 to max concurrent user count gradually
each user would perform a random request according to the assigned distribution for each search type
*/
// TEST SCRIPT CONFIGS
const thresholds = JSON.parse(open('options/thresholds/search.json'));
export const options = {
  scenarios: {
    search_performance_test: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 30,
      maxDuration: '32m',
    },
  },
  thresholds,
};
// TEST SCRIPT IN-IT FUNCTION
export function setup() {
  console.log('Search Performance Test - Instance: ' + uri);
}
// TEST SCRIPT
export default function () {
  // REGULAR QUERIES
  group('regular', function () {
    const searchQueries = searchTestQueries.regular;
    searchQueries.forEach((searchQuery) => {
      const searchType = searchQuery.type;
      const tags = { tag: { [searchType]: 'regular' } };
      const body = makeGraphQLQuery('search', searchQuery.query);
      const res = http.post(graphqlEndpoint, body, params, tags);
      processResponse(res, tags);
      sleep(0.5);
    });
  });
  // EXPENSIVE QUERIES
  group('expensive', function () {
    const searchQueries = searchTestQueries.expensive;
    searchQueries.forEach((searchQuery) => {
      const searchType = searchQuery.type;
      const tags = { tag: { [searchType]: 'expensive' } };
      const body = makeGraphQLQuery('search', searchQuery.query);
      const res = http.post(graphqlEndpoint, body, params, tags);
      processResponse(res, tags);
      sleep(0.5);
    });
  });
}