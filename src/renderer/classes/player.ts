import { Card, MAX_HAND_SIZE } from '../constants'

export class Player {
  id: string
  name: string
  hand: Card[]
  cardsTaken: Card[]

  isCpu: boolean = false

  constructor(id: string, name: string, isCpu: boolean = false) {
    this.id = id
    this.name = name
    this.hand = []
    this.cardsTaken = []
    this.isCpu = isCpu
  }

  get drawableCards(): number {
    return MAX_HAND_SIZE - this.hand.length
  }

  reintegrateHand(newCards: Card[]): void {
    console.debug(`[${this.name}] Reintegrating hand with new cards:`, newCards)

    this.hand = [...this.hand, ...newCards]

    console.debug(`[${this.name}] current hand:`, this.hand)
  }

  playCard(card: Card): Card {
    const cardToPlay = this.hand.find((c) => c.id === card.id)

    if (!cardToPlay) {
      throw new Error(
        `[${this.name}] Attempted to play a card not in hand: ${card.id}, current hand: ${this.hand}`
      )
    }

    this.hand = this.hand.filter((c) => c.id !== card.id)

    console.debug(`[${this.name}] Played card:`, cardToPlay)
    console.debug(`[${this.name}] Remaining hand:`, this.hand)

    return cardToPlay
  }
}
