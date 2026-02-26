import { Card } from '../constants'

export class Deck {
  cards: Card[]

  constructor(cards: Card[]) {
    this.cards = cards
  }

  shuffle(): void {
    const shuffledCards = [...this.cards]
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]]
    }
    this.cards = shuffledCards

    console.debug('[Deck] shuffled:', this.cards)
  }

  removeCard(cardToRemove: string | Card[]): Card[] {
    if (typeof cardToRemove === 'string') {
      this.cards = this.cards.filter((card) => card.id !== cardToRemove)
    } else {
      const cardIdsToRemove = cardToRemove.map((card) => card.id)
      this.cards = this.cards.filter((card) => !cardIdsToRemove.includes(card.id))
    }

    return this.cards
  }

  drawCards(count: number): Card[] {
    const drawnCards = this.cards.slice(0, count)
    this.cards = this.removeCard(drawnCards)

    console.debug(`[Deck] Drew ${count} card(s):`, drawnCards)
    console.debug(`[Deck] Remaining size:`, this.cards.length, this.cards)

    return drawnCards
  }
}
