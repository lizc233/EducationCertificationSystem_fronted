import { get } from './http';

export function fetchTeachingTasks(params) {
  return get('/teaching/tasks', params);
}
