const Razorpay = require('razorpay');

let _instance = null;

module.exports = new Proxy({}, {
  get(_, prop) {
    if (!_instance) {
      _instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
    return _instance[prop];
  },
});
