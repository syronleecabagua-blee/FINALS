const words = require("../data/words");
const hints = require("../data/hints");
const db = require("../config/database");

const VALID_TOPICS = Object.keys(words);
const VALID_DIFFICULTIES = ["easy", "hard", "superhard"];

const wordPools = {};

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

function getNextWord(topic, difficulty) {
    const key = `${topic}.${difficulty}`;

    if (!wordPools[key] || wordPools[key].length === 0) {
        wordPools[key] = shuffle(words[topic][difficulty]);
    }

    return wordPools[key].pop();
}

function scrambleWord(word) {
    let scrambled = word;

    while (scrambled === word && word.length > 1) {
        scrambled = shuffle(word.split("")).join("");
    }

    return scrambled;
}

function validateSelection(res, topic, difficulty) {
    if (!VALID_TOPICS.includes(topic)) {
        res.status(400).json({ success: false, message: "Invalid topic." });
        return false;
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
        res.status(400).json({ success: false, message: "Invalid difficulty." });
        return false;
    }

    if (!words[topic][difficulty] || words[topic][difficulty].length === 0) {
        res.status(400).json({
            success: false,
            message: "No words found for this topic and difficulty."
        });
        return false;
    }

    return true;
}

function getRandomWord(req, res) {
    const topic = req.query.topic || "tech";
    const difficulty = req.query.difficulty || "easy";

    if (!validateSelection(res, topic, difficulty)) {
        return;
    }

    const word = getNextWord(topic, difficulty);
    const hint = hints[topic]?.[difficulty]?.[word] || "Think about what this word is related to.";

    res.json({
        success: true,
        word,
        scrambledWord: scrambleWord(word),
        hint,
        topic,
        difficulty
    });
}

function checkAnswer(req, res) {
    const { word, answer } = req.body;

    if (!word || !answer) {
        return res.status(400).json({
            success: false,
            correct: false,
            message: "Please provide an answer."
        });
    }

    const correct = word.trim().toLowerCase() === answer.trim().toLowerCase();

    res.json({ success: true, correct });
}

function saveScore(req, res) {
    const { playerName, score, difficulty, topic = "tech" } = req.body;

    if (
        !playerName ||
        score === undefined ||
        !difficulty ||
        !VALID_TOPICS.includes(topic)
    ) {
        return res.status(400).json({
            success: false,
            message: "Player name, score, and difficulty are required."
        });
    }

    const sql = `
        INSERT INTO scores
        (player_name, score, difficulty, topic)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            score = VALUES(score),
            created_at = CURRENT_TIMESTAMP
    `;

    db.query(sql, [playerName.trim(), score, difficulty, topic], (error) => {
        if (error) {
            console.error("Error saving score:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to save score."
            });
        }

        res.json({ success: true, message: "Score saved successfully!" });
    });
}

function getLeaderboard(req, res) {
    const difficulty = req.query.difficulty || "easy";
    const topic = req.query.topic || "tech";

    if (!validateSelection(res, topic, difficulty)) {
        return;
    }

    const sql = `
        SELECT
            id,
            player_name AS playerName,
            score,
            difficulty,
            topic
        FROM scores
        WHERE difficulty = ? AND topic = ?
        ORDER BY score DESC, created_at ASC
        LIMIT 10
    `;

    db.query(sql, [difficulty, topic], (error, results) => {
        if (error) {
            console.error("Error getting leaderboard:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to load leaderboard."
            });
        }

        res.json({
            success: true,
            difficulty,
            topic,
            leaderboard: results
        });
    });
}

module.exports = {
    getRandomWord,
    checkAnswer,
    saveScore,
    getLeaderboard
};
