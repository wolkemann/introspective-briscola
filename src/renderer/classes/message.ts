import gsap from 'gsap'

export class Message {
  id: string
  messages: string[]
  x: number
  y: number
  width: number
  height: number
  isMoving: boolean

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
  }

  renderDiv(): void {
    const messageDiv = document.createElement('div')
    messageDiv.id = this.id
    messageDiv.style.position = 'absolute'
    messageDiv.style.left = `${this.x}px`
    messageDiv.style.bottom = `${this.y}px`
    messageDiv.style.width = `${this.width}px`
    messageDiv.style.height = `${this.height}px`
    messageDiv.style.border = '3px solid red'
    messageDiv.style.backgroundColor = 'white'
    messageDiv.style.color = 'black'
    messageDiv.style.padding = '20px'
    messageDiv.style.overflowY = 'auto'
    messageDiv.style.fontFamily = 'Arial, sans-serif'
    messageDiv.style.fontSize = '14px'
    messageDiv.style.userSelect = 'none'
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
