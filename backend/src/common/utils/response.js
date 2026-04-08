export function success(res, data, statusCode = 200) {
  return res.status(statusCode).json(data);
}

export function created(res, data) {
  return res.status(201).json(data);
}

export function noContent(res) {
  return res.status(204).send();
}
