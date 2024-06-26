function getResponse(status_code, message, data) {
    return {
      status_code: status_code,
      message: message,
      data: data,
    };
  }
  
  module.exports = { getResponse };
  