const axios = require('axios');
require('dotenv').config();
const qnaAccessedModel = require('../models/qnaAccessed'); // brings qna from ai
const summaryModel = require('../models/summaryAccessed');
const sumbmitQnAModel = require('../models/submitQnA'); //gives easy medium hard in array
const chatQueryModel = require('../models/chatQuery');
const Events = require('../models/events');
const Content = require('../models/content');
const PopularContent = require('../models/popular');
const History = require('../models/history');
const prof = require('../models/prof');
const TokenPassbook = require('../models/tokenPassbook');
const { HttpCodes, Messages } = require('../helpers/static');

const readEvents = async (req, res) => {
  try {
    const userId = req.query.userId;
    const readEvents = await Events.find({ userId });
    res.status(HttpCodes.Ok).json(readEvents);
  } catch (error) {
    console.error(error);
    res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
};

const deleteEvents = async (req, res) => {
  try {
    const eventId = req.query.id;
    const deletedEvent = await Events.findOneAndDelete({ _id: eventId });

    if (!deletedEvent) {
      return res.status(HttpCodes.NotFound).json({ message: Messages.NoDataFound });
    }

    return res.status(HttpCodes.Ok).json({ message: Messages.DataDeletedSuccess });
  } catch (error) {
    console.error(error);
    return res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
  }
};

const ProfileInfo = async (req, res) => {
  try {
    req.send = users.email;
    let { users } = req.body;
    let userInfo = req.body;
    res.json(userInfo);
    console.log('Retrived user info');
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: Messages.InternalServerError,
    });
  }
};

const summary = async (req, res) => {
  try {
    console.log('api is hit');
    const assignedCode = req.query.assignedCode;
    const SUMMARYURL = process.env.SUMMARYURL + '/' + assignedCode;
    const response = await axios.post(SUMMARYURL);
    const userId = req.decoded_token.clientId;
    const summaryData = req.body;
    const currentDate = new Date();
    const isoDate = currentDate.toISOString();
    const customFormattedDate = currentDate.toLocaleString();
    console.log('SummaryData', summaryData);
    console.log('Summery');
    console.log('assignedcode', assignedCode);
    console.log(response.data);
    const responseObj = {
      // sumData: summaryData,
      usercode: userId,
      date: customFormattedDate,
      contentcode: assignedCode,
      content: response.data,
    };
    await summaryModel.insertMany(responseObj);

    const ans = await Content.findOne({ assigned_code: assignedCode });
    console.log(ans, 'ansssssssssss');
    console.log(ans.title, 'title');
    // Check if the content has been recently viewed
    const recentlyViewed = await History.findOne({ userId: userId, assigned_code: assignedCode });
    if (recentlyViewed) {
      // If the record exists, update it with the current time
      recentlyViewed.viewedAt = new Date();

      await recentlyViewed.save();
    } else {
      // If the record doesn't exist, create a new History document
      const newHistory = new History({
        userId: userId,
        title: ans.title,
        type: ans.type,
        viewedAt: new Date(),
        assigned_code: assignedCode,
        contentUrl: ans.contentUrl,
      });

      await newHistory.save();
    }
    // Save the new History document to the database

    const existingContent = await PopularContent.findOne({
      userId: userId,
      assigned_code: assignedCode,
    });

    if (!existingContent) {
      // If the record doesn't exist, insert a new record with viewCount as 1
      const newContent = new PopularContent({
        userId: userId,
        title: ans.title,
        type: ans.type,
        contentUrl: ans.contentUrl,
        assigned_code: assignedCode,
        viewCount: 1,
      });

      const savedPopularContent = await newContent.save();
      console.log(savedPopularContent, 'savedPopularContent');
    }

    // console.log(ans, "ans")
    res.json(responseObj);
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: Messages.InternalServerError,
    });
  }
};
const chatbot = async (req, res) => {
  try {
    const userId = req.decoded_token.clientId;
    if (!req.query.assignedCode) {
      return res.status(HttpCodes.BadRequest).json({ error: Messages.BadRequest });
    }
    const assignedCode = req.query.assignedCode;
    if (!req.body.query || req.body.query.trim() === '') {
      const chatbotGetUrl = process.env.CHATBOTURL + '/' + assignedCode + '/' + userId;
      const getResponse = await axios.get(chatbotGetUrl);
      const currentDate = new Date();
      const customFormattedDate = currentDate.toLocaleString();
      const responseObj = {
        date: customFormattedDate,
        userID: userId,
        assignedCode: assignedCode,
        result: getResponse.data,
      };
      return res.status(HttpCodes.Ok).json(responseObj);
    }

    const user = await prof.findOne({ id: userId });
    if (user.tokenBalance < 1) {

      return res.status(HttpCodes.BadRequest).json({ noBalance: true, error: Messages.NoTokenBalance });
    }
    const chatbotUrl = `${process.env.CHATBOTURL}/${assignedCode}/${userId}`;
    const response = await axios.post(chatbotUrl, req.body);

    if (response.status != 200) {
      return res.status(HttpCodes.InternalServerError).json({ error: Messages.InternalServerError });
    }

    if (response.data.lastChatId) {
     const balanceAfterDeduct= user.tokenBalance -= 1;
      await user.save();
      const tokenPassbookEntry = new TokenPassbook({
        segmentId: response.data.lastChatId,
        segmentType: 'chat',
        userId: userId,
        transactionType: 'debit',
        balanceAfter:balanceAfterDeduct,
        description:assignedCode,
        amount: 1,
      });
      await tokenPassbookEntry.save();

    }
    const currentDate = new Date();
    const customFormattedDate = currentDate.toLocaleString();
    const responseObj = {
      date: customFormattedDate,
      userID: userId,
      assignedCode: assignedCode,
      result: response.data,
    };
    res.status(HttpCodes.Ok).json(responseObj);
  } catch (error) {
    console.log(error, 'error from catch block');
    res.status(HttpCodes.InternalServerError).json({
      message: Messages.InternalServerError,
      error,
    });
  }
};
// const chatbot = async (req, res) => {
//   try {
//     const userId = req.decoded_token.clientId;
//     if (!req.query.assignedCode) {
//       return res.status(HttpCodes.BadRequest).json({ error: 'No assigned code found' });
//     }
//     const assignedCode = req.query.assignedCode;

