export const MAX_HAND_SIZE = 3

export enum CARD_NAME {
  ACE = 'ACE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
  SIX = 'SIX',
  SEVEN = 'SEVEN',
  EIGHT = 'EIGHT',
  NINE = 'NINE',
  TEN = 'TEN'
}

export enum CARD_SUIT {
  GOLD = 'GOLD',
  CUPS = 'CUPS',
  SWORDS = 'SWORDS',
  CLUBS = 'CLUBS'
}

export const CARD_POINTS: Record<CARD_NAME, number> = {
  [CARD_NAME.ACE]: 11,
  [CARD_NAME.TWO]: 0,
  [CARD_NAME.THREE]: 10,
  [CARD_NAME.FOUR]: 0,
  [CARD_NAME.FIVE]: 0,
  [CARD_NAME.SIX]: 0,
  [CARD_NAME.SEVEN]: 0,
  [CARD_NAME.EIGHT]: 2,
  [CARD_NAME.NINE]: 3,
  [CARD_NAME.TEN]: 4
}

export const CARD_PRIORITY: Record<CARD_NAME, number> = {
  [CARD_NAME.ACE]: 1,
  [CARD_NAME.THREE]: 2,
  [CARD_NAME.TEN]: 3,
  [CARD_NAME.NINE]: 4,
  [CARD_NAME.EIGHT]: 5,
  [CARD_NAME.TWO]: 10,
  [CARD_NAME.FOUR]: 9,
  [CARD_NAME.FIVE]: 8,
  [CARD_NAME.SIX]: 7,
  [CARD_NAME.SEVEN]: 6
}

export interface Card {
  id: string
  name: CARD_NAME
  suit: CARD_SUIT
  value: number
  priority: number
}

export const CARD_DECK: Card[] = Object.keys(CARD_SUIT).flatMap((suit) => {
  return Object.keys(CARD_NAME).map((name) => {
    return {
      id: `${name}-${suit}`,
      name: name as CARD_NAME,
      suit: suit as CARD_SUIT,
      value: CARD_POINTS[name as CARD_NAME],
      priority: CARD_PRIORITY[name as CARD_NAME]
    }
  })
})

export enum VIEW {
  MAIN = 'VIEW-MAIN',
  CHARACTER = 'VIEW-CHARACTER',
  TABLE = 'VIEW-TABLE'
}
