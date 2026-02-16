# 技能五子棋 — Skill Gomoku

A chaotic, skill-based twist on the classic Gomoku (Five in a Row) board game, inspired by the viral Chinese skit "技能五子棋". Two players take turns on a 15x15 grid — but each has **four devastating skills** to turn the tide!

> *"普通五子棋就是五个棋子连成一条线 多无聊啊"*
> *"但是技能五子棋加上了技能 多好玩啊 要爆炸"*

## Games

- **[Classic Gomoku](index.html)** — Traditional 15x15 Connect 5
- **[Skill Gomoku](skill-gomoku.html)** — The full chaotic experience with skills!

## How to Play Skill Gomoku

1. Open `skill-gomoku.html` in any modern browser (no server needed)
2. **Black goes first** — click intersections to place pieces
   - Black uses **circles** ●, White uses **squares** ◻ for distinction
3. Get **5 in a row** (horizontal, vertical, or diagonal) to win
4. **Use skills** to counter your opponent's threats!

## The Four Skills

Each player can use each skill **once per game** — high-stakes drama! Skills are available when the opponent has a threat (3+ in a row) or has placed a piece.

| Skill | Chinese | Effect |
|-------|---------|--------|
| **Flying Sand & Rolling Stones** | 飞沙走石 | Remove up to 5 enemy pieces from the board — pieces "fly into Shicha Lake" |
| **Pulling Up Mountains** | 力拔山兮 | Flip the entire board upside-down or mirrored, scrambling all positions |
| **Still as Still Water** | 静如止水 | Freeze a 5x5 zone for 2 turns — opponent can't place there |
| **Time Reversal** | 时光倒流 | Undo the opponent's last 3 moves — reverse time itself! |

## Features

- Single-file HTML5 — no dependencies, no build step
- HTML5 Canvas rendering with smooth animations
- Web Audio API sound effects and chiptune melody
- SpeechSynthesis chanting when skills activate
- Particle effects, screen shake, confetti on win
- Responsive design (desktop & mobile touch support)
- Score tracking across games
- Share button (#SkillGomoku)

## Classic Gomoku

The original `index.html` provides a clean, traditional Gomoku experience:
- 15x15 board with wooden appearance
- Undo (button or Ctrl+Z)
- Score tracking
- Responsive layout
