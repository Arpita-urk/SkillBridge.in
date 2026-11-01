export class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const CATEGORIES = ['Development', 'Design', 'Data', 'Marketing', 'Languages', 'Music', 'Writing', 'Business', 'Other'];
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
