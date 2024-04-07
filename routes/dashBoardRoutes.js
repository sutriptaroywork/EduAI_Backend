const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const loginCheck = require('../middleware/loginCheck');
const shikshaController = require('../controllers/shikshaController');
const helperController = require('../controllers/helperController');
const aiController = require ('../controllers/aiController');

// GET (Sorted Alphabetically)
router.get('/search',authMiddleware,loginCheck,shikshaController.search);
router.post('/advsearch',authMiddleware,loginCheck,shikshaController.advsearch);
router.get('/menuSubMenu',authMiddleware,loginCheck,shikshaController.menuSubMenu);

router.get('/events', authMiddleware,loginCheck,shikshaController.readEvents);
router.get('/greetings',authMiddleware,loginCheck,shikshaController.greetings);
router.get('/hoursspent', authMiddleware,loginCheck,shikshaController.hoursSpent);
router.get('/overallperformance',authMiddleware,loginCheck,shikshaController.overallPerformance);
router.get('/profile',authMiddleware,loginCheck,shikshaController.readProfile);
router.get('/recentlyviewed',authMiddleware,loginCheck,shikshaController.recentlyViewed);
router.get('/reminder', authMiddleware,loginCheck,shikshaController.readReminder);
router.get('/stickynotes/',authMiddleware,loginCheck,shikshaController.readStickyNotes);
router.get('/todo', authMiddleware,loginCheck,shikshaController.readTodo);
router.get('/user/', authMiddleware,loginCheck,shikshaController.readUser);
router.get('/institute/',authMiddleware,loginCheck,shikshaController.institute);
router.get('/browserclose',authMiddleware,loginCheck,shikshaController.browserclose);

router.get('/videoTranscriptions',authMiddleware,loginCheck,aiController.videoTranscriptions);
router.get('/pdfTranscriptions',authMiddleware,loginCheck,aiController.pdfTranscriptions);
router.get('/qna',authMiddleware,loginCheck,aiController.qna);
router.get('/chat_questions',authMiddleware,loginCheck,aiController.chat_questions);
router.get('/getPdf',aiController.getPdf);
router.post('/summary',authMiddleware,loginCheck,aiController.summary); 
router.post('/chatbot',authMiddleware,loginCheck,aiController.chatbot);
router.post('/chatbot/recommendation',authMiddleware,loginCheck,aiController.recommendationSearch);
router.post('/submitQna',authMiddleware,loginCheck,aiController.submitQna);
router.post('/summary/fetchContent',authMiddleware,loginCheck,aiController.getSummaryByAssignedCode);


// helper controller
router.get('/city',authMiddleware,loginCheck,helperController.citySuggestion);
router.get('/institute',authMiddleware,loginCheck,shikshaController.instituteSuggestion);

// POST (Sorted Alphabetically)
router.post('/reminder',authMiddleware,loginCheck,shikshaController.addReminder);
router.post('/stickynotes',authMiddleware,loginCheck,shikshaController.stickyNotes);
router.post('/subscribe',shikshaController.subscribeEmail);
router.post('/todo',authMiddleware,loginCheck,shikshaController.addTodo);

// PUT (Sorted Alphabetically)
router.put('/stickynotes/',authMiddleware,loginCheck,shikshaController.updateStickyNotes);
router.put('/reminder',authMiddleware,loginCheck,shikshaController.updateReminder);

// DELETE (Sorted Alphabetically)
router.delete('/events',authMiddleware,loginCheck,shikshaController.deleteEvents);
router.delete('/reminder',authMiddleware,loginCheck,shikshaController.deleteReminder); 

router.post('/migrate',shikshaController.migrate)

module.exports = router;