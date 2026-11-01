import Game from "./components/Game.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import "./App.css";

function App() {
    return (
        <main className="app">
            {/* Decorative animated vocabulary in the page background. */}
            <div className="floating-words" aria-hidden="true">
                <span className="float-word float-word-one">UNJUMBLE</span>
                <span className="float-word float-word-two">THINK</span>
                <span className="float-word float-word-three">PLAY</span>
                <span className="float-word float-word-four">WORD UP</span>
                <span className="float-word float-word-five">SCRAMBLE</span>
                <span className="float-word float-word-six">PUZZLE</span>
                <span className="float-word float-word-seven">BRAIN</span>
                <span className="float-word float-word-eight">SOLVE IT</span>
                <span className="float-word float-word-nine">LETTERS</span>
                <span className="float-word float-word-ten">GUESS</span>
                <span className="float-word float-word-eleven">RIDDLE</span>
                <span className="float-word float-word-twelve">MIX IT UP</span>
                <span className="float-word float-word-thirteen">THINK FAST</span>
                <span className="float-word extra-word extra-word-one">WORD PLAY</span>
                <span className="float-word extra-word extra-word-two">BRAIN TEASER</span>
                <span className="float-word extra-word extra-word-three">UNSCRAMBLE</span>
                <span className="float-word extra-word extra-word-four">VOCAB</span>
                <span className="float-word extra-word extra-word-five">WORD HUNT</span>
                <span className="float-word extra-word extra-word-six">SHUFFLE</span>
                <span className="float-word extra-word extra-word-seven">QUICK THINK</span>
                <span className="float-word extra-word extra-word-eight">A B C</span>
                <span className="float-word extra-word extra-word-nine">FIND THE WORD</span>
                <span className="float-word extra-word extra-word-ten">LETTER MIX</span>
                <span className="float-word extra-word extra-word-eleven">PUZZLE TIME</span>
                <span className="float-word extra-word extra-word-twelve">WORD WIZ</span>
                <span className="float-word mid-word mid-word-one">JUMBLE</span>
                <span className="float-word mid-word mid-word-two">THINK</span>
                <span className="float-word mid-word mid-word-three">MIX IT UP</span>
                <span className="float-word mid-word mid-word-four">GUESS</span>
                <span className="float-word mid-word mid-word-five">REARRANGE</span>
                <span className="float-word mid-word mid-word-six">FIND THE WORD</span>
                <span className="float-word mid-word mid-word-seven">WORD GAME</span>
                <span className="float-word mid-word mid-word-eight">SOLVE</span>
            </div>
            <div className="app-layout">
                <aside className="leaderboard-side">
                    <Leaderboard />
                </aside>

                <section className="game-side">
                    <Game />
                </section>
            </div>
        </main>
    );
}

export default App;