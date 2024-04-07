const Maintenance = require('../models/maintenance');
const { HttpCodes, Messages } = require('../helpers/static');

const applicationStatus = async (req, res) => {
  try {
    const appStatus = await Maintenance.findOne();
    const b2cStatus = appStatus.b2c;
    if (appStatus) {
      return res.status(HttpCodes.Ok).json({ underMaintenance: b2cStatus });
    }
    res.status(HttpCodes.NotFound).json({ message: Messages.NoDataFound });
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({ message: Messages.InternalServerError });
  }
};

module.exports = {
  applicationStatus,
};
