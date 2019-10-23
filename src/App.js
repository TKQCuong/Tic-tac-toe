import React, { useState, useEffect } from "react";
import "./App.css";
import FacebookLogin from "react-facebook-login";

// Set up board with 9 spares (done)

// user can make the move (first is O)
//  - identify the squares (DONE)
//  - place an X when click on square (DONE)
//  - place X and then O in every turn (DONE, IF GAME[ID] % 2 = 'O')
//  - stop the user from placing into existing one (done)

// Decide the outcome
//   - if run out of square => create useState default false -> no more square -> true (done)
//   - if someone win (done)

// Render UI status of WIN and DRAW

// Render UI

function refreshPage() {
  window.location.reload();
}

function App() {
  const [gameOver, setGameOver] = useState(false);
  const [game, setGame] = useState(new Array(9).fill(null));
  const [winner, setWinner] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScore, setCurrentScore] = useState([]);

  // console.log("game", game);
  // console.log(gameOver, winner);

  const responseFacebook = resp => {
    setCurrentUser({
      name: resp.name,
      mail: resp.email,
    });
  };


  const postData = async () => {
    let data = new URLSearchParams();
    data.append("player", currentUser.name);
    data.append("score",  -1000);
    const response = await fetch(
      "https://ftw-highscores.herokuapp.com/tictactoe-dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: data.toString()
      }
    );
    const resp = await response.json();
    console.log("show", resp);
    getData();
  };

  const getData = async () => {
    const url = "https://ftw-highscores.herokuapp.com/tictactoe-dev";
    const response = await fetch(url);
    const data = await response.json();
    console.log("all players", data);
    setCurrentScore(data.items);
  };

  useEffect(() => {
    getData();
  }, []);

  console.log(currentUser);
  return (
    <div className="App">
      {!currentUser ? (
        <FacebookLogin
          autoLoad={true}
          appId="440454326588939"
          fields="name,email,picture"
          callback={resp => responseFacebook(resp)}
        />
      ) : (
        <>
          {gameOver ? (
            <h2 className="result">Result: <span >{winner}</span></h2>
          ) : (
            <span className="result"></span>        
          )}
          <Game
            game={game}
            setGame={setGame}
            gameOver={gameOver}
            setGameOver={setGameOver}
            setWinner={setWinner}
          />
          <br></br>
          <button className="restart" onClick={() => refreshPage()}>
            Restart
          </button>{" "}
          <div className="top-score">
            <h2>Top Score</h2>
            {currentScore.map(el => (
              <li>
                <u>{el.player}</u> <span>achieved a score of:  </span>
                <b>{el.score}</b>
              </li>
            ))}
            {/* <button className="post-button" onClick={() => postData()}>POST</button> */}
          </div>
        </>
      )}
    </div>
  );
}
//arr.slice([begin[, end]])
function Game(props) {
  const displayClick = id => {
    if (props.gameOver) return;
    let game = props.game.slice();
    let check = game.filter(el => el === null);

    // can only choose when square is blank (null)
    if (game[id] === null) {
      game[id] = check.length % 2 ? "O" : "X";
    }
    // run out of squares -> game over
    if (game.filter(el => el === null).length === 0) {
      props.setGameOver(true);
    }
    props.setGame(game);

    //someone win -> game over
    if (decideOutcome(game)) {
      props.setWinner(decideOutcome(game));
      props.setGameOver(true);
    }
  };

  return (
    <div className="game">
      {props.game.map((el, idx) => {
        return <Square value={el} id={idx} displayClick={displayClick} />;
      })}
    </div>
  );
}

//props.id = index of Game
function Square(props) {
  return (
    <div className="square" onClick={() => props.displayClick(props.id)}>
      {props.value}
    </div>
  );
}

function decideOutcome(game) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    let [a, b, c] = lines[i];
    if (game[a] && game[a] === game[b] && game[a] === game[c]) return game[a];
  }
  return null;
}

export default App;
