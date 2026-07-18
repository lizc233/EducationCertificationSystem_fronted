import { get } from './http';

export function fetchMajors() {
  return get('/lookups/majors');
}

export function fetchGrades() {
  return get('/lookups/grades');
}

export function fetchClasses() {
  return get('/lookups/classes');
}

export function fetchCourses() {
  return get('/lookups/courses');
}

export function fetchSemesters() {
  return get('/lookups/semesters');
}

export function fetchProgramVersions() {
  return get('/lookups/program-versions');
}

export function fetchGraduationRequirements() {
  return get('/lookups/graduation-requirements');
}

export function fetchCourseObjectives() {
  return get('/lookups/course-objectives');
}
