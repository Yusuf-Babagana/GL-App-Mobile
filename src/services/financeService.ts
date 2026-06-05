import { apiRequest } from './apiClient';
import { debug } from './debug';

export async function fetchDataPlans(networkId?: string) {
  const query = networkId ? `?service_id=${networkId}` : '?service_id=all';
  const res = await apiRequest<any>(`/finance/data/plans/${query}`);

  debug.plans.raw(res);
  debug._raw('[fetchDataPlans] res keys:', Object.keys(res || {}));
  debug._raw('[fetchDataPlans] res.plans:', res?.plans);

  if (!res || typeof res !== 'object') {
    debug.plans.error('response is not an object');
    return [];
  }

  const plans = res.results ?? res.plans;
  if (!plans) {
    debug.plans.error('response has neither "results" nor "plans" key — keys are: ' + Object.keys(res).join(', '));
    return [];
  }

  if (!Array.isArray(plans)) {
    debug.plans.error(`plans is not an array — type=${typeof plans} value=${JSON.stringify(plans).slice(0, 200)}`);
    return [];
  }

  return plans;
}

export function fetchDataHistory() {
  return apiRequest<any>('/finance/data/history/');
}
