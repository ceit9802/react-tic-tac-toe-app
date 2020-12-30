import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={props.isWinningSquare ? 'square square-winner' : "square"} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(r, c) {
    let key = `${r + 1},${c + 1}`;
    let id = r * 3 + c;
    console.log(`id=${id} winningSquares=${this.props.winningSquares} isWinningSquare=${this.props.winningSquares && this.props.winningSquares.includes(id)}`);
    return <Square
      key={key}
      value={this.props.squares[id]}
      onClick={() => this.props.onClick(id)}
      isWinningSquare={this.props.winningSquares && this.props.winningSquares.includes(id)}
    />;
  }

  createTable = () => {
    let table = []
    // Outer loop to create parent
    for (let i = 0; i < 3; i++) {
      let children = []
      //Inner loop to create children
      for (let j = 0; j < 3; j++) {
        children.push(this.renderSquare(i, j))
      }
      table.push(<div key={i} className="board-row" >{children}</div>)
    }
    return table
  }


  render() {
    return (
      <div>
        {this.createTable()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        selectedSquare: null
      }],
      stepNumber: 0,
      xIsNext: true,
      winner: null,
      winningSquares: null,
      moveSortOrder: "asc",
    }
  }
  handleClick(i) {
    if (!this.state.winner) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[history.length - 1];
      const squares = current.squares.slice();

      if (!squares[i]) {
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const [winner, winningSquares] = calculateWinner(squares);
        this.setState({
          history: history.concat([{ squares: squares, selectedSquare: i }]),
          stepNumber: history.length,
          xIsNext: !this.state.xIsNext,
          winner: winner,
          winningSquares: winningSquares,
          moveSortOrder: "asc",
        });
      }


      else {
        console.log("Square is filled already")
      }
    } else {
      console.log("Game completed")
    }
  }
  jumpTo(step) {
    this.setState(
      {
        stepNumber: step,
        xIsNext: (step % 2) === 0,
      });
  }
  resetBoard() {
    this.setState({
      history: [{
        squares: Array(9).fill(null),
        selectedSquare: null
      }],
      stepNumber: 0,
      xIsNext: true,
      winner: null,
      winningSquares: null,
      moveSortOrder: "asc",
    }
    );
  }
  sortMoves() {
    this.setState({
      moveSortOrder: this.state.moveSortOrder === "asc" ? "desc" : "asc",
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const moves = history.map((step, move) => {
      //console.log(`step=${step};move=${move}`);
      const selectedSquare = step.selectedSquare;
      //console.log(step.selectedSquare)
      const row_col = selectedSquare != null ? `(${parseInt(selectedSquare / 3) + 1},${selectedSquare % 3 + 1})` : '';
      const desc = move ? 'Go to move #' + move + ' ' + row_col : 'Go to game start';
      return (
        <li key={move} style={{ fontWeight: this.state.stepNumber === move ? "bold" : "normal" }} id={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>);
    });
    if (this.state.moveSortOrder === "desc") {
      moves.reverse();
    }
    let status;
    if (this.state.winner) {
      status = 'Winner: ' + this.state.winner;
    }
    else {
      let anySquareEmpty = current.squares.filter(x => x === null)
      //console.log(anySquareEmpty);
      if (anySquareEmpty.length === 0) {
        status = "Match drawn"
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={this.state.winningSquares}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol reversed={this.state.moveSortOrder === "asc" ? false : true}>{moves}</ol>
          <button onClick={() => this.resetBoard()}>Reset</button>
          <button onClick={() => this.sortMoves()}>Sort Moves</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);



function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], lines[i]];
    }
  }
  console.log("No winner at this time");
  return [null, null];
}