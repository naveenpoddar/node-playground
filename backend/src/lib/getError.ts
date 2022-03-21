export function getError(error: any) {
  return error.response && error.response.data.error
    ? error.response.data.error
    : error.message;
}
