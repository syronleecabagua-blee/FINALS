const API_URL = `${import.meta.env.VITE_API_URL}/api`;

async function request(url, options) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}

export function getNewWord(difficulty = "easy", topic = "tech") {
    return request(
        `${API_URL}/game/new?difficulty=${difficulty}&topic=${topic}`
    );
}

export function checkAnswer(word, answer) {
    return request(`${API_URL}/game/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, answer })
    });
}

export function saveScore(playerName, score, difficulty, topic = "tech") {
    return request(`${API_URL}/game/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName, score, difficulty, topic })
    });
}

export function getLeaderboard(difficulty = "easy", topic = "tech") {
    return request(
        `${API_URL}/game/leaderboard?difficulty=${difficulty}&topic=${topic}`
    );
}
