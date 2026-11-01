export const notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found' });
export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500, message = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join('. '); }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  else if (err.code === 11000) { status = 409; message = 'That already exists'; }
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message: status === 500 ? 'Something went wrong on our side' : message });
};