//     recommendedQnaUrl = `${process.env.RECOMMENDEDQNAURL}?assigned_code=${assignedCode}`;
//     if (req.body.question_id) {
//         const question_id = req.body.question_id;
//         const recommendedQnaResponse = await axios.post(recommendedQnaUrl, { question_id, userId });
//         if(recommendedQnaResponse && recommendedQnaResponse.data.data){
//           const currentDate = new Date();
//           const customFormattedDate = currentDate.toLocaleString();
//           const responseObj = {
//             date: customFormattedDate,
//             userID: userId,
//             assignedCode: assignedCode,
//             result: recommendedQnaResponse.data.data,
//           };
//           return res.status(HttpCodes.Ok).json(responseObj);
//         }
//         return res.status(HttpCodes.BadRequest).json({ error: 'No answer found' });
//     }

//     if (!req.body.query || req.body.query.trim() === '') {
//       const chatbotGetUrl = process.env.CHATBOTURL + '/' + assignedCode + '/' + userId;
//       const getResponse = await axios.get(chatbotGetUrl);
//       const currentDate = new Date();
//       const customFormattedDate = currentDate.toLocaleString();
//       const responseObj = {
//         date: customFormattedDate,
//         userID: userId,
//         assignedCode: assignedCode,
//         result: getResponse.data,
//       };
//       return res.status(HttpCodes.Ok).json(responseObj);
//     }
//     const user = await prof.findOne({ id: userId });
//     if (user.tokenBalance < 1) {
//       return res.status(HttpCodes.BadRequest).json({ noBalance: true, error: 'No token balance' });
//     }

//     const chatbotUrl = process.env.CHATBOTURL + '/' + assignedCode + '/' + userId;
//     const response = await axios.post(chatbotUrl, req.body);

//     if (response.status !== 200) {
//       return res.status(HttpCodes.InternalServerError).json({ error: 'Answer generation failed' });
//     }

//     if (response.data.lastChatId) {
//       user.tokenBalance -= 1;
//       await user.save();
//       const tokenPassbookEntry = new TokenPassbook({
//         segmentId: response.data.lastChatId,
//         segmentType: 'chat',
//         userId: userId,
//         transactionType: 'debit',
//         amount: 1,
//       });
//       await tokenPassbookEntry.save();
//     }
//     const currentDate = new Date();
//     const customFormattedDate = currentDate.toLocaleString();
//     const responseObj = {
//       date: customFormattedDate,
//       userID: userId,
//       assignedCode: assignedCode,
//       result: response.data,
//     };
//     res.status(HttpCodes.Ok).json(responseObj);
//   } catch (error) {
//     res.status(HttpCodes.InternalServerError).json({
//       error: Messages.InternalServerError,
//     });
//   }
// };

const chat_questions = async (req, res) => {
  try {
    const assignedCode = req.query.assignedCode;
    const userId = req.query.userId;
    const chatUrl = process.env.CHATQUESTIONS + '/' + assignedCode;
    const response = await axios.get(chatUrl);
    const currentDate = new Date();
    const customFormattedDate = currentDate.toLocaleString();
    const responseObj = {
      usercode: userId,
      contentcode: assignedCode,
      date_Time: customFormattedDate,
      content: response.data,
    };
    await chatQueryModel.insertMany(responseObj);
    res.json(responseObj);
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: Messages.InternalServerError,
    });
  }
};

