const NewestProf = require('../models/prof');
const Coupon = require('../models/coupon');
const Plan = require('../models/plan');
const { HttpCodes, Messages } = require('../helpers/static');

const getTokenUsage = async (req, res, next) => {
    try {
      //If the user specifies year & month
      if (req.query.year && req.query.month) {
        const userId = req.decoded_token.clientId;
        const selectedYear = parseInt(req.query.year, 10);
        const selectedMonth = parseInt(req.query.month, 10);
        const startDate = new Date(`${selectedYear}-${selectedMonth}-01T00:00:00.000Z`);
        const endDate = new Date(new Date(startDate).setMonth(startDate.getMonth() + 1));
        const monthWiseData = await NewestProf.aggregate([
          { $match: { id: userId } },
          {
            $project: {
              tokenUsage: {
                $filter: {
                  input: '$tokenUsage',
                  as: 'usage',
                  cond: {
                    $and: [{ $gte: ['$$usage.date', startDate] }, { $lt: ['$$usage.date', endDate] }],
                  },
                },
              },
            },
          },
        ]);
        if (monthWiseData.length) {
          const { tokenUsage } = monthWiseData[0];
          const selectedMonthTotalUsage = tokenUsage.reduce((total, item) => total + item.tokensUsed, 0);
          res.status(HttpCodes.Ok).json({
            success: true,
            message: Messages.DataRetrievedSuccess,
            data: {
              selectedMonthTotalUsage,
              tokenUsageReport: tokenUsage,
            },
          });
        } else {
          throw new Error(Messages.UserNotFound);
        }
      }
      //If the user need whole usage
      else{
        const userId = req.decoded_token.clientId;
        userData = await NewestProf.findOne({ id: userId }, { tokenUsage: 1 });
        if (userData) {
          const { tokenUsage } = userData;
          const totalUsageTillDate = tokenUsage.reduce((total, item) => total + item.tokensUsed, 0);

          const currentDate = new Date();

          const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

          const previousMonthData = tokenUsage.filter((usage) => {
            const usageDate = new Date(usage.date);
            return usageDate >= startOfLastMonth && usageDate <= endOfLastMonth;
          });

          const previousMonthTotalUsage = previousMonthData.reduce((total, item) => total + item.tokensUsed, 0);

          res.status(HttpCodes.Ok).json({
            success: true,
            message: Messages.DataRetrievedSuccess,
            data: {
              previousMonthTotalUsage,
              totalUsageTillDate,
              tokenUsageReport: tokenUsage,
            },
          });
        } else {
          throw new Error(Messages.UserNotFound);
        }
      }
    } catch (error) {
      return res.status(HttpCodes.InternalServerError).json({
        success: false,
        message: Messages.InternalServerError,
        error: error.message,
      });
    }
  };

const fetchPlan = async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json({ data: plans, message: Messages.DataRetrievedSuccess, success: true });
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: error.message,
      message: Messages.InternalServerError,
      success: true,
    });
  }
};

const couponverify = async (req, res) => {
  try {
    const code = req.body.code;
    const userId = req.decoded_token.clientId;
    const coupon = await Coupon.findOne({ couponCode: code });
    if (!coupon) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.CouponNotFound });
    }

    //     // Check if the coupon is expired
    const currentDate = new Date();
    const expiryDate = new Date(coupon.expiry);
    if (currentDate > expiryDate) {
      return res.status(HttpCodes.BadRequest).json({ message: Messages.CouponExpired });
    }
    // Check if the coupon code is present in the coupon history array
    const profile = await NewestProf.findOne({ id: userId });
    const isCouponPresent = profile?.couponHistory?.includes(code);

    if (isCouponPresent) {
      res.json({
        data: coupon,
        message: Messages.CouponUsed,
        success: true,
      });
    } else {
      res.json({ data: coupon, message: Messages.CouponValid, success: true });
    }
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: error.message,
      message: Messages.CouponNotValid,
      success: false,
    });
  }
};

module.exports = {
  getTokenUsage,
  fetchPlan,
  couponverify,
};
