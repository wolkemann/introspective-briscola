import { Card, CARD_DECK, CARD_SUIT } from '../constants'
import { Deck } from './deck'
import { Player } from './player'

enum GAME_PHASE {
  INITIALIZE = 'initialize',
  MAIN = 'main',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export class GameState {
  state: GAME_PHASE
  deck: Deck
  players: Player[]
  activePlayerIndex: number = 0
  cardsOnTheTable: Record<string, Card>
  briscola: CARD_SUIT

  constructor(players: Player[]) {
    this.state = GAME_PHASE.INITIALIZE
    this.deck = new Deck(CARD_DECK)
    this.players = players
    this.cardsOnTheTable = {}
    this.briscola = CARD_SUIT.GOLD
  }

  get playedCards(): Card[] {
    return Object.values(this.cardsOnTheTable)
  }

  get currentPlayer(): Player {
    return this.players[this.activePlayerIndex]
  }

  get allPlayersHavePlayed(): boolean {
    return this.playedCards.length === this.players.length
  }

  get isGameFinished(): boolean {
    return this.deck.cards.length === 0 && this.players.every((player) => player.hand.length === 0)
  }

  getLeadingSuit(playedCards: Card[]): CARD_SUIT {
    const briscolaSuit = playedCards.find((card) => card.suit === this.briscola)?.suit
    if (briscolaSuit) {
      return briscolaSuit
    }

    return playedCards[0].suit
  }

  resolveRoundWinner(): number {
    const playedCards = this.playedCards
    const leadingSuit = this.getLeadingSuit(playedCards)

    const winningCard = playedCards.reduce((bestCard, currentCard) => {
      const bothWithBriscola = bestCard.suit === this.briscola && currentCard.suit === this.briscola
      const bothHaveZeroValue = bestCard.value === 0 && currentCard.value === 0

      if (bothWithBriscola && bothHaveZeroValue) {
        return currentCard.priority < bestCard.priority ? currentCard : bestCard
      }

      if (bothWithBriscola && !bothHaveZeroValue) {
        return currentCard.value > bestCard.value ? currentCard : bestCard
      }

      if (!bothWithBriscola && !bothHaveZeroValue) {
        if (currentCard.suit === leadingSuit && bestCard.suit !== leadingSuit) {
          return currentCard
        }
        if (bestCard.suit === leadingSuit && currentCard.suit !== leadingSuit) {
          return bestCard
        }
        if (currentCard.suit === leadingSuit && bestCard.suit === leadingSuit) {
          return currentCard.value > bestCard.value ? currentCard : bestCard
        }
      }

      if (!bothWithBriscola && bothHaveZeroValue) {
        if (currentCard.suit === leadingSuit && bestCard.suit !== leadingSuit) {
          return currentCard
        }
        if (bestCard.suit === leadingSuit && currentCard.suit !== leadingSuit) {
          return bestCard
        }
        if (currentCard.suit === leadingSuit && bestCard.suit === leadingSuit) {
          return currentCard.priority < bestCard.priority ? currentCard : bestCard
        }
      }

      return bestCard
    }, playedCards[0])

    const winningPlayerId = Object.keys(this.cardsOnTheTable).find(
      (playerId) => this.cardsOnTheTable[playerId].id === winningCard.id
    )
    return this.players.findIndex((player) => player.id === winningPlayerId)
  }

  putCardOnTheTable(playedBy: Player, card: Card): void {
    this.cardsOnTheTable[playedBy.id] = card
  }

  resolveRound(): void {
    if (this.allPlayersHavePlayed) {
      console.debug('[GameState] Resolving round with cards on the table:', this.cardsOnTheTable)

      const winningPlayerIndex = this.resolveRoundWinner()
      this.activePlayerIndex = winningPlayerIndex
      const winningPlayer = this.players[winningPlayerIndex]
      const wonCards = Object.values(this.cardsOnTheTable)
      winningPlayer.cardsTaken = winningPlayer.cardsTaken.concat(wonCards)

      console.debug(
        `[GameState] Round winner: ${winningPlayer.name} with card:`,
        this.cardsOnTheTable[winningPlayer.id]
      )

      this.cardsOnTheTable = {}

      if (this.isGameFinished) {
        this.setGameState(GAME_PHASE.FINISHED)
        this.frame()
        return
      }

      this.players.forEach((player) => {
        if (player.drawableCards > 0) {
          const drawnCards = this.deck.drawCards(1)
          player.reintegrateHand(drawnCards)
        }
      })

      this.setGameState(GAME_PHASE.MAIN)
      this.frame()
    }
  }

  frame(): void {
    switch (this.state) {
      case GAME_PHASE.INITIALIZE: {
        this.deck.shuffle()
        const firstCard = this.deck.drawCards(1)[0]
        this.briscola = firstCard.suit
        this.deck.cards = this.deck.cards.concat(firstCard)
        this.players.forEach((player) => {
          const drawnCards = this.deck.drawCards(3)
          player.reintegrateHand(drawnCards)
        })
        this.setGameState(GAME_PHASE.MAIN)
        break
      }

      case GAME_PHASE.MAIN:
        if (this.allPlayersHavePlayed) break

        if (this.currentPlayer.isCpu) {
          this.setGameState(GAME_PHASE.PLAYING)
          this.frame()
          break
        }
        break

      case GAME_PHASE.PLAYING:
        if (!this.currentPlayer.isCpu) {
          this.activePlayerIndex = 1
        } else if (this.currentPlayer.isCpu) {
          const cardToPlay = this.currentPlayer.hand[0] // For now, just play the first card in hand
          this.currentPlayer.playCard(cardToPlay)
          this.putCardOnTheTable(this.currentPlayer, cardToPlay)

          this.activePlayerIndex = 0 // Reset to the first player after CPU plays
        }

        this.setGameState(GAME_PHASE.MAIN)
        this.frame()
        break
    }
  }

  setGameState(newState: GAME_PHASE): void {
    this.state = newState
  }

  /*
  updateRender(): void {
    if (this.state === GAME_PHASE.FINISHED) {
      const bodyRenderContainer = document.getElementById('renderer')
      if (bodyRenderContainer) {
        bodyRenderContainer.innerHTML = '<h1>Game Over</h1>'
      }
      return
    }
    const player1CardsContainer = document.getElementById('player1-cards')
    const player2CardsContainer = document.getElementById('player2-cards')
    const briscolaContainer = document.getElementById('briscola')
    const cardsOnTableContainer = document.getElementById('cards-on-table')
    const gameStateContainer = document.getElementById('game-messages')
    const resolveButtonContainer = document.getElementById('resolve-button-container')

    if (resolveButtonContainer) {
      resolveButtonContainer.innerHTML = ''
      if (this.playedCards.length === this.players.length) {
        const resolveButton = document.createElement('button')
        resolveButton.textContent = 'Resolve Round'
        resolveButton.addEventListener('click', () => {
          this.resolveRound()
        })
        resolveButtonContainer.appendChild(resolveButton)
      }
    }

    if (player1CardsContainer) {
      player1CardsContainer.innerHTML = ''
      this.players[0].hand.forEach((card) => {
        const cardButton = this.createCardButton(card)
        player1CardsContainer.appendChild(cardButton)
        cardButton.addEventListener('click', () => {
          if (this.playedCards.length === 2) return
          console.debug(`[GameState] Card button clicked: ${card.id}`)
          const player = this.players[0] // Assuming player 1 is the one playing for now
          try {
            const playedCard = player.playCard(card)
            this.putCardOnTheTable(player, playedCard)

            this.setGameState(GAME_PHASE.PLAYING)
            this.frame()
          } catch (error) {
            console.error(error)
          }
        })
      })
    }

    if (player2CardsContainer) {
      player2CardsContainer.innerHTML = this.players[1].hand
        .map((card) => this.createCardButton(card).outerHTML)
        .join('')
    }

    if (briscolaContainer) {
      briscolaContainer.innerHTML = `<p>Briscola: ${this.briscola} | Cards remaining: ${this.deck.cards.length}</p>`
    }

    if (cardsOnTableContainer) {
      const cardsOnTable = Object.values(this.cardsOnTheTable)
      cardsOnTableContainer.innerHTML = `<p>Cards on the table: ${cardsOnTable.map((card) => `${card.name} of ${card.suit}`).join(', ')}</p>`
    }

    if (gameStateContainer) {
      gameStateContainer.innerHTML = `<p>Game messages will go here</p>`
    }
  }

  createCardButton(card: Card): HTMLButtonElement {
    const button = document.createElement('button')
    button.id = card.id
    button.className = 'card'
    button.textContent = `${card.name} of ${card.suit}`

    return button
  } */
}