const qna = async (req, res) => {
  try {
    const userId = req.query.userId;
    // const userId = req.decoded_token.clientId;
    const assignedCode = req.query.assignedCode;
    const level = req.query.level;
    const currentDate = new Date();
    const customFormattedDate = currentDate.toLocaleString();
    console.log('assignedcode', assignedCode);
    console.log('Level', level);
    const qnaUrl = process.env.QNAURL + '/' + assignedCode + '/' + level;
    const response = await axios.get(qnaUrl);
    console.log('Retrived question and answers');
    console.log('hi', response.data);
    const responseObj = {
      usercode: userId,
      date: customFormattedDate,
      contentcode: assignedCode,
      content: response.data,
      level: level,
    };
    await qnaAccessedModel.insertMany(responseObj);
    res.json(responseObj);
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: Messages.InternalServerError,
    });
  }
};

const submitQna = async (req, res) => {
  try {
    const assignedCode = req.query.assignedCode;
    const userId = req.decoded_token.clientId;
    const qnaData = req.body;
    const contentcode = req.query;
    const currentDate = new Date();
    const isoDate = currentDate.toISOString();
    const customFormattedDate = currentDate.toLocaleString();

    console.log('assigned code', assignedCode);
    console.log('qna data', qnaData);
    const responseObj = {
      usercode: userId,
      contentcode: assignedCode,
      dateTime: currentDate,
      easy: qnaData.easy,
      medium: qnaData.medium,
      hard: qnaData.hard,
    };
    console.log(responseObj, 'responseObj');
    await sumbmitQnAModel.insertMany(responseObj);
    res.json(responseObj);
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: Messages.InternalServerError,
    });
  }
};

async function pdfTranscriptions(req, res, next) {
  try {
    const urlPDF = process.env.PDFURL;
    const pdfResponse = await axios.get(urlPDF);
    const data = pdfResponse.data;
    console.log('pdf transactions data', data);
    res.send(data);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    res.status(HttpCodes.InternalServerError).send(Messages.InternalServerError);
  }
}

const videoTranscriptions = async (req, res) => {
  try {
    const videoUrl = process.env.videoUrl;
    const response = await axios.get(videoUrl);
    console.log('Retrived Video Transcriptions');
    res.json({ result: response.data });
    console.log(response.data);
  } catch (error) {
    res.status(HttpCodes.InternalServerError).json({
      error: Messages.InternalServerError,
    });
  }
};

const getPdf = async (req, res, next) => {
  try {
    const assignedCode = req.query.assignedCode;
    const pdfURL = `${process.env.FETCHPDF}?id=${assignedCode}.pdf`;
    console.log(pdfURL);
    const payload = await axios.get(pdfURL, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${assignedCode}+.pdf`);
    console.log(payload);
    res.send(payload.data);
  } catch (error) {    
    console.log('\n :::error.message:::', error.message);
    res.status(HttpCodes.InternalServerError).json({
      error: true,
      success: false,
      errorMessage: Messages.InternalServerError,
    });
  }
};

const getSummaryByAssignedCode = async (req, res) => {
  if(!req.body.assigned_code){
    return res.status(HttpCodes.BadRequest).json({
      error: Messages.UserCodeNotFound,
    });
  }
  const assigned_code = req.body.assigned_code;
  const summaryFetched = await Content.findOne({ assigned_code });
  if (!summaryFetched) {
    return res.status(HttpCodes.NotFound).json({
      error: Messages.NoDataFound,
    });
  }
  res.status(HttpCodes.Ok).json({success:true, message: Messages.DataRetrievedSuccess, data: summaryFetched })
};

const recommendationSearch = async (req, res) => {
  try {
    const { query } = req.body;
    const encodedQuery = encodeURIComponent(query);

    let youtubeData, googleData = []

    const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&key=${process.env.YOUTUBE_SEARCH_KEY}`
    const youtubeResponse = await axios.get(youtubeSearchUrl)
    youtubeData = youtubeResponse.data.items.slice(0,2)

    const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodedQuery}`;
    const googleResponse = await axios.get(googleSearchUrl);
    if(googleResponse.data.searchInformation.totalResults !== "0"){
      googleData = googleResponse.data.items.slice(0, 2);
    } 

    let googleDataMapped, youtubeDataMapped = []

    youtubeDataMapped = youtubeData.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
    }));

    googleDataMapped = googleData.map((item) => ({
      link: item.link,
      title: item.htmlTitle,
      displayLink: item.displayLink,
    }));

    const responseObj = {
      success: true,
      message: Messages.DataRetrievedSuccess,
      data: [
        { source: 'google', data_list: googleDataMapped },
        { source: 'youtube', data_list: youtubeDataMapped },
      ],
    };

    res.send(responseObj);
  } catch (error) {
    console.log(error.message);
    res.status(HttpCodes.InternalServerError).json({
      error: Messages.InternalServerError,
    });
  }
};


module.exports = {
  summary,
  videoTranscriptions,
  pdfTranscriptions,
  chat_questions,
  chatbot,
  qna,
  submitQna,
  ProfileInfo,
  readEvents,
  deleteEvents,
  getPdf,
  getSummaryByAssignedCode,
  recommendationSearch,
};
