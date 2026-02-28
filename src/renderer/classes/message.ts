import gsap from 'gsap'

export const MESSAGE_PROPS = {
  BORDER_COLOR: 'red',
  BORDER_SIZE: '3px',
  FONT_SIZE: '20px',
  TEXT_COLOR: '#383838',
  BACKGROUND_COLOR: '#000000',
  PADDING: '20px',
  SHADOW: '0 0 10px rgba(0, 0, 0, 0.5)',
  BORDER_RADIUS: '5px'
}

export class Message {
  id: string
  messages: string[]
  x: number
  y: number
  width: number
  height: number
  isMoving: boolean

  borderColor: string
  borderSize: string
  fontSize: string
  fontColor: string
  backgroundColor: string
  padding: string
  shadow: string
  borderRadius: string

  private isSkipped: boolean

  constructor(
    id: string,
    messages: string[] = [],
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0
  ) {
    this.id = id
    this.messages = messages
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.isSkipped = false
    this.isMoving = false
    this.borderColor = MESSAGE_PROPS.BORDER_COLOR
    this.borderSize = MESSAGE_PROPS.BORDER_SIZE
    this.fontSize = MESSAGE_PROPS.FONT_SIZE
    this.fontColor = MESSAGE_PROPS.TEXT_COLOR
    this.backgroundColor = MESSAGE_PROPS.BACKGROUND_COLOR
    this.padding = MESSAGE_PROPS.PADDING
    this.shadow = MESSAGE_PROPS.SHADOW
    this.borderRadius = MESSAGE_PROPS.BORDER_RADIUS
  }

  renderDiv(): void {
    const messageDiv = document.createElement('div')

    messageDiv.id = this.id
    messageDiv.style.position = 'absolute'
    messageDiv.style.left = `${this.x}px`
    messageDiv.style.bottom = `${this.y}px`
    messageDiv.style.width = `${this.width}vw`
    messageDiv.style.height = `${this.height}vh`
    messageDiv.style.border = `${this.borderSize} solid ${this.borderColor}`
    messageDiv.style.backgroundColor = this.backgroundColor
    messageDiv.style.color = this.fontColor
    messageDiv.style.padding = this.padding
    messageDiv.style.fontFamily = 'Arial, sans-serif'
    messageDiv.style.fontSize = this.fontSize
    messageDiv.style.userSelect = 'none'
    messageDiv.style.boxShadow = this.shadow
    messageDiv.style.borderRadius = this.borderRadius
    document.body.appendChild(messageDiv)
  }

  async typewriterEffect(text: string[], delay: number = 50): Promise<void> {
    this.isSkipped = false // Reset dello stato ad ogni avvio
    const fullHtml = text.join('<br>')
    const messageDiv = document.getElementById(this.id)

    if (!messageDiv) return

    // Listener per lo skip (es. click sul div o pressione tasto)
    const skipHandler = (): void => {
      this.isSkipped = true
    }
    messageDiv.addEventListener('click', skipHandler, { once: true })

    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = fullHtml
    messageDiv.innerHTML = ''

    const typeNode = async (source: Node, target: HTMLElement): Promise<void> => {
      const childNodes = Array.from(source.childNodes)

      for (const node of childNodes) {
        if (this.isSkipped) {
          // Se l'utente clicca, iniettiamo il resto del nodo istantaneamente
          target.appendChild(node.cloneNode(true))
          continue
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const textContent = node.textContent || ''
          for (const char of textContent) {
            if (this.isSkipped) {
              // Se lo skip avviene durante la scrittura del testo
              target.innerHTML += textContent.substring(textContent.indexOf(char))
              break
            }
            target.innerHTML += char
            await new Promise((resolve) => setTimeout(resolve, delay))
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          const newElement = document.createElement(element.tagName)

          Array.from(element.attributes).forEach((attr) => {
            newElement.setAttribute(attr.name, attr.value)
          })

          target.appendChild(newElement)
          await typeNode(element, newElement)
        }
      }
    }

    await typeNode(tempDiv, messageDiv)

    // Pulizia finale
    messageDiv.removeEventListener('click', skipHandler)
  }

  moveTo(x: number, y: number): void {
    this.x = x
    this.y = y
    const messageDiv = document.getElementById(this.id)

    if (!messageDiv) return

    this.isMoving = true

    gsap.to(messageDiv.style, {
      left: `${x}px`,
      bottom: `${y}px`,
      duration: 1,
      ease: 'power2.out',
      onStart: () => {
        this.isMoving = true
      },
      onComplete: () => {
        this.isMoving = false
      }
    })
  }
}
