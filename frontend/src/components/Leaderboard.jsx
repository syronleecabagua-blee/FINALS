import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/gameService";

const TOPICS = [
    ["tech", "Tech"],
    ["general", "General"],
    ["science", "Science"]
];

const DIFFICULTIES = [
    ["easy", "Easy"],
    ["hard", "Hard"],
    ["superhard", "Super Hard"]
];

const RANK_CLASSES = ["rank-gold", "rank-silver", "rank-bronze"];

function Leaderboard() {
    const [topic, setTopic] = useState("tech");
    const [difficulty, setDifficulty] = useState("easy");
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                const data = await getLeaderboard(difficulty, topic);

                if (!cancelled && data.success) {
                    setLeaderboard(data.leaderboard);
                    setError("");
                }
            } catch (err) {
                console.error(err);

                if (!cancelled) {
                    setError("Unable to load leaderboard.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        run();

        const handleScoreSaved = () => {
            setLoading(true);
            setRefreshKey((key) => key + 1);
        };

        window.addEventListener("leaderboard:score-saved", handleScoreSaved);

        return () => {
            cancelled = true;
            window.removeEventListener("leaderboard:score-saved", handleScoreSaved);
        };
    }, [difficulty, topic, refreshKey]);

    function changeDifficulty(value) {
        setLoading(true);
        setDifficulty(value);
    }

    function changeTopic(value) {
        setLoading(true);
        setTopic(value);
    }

    return (
        <div className="leaderboard-card">
            <div className="leaderboard-header">
                <div className="leaderboard-title">
                    <span className="leaderboard-icon">#</span>
                    <h2>Leaderboard</h2>
                </div>
            </div>

            <div className="leaderboard-tabs topic-tabs">
                {TOPICS.map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        className={topic === value ? "active" : ""}
                        onClick={() => changeTopic(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="leaderboard-tabs difficulty-tabs">
                {DIFFICULTIES.map(([value, label]) => (
                    <button
                        key={value}
                        className={difficulty === value ? "active" : ""}
                        onClick={() => changeDifficulty(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="leaderboard-message">Loading leaderboard...</div>
            ) : error ? (
                <div className="leaderboard-message error">{error}</div>
            ) : leaderboard.length === 0 ? (
                <div className="leaderboard-message">No scores yet for {difficulty}!</div>
            ) : (
                <div className="leaderboard-list">
                    {leaderboard.map((player, index) => (
                        <div
                            className={`leaderboard-row ${index < 3 ? "top-player" : ""}`}
                            key={player.id}
                        >
                            <div className={`rank ${RANK_CLASSES[index] ?? "rank-normal"}`}>
                                #{index + 1}
                            </div>

                            <div className="player-info">
                                <strong>{player.playerName}</strong>
                            </div>

                            <div className="player-score">
                                <strong>{player.score}</strong>
                                <span>pts</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Leaderboard;
