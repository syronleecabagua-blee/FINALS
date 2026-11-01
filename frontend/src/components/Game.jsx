import { useEffect, useRef, useState } from "react";
import { checkAnswer, getNewWord, saveScore, getLeaderboard } from "../services/gameService";

const CORRECT_MEMES = [
    "/memes/correct/correct1.jpg",
    "/memes/correct/correct2.jpg",
    "/memes/correct/correct3.jpg",
    "/memes/correct/correct4.jpg",
    "/memes/correct/correct5.jpg"
];

const WRONG_MEMES = [
    "/memes/wrong/wrong1.jpg",
    "/memes/wrong/wrong2.jpg",
    "/memes/wrong/wrong3.jpg",
    "/memes/wrong/wrong4.jpg",
    "/memes/wrong/wrong5.jpg"
];

const CONGRATS_VIDEO = "/videos/congrats/cong1.mp4";

const TOPICS = [
    ["tech", "Tech & Programming"],
    ["general", "General Knowledge"],
    ["science", "Science"]
];

const DIFFICULTIES = [
    ["easy", "Easy"],
    ["hard", "Hard"],
    ["superhard", "Super Hard"]
];

const SKIP_LIMITS = {
    easy: 1,
    hard: 2,
    superhard: 3
};

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function getSkipLimit(difficulty) {
    return SKIP_LIMITS[difficulty] ?? SKIP_LIMITS.easy;
}

