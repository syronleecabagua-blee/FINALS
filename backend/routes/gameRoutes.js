const express = require("express");
const router = express.Router();

const {
    getRandomWord,
    checkAnswer,
    saveScore,
    getLeaderboard
} = require("../controllers/gameController");

router.get("/new", getRandomWord);
router.post("/check", checkAnswer);
router.post("/score", saveScore);
router.get("/leaderboard", getLeaderboard);

module.exports = router;