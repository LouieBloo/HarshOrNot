
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

module.exports = async(request)=>{
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    throw({ error: errors.mapped() });
  }

  return matchedData(request);
}