function Game() {
    const answerInputRef = useRef(null);
    const nextWordTimer = useRef(null);
    const initialLoadRef = useRef(false);
    const congratsVideoRef = useRef(null);
    const backgroundMusicRef = useRef(null);
    const musicWasPlayingRef = useRef(false);

    const [playerName, setPlayerName] = useState("");
    const [difficulty, setDifficulty] = useState("easy");
    const [topic, setTopic] = useState("tech");
    const [word, setWord] = useState("");
    const [scrambledWord, setScrambledWord] = useState("");
    const [answer, setAnswer] = useState("");
    const [hint, setHint] = useState("");
    const [showHint, setShowHint] = useState(false);
    const [usedFreeHints, setUsedFreeHints] = useState(() => new Set());
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [isShowingResult, setIsShowingResult] = useState(false);
    const [resultType, setResultType] = useState("");
    const [resultMeme, setResultMeme] = useState("");
    const [showCongrats, setShowCongrats] = useState(false);
    const [skipsRemaining, setSkipsRemaining] = useState(getSkipLimit("easy"));

    const freeHintKey = `${playerName.trim().toLowerCase()}|${difficulty}|${topic}`;
    const freeHintAvailable = !usedFreeHints.has(freeHintKey);

    function clearResult() {
        setIsShowingResult(false);
        setResultType("");
        setResultMeme("");
    }

    async function loadNewWord(selectedDifficulty = difficulty, selectedTopic = topic) {
        try {
            setLoading(true);

            const data = await getNewWord(selectedDifficulty, selectedTopic);

            if (data.success) {
                setWord(data.word);
                setScrambledWord(data.scrambledWord);
                setHint(data.hint || "");
                setShowHint(false);
                setAnswer("");
                setMessage("");
            }
        } catch (err) {
            console.error(err);
            setMessage("Unable to load a new word.");
        } finally {
            setLoading(false);
        }
    }

    async function checkForTopOne(playerScore) {
        try {
            const data = await getLeaderboard(difficulty, topic);
            const topPlayer = data?.leaderboard?.[0];

            const isTopOne =
                data?.success &&
                topPlayer &&
                topPlayer.playerName?.trim().toLowerCase() === playerName.trim().toLowerCase() &&
                Number(topPlayer.score) === Number(playerScore);

            if (isTopOne) {
                clearResult();
                setShowCongrats(true);
            }
        } catch (err) {
            console.error("Failed to check #1 leaderboard position:", err);
        }
    }

    async function persistScore() {
        await saveScore(playerName, score, difficulty, topic);
        window.dispatchEvent(new Event("leaderboard:score-saved"));
        await checkForTopOne(score);
    }

    useEffect(() => {
        if (!showCongrats || !congratsVideoRef.current) {
            return;
        }

        const video = congratsVideoRef.current;
        video.muted = false;

        video.play().catch((err) => {
            console.warn("Congratulations video autoplay was blocked:", err);
        });
    }, [showCongrats]);

    useEffect(() => {
        if (initialLoadRef.current) {
            return;
        }

        initialLoadRef.current = true;
        loadNewWord("easy");
    }, []);

    useEffect(() => {
        return () => {
            if (nextWordTimer.current) {
                clearTimeout(nextWordTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!word || loading || gameOver || isShowingResult) {
            return;
        }

        requestAnimationFrame(() => {
            answerInputRef.current?.focus();
        });
    }, [word, loading, gameOver, isShowingResult]);

    useEffect(() => {
        if (resultType !== "wrong" || !isShowingResult) {
            return;
        }

        const timer = setTimeout(() => {
            clearResult();
        }, 1500);

        return () => clearTimeout(timer);
    }, [resultType, isShowingResult]);

    useEffect(() => {
        const audio = new Audio("/bgMusic/bgmusic.mp3");

        backgroundMusicRef.current = audio;

        audio.loop = true;
        audio.volume = 0.35;

        const startMusic = async () => {
            if (!audio.paused) return;

            try {
                await audio.play();

                window.removeEventListener("click", startMusic);
                window.removeEventListener("keydown", startMusic);
            } catch {
                // Autoplay may be blocked until user interaction.
            }
        };

        startMusic();

        window.addEventListener("click", startMusic);
        window.addEventListener("keydown", startMusic);

        return () => {
            window.removeEventListener("click", startMusic);
            window.removeEventListener("keydown", startMusic);

            audio.pause();
            audio.currentTime = 0;
            backgroundMusicRef.current = null;
        };
    }, []);
    function handleDifficultyChange(newDifficulty) {
        if (isShowingResult) {
            return;
        }

        setDifficulty(newDifficulty);
        setSkipsRemaining(getSkipLimit(newDifficulty));
        setScore(0);
        setGameOver(false);
        clearResult();
        setMessage("");
        setAnswer("");

        loadNewWord(newDifficulty, topic);
    }

    function handleTopicChange(newTopic) {
        if (isShowingResult) {
            return;
        }

        setTopic(newTopic);
        setScore(0);
        setSkipsRemaining(getSkipLimit(difficulty));

        loadNewWord(difficulty, newTopic);
    }

    async function handleGameOver() {
        setGameOver(true);
        setIsShowingResult(true);
        setMessage("Ahh yuga sala, G lng bawi dason.");

        try {
            await persistScore();
        } catch (err) {
            console.error("Failed to save your score:", err);
            setMessage("Can't save your score.");
        }
    }

    async function handleCheckAnswer() {
        if (isShowingResult || gameOver) {
            return;
        }

        if (!answer.trim()) {
            setMessage("Answer danay hehe.");
            return;
        }

        if (!playerName.trim()) {
            setMessage("Your name please.");
            return;
        }

        try {
            const data = await checkAnswer(word, answer);

            if (data.correct) {
                setScore((previousScore) => previousScore + 1);
                setResultType("correct");
                setResultMeme(randomItem(CORRECT_MEMES));
                setIsShowingResult(true);
                setMessage("Tsakto!");

                nextWordTimer.current = setTimeout(() => {
                    clearResult();
                    loadNewWord(difficulty);
                }, 1500);
            } else {
                setResultType("wrong");
                setResultMeme(randomItem(WRONG_MEMES));
                setIsShowingResult(true);

                await handleGameOver();
            }
        } catch (err) {
            console.error(err);
            setMessage("Hmm something is wrong.");
        }
    }

    async function handleEndGame() {
        if (gameOver || isShowingResult || loading) {
            return;
        }

        if (!playerName.trim()) {
            setMessage("Your name please.");
            return;
        }

        if (nextWordTimer.current) {
            clearTimeout(nextWordTimer.current);
        }

        try {
            await persistScore();

            setGameOver(true);
            clearResult();
            setShowHint(false);
            setMessage("Game ended! Your score has been saved.");
        } catch (err) {
            console.error("Failed to save score:", err);
            setMessage("Can't save your score.");
        }
    }

    function handleSkip() {
        if (isShowingResult || gameOver || loading) {
            return;
        }

        setSkipsRemaining(skipsRemaining - 1);
        setAnswer("");

        loadNewWord(difficulty, topic);
    }

    function handleHint() {
        if (isShowingResult || loading || gameOver || !hint) {
            return;
        }

        if (freeHintAvailable) {
            setUsedFreeHints((previousUsed) => {
                const nextUsed = new Set(previousUsed);
                nextUsed.add(freeHintKey);
                return nextUsed;
            });

            setShowHint(true);
            return;
        }

        if (score <= 0) {
            return;
        }

        setScore((previousScore) => previousScore - 1);
        setShowHint(true);
    }

    function handleRestart() {
        if (nextWordTimer.current) {
            clearTimeout(nextWordTimer.current);
        }

        setScore(0);
        setGameOver(false);
        clearResult();
        setShowCongrats(false);
        setMessage("");
        setAnswer("");
        setSkipsRemaining(getSkipLimit(difficulty));
        setUsedFreeHints(new Set());

        loadNewWord(difficulty, topic);
    }

    function pauseBackgroundMusic() {
        const audio = backgroundMusicRef.current;

        if (audio) {
             musicWasPlayingRef.current = !audio.paused;
            audio.pause();
        }
    }

    function resumeBackgroundMusic() {
        const audio = backgroundMusicRef.current;

        if (!audio) return;

        if (musicWasPlayingRef.current) {
            audio.play().catch((error) => {
                console.warn("Could not resume background music:", error);
            });
        }
    }

    return (
        <div className="game-container">
            <div className="game-card">
                <div className="game-header">
                    <p>WORD SCRAMBLE</p>
                    <h1>Unscramble It!</h1>
                </div>

                <div className="player-score-row">
                    <div className="player-section">
                        <label htmlFor="playerName">Player Name</label>

                        <input
                            id="playerName"
                            type="text"
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={(event) => setPlayerName(event.target.value)}
                            disabled={gameOver}
                        />
                    </div>

                    <div className="compact-score">
                        <span>SCORE</span>
                        <strong>{score}</strong>
                    </div>
                </div>

                <div className="difficulty-section">
                    <div className="difficulty-buttons">
                        {DIFFICULTIES.map(([value, label]) => (
                            <button
                                key={value}
                                className={difficulty === value ? "active" : ""}
                                onClick={() => handleDifficultyChange(value)}
                                disabled={isShowingResult}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="topic-section">
                    <p className="topic-label">TOPIC</p>

                    <div className="topic-buttons">
                        {TOPICS.map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                className={topic === value ? "active" : ""}
                                onClick={() => handleTopicChange(value)}
                                disabled={isShowingResult}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="word-section">
                    <p className="word-label">SCRAMBLED WORD</p>

                    <div className="letters">
                        {loading ? (
                            <div className="loading-word">Loading...</div>
                        ) : (
                            scrambledWord.split("").map((letter, index) => (
                                <div className="letter" key={`${letter}-${index}`}>
                                    {letter.toUpperCase()}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {!gameOver && (
                    <div className="answer-section">
                        <input
                            ref={answerInputRef}
                            type="text"
                            placeholder="Type your answer..."
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleCheckAnswer();
                                }
                            }}
                            disabled={isShowingResult || loading}
                        />

                        <button
                            className="check-button"
                            onClick={handleCheckAnswer}
                            disabled={isShowingResult || loading}
                        >
                            Check Answer
                        </button>
                    </div>
                )}

                {message && (
                    <p className={`message ${resultType === "wrong" ? "wrong" : ""}`}>
                        {message}
                    </p>
                )}

                {!gameOver && (
                    <div className="game-controls">
                        <div className="game-controls-left">
                            <button
                                type="button"
                                className="hint-button"
                                onClick={handleHint}
                                disabled={
                                    isShowingResult ||
                                    loading ||
                                    gameOver ||
                                    !hint ||
                                    (!freeHintAvailable && score <= 0)
                                }
                            >
                                {freeHintAvailable ? "Free Hint" : "Hint -1"}
                            </button>

                            <button
                                type="button"
                                className="skip-button"
                                onClick={handleSkip}
                                disabled={isShowingResult || loading || skipsRemaining <= 0}
                            >
                                Skip
                            </button>

                            <span className="skip-counter">
                                {skipsRemaining} skip{skipsRemaining === 1 ? "" : "s"} left
                            </span>
                        </div>

                        <button
                            type="button"
                            className="end-button"
                            onClick={handleEndGame}
                            disabled={isShowingResult || loading}
                        >
                            End Game
                        </button>
                    </div>
                )}

                {gameOver && (
                    <button className="restart-button" onClick={handleRestart}>
                        ↻ Play Again
                    </button>
                )}
            </div>

            {isShowingResult && resultMeme && (
                <div className="result-popup" role="dialog" aria-modal="true">
                    <img src={resultMeme} alt="" className="result-popup-image" />
                </div>
            )}

            {showCongrats && (
                <div className="congrats-popup" role="dialog" aria-modal="true">
                    <div className="congrats-content">
                        <h2 className="congrats-message">
                            <span className="emoji-left">🎉</span>
                            CONGRATULATIONS!
                            <span className="emoji-right">🎉</span>
                        </h2>

                        <p className="congrats-submessage">you're the #1 on the leaderboard!</p>

                        <video 
                           ref={congratsVideoRef}
                            className="congrats-video"
                            src={CONGRATS_VIDEO}
                            autoPlay
                            playsInline
                            onPlay={pauseBackgroundMusic}
                            onEnded={() => {
                                setShowCongrats(false);
                                resumeBackgroundMusic();
                            }}
                        />
                    </div>
                </div>
            )}

            {showHint && hint && (
                <div className="hint-popup" onClick={() => setShowHint(false)}>
                    <div className="hint-box" onClick={(event) => event.stopPropagation()}>
                        <h3>Hint</h3>

                        <p>{hint}</p>

                        <button type="button" onClick={() => setShowHint(false)}>
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Game;
