const Order = require('../models/order');
const { HttpCodes, Messages } = require('../helpers/static');

const orderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orderDetails = await Order.findOne({ orderId });
    if(orderDetails){
        return res.status(HttpCodes.Ok).json({ orderDetails });
    }
    res.status(HttpCodes.NotFound).json({ message: Messages.NoDataFound });
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};

module.exports = {
  orderDetails,
};
