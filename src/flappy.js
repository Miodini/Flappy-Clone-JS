// Funções auxiliares
function getPixel(element, propertyName){
    return parseInt(element.style[propertyName].split('px')[0])
}
// Classes
class Score {
    /** 
     *Contador de pontos.
    */
    constructor() {
        const gameDiv = document.querySelector('.jogo')
        this.element = document.createElement('div')
        this.element.className = 'pontos'
        this.element.innerText = '0'

        gameDiv.appendChild(this.element)

    }
    /**
     * Aumenta o ponto em 1.
     * @returns {Number} Valor dos pontos atualizado.
    */
    incScore(){
        let ponto = parseInt(this.element.innerText)
        this.element.innerText = ++ponto
        return ponto
    }
}

class Cano {
    /**
     * Representa cada cano composto de corpo e boca.
     * @param {Boolean} [reverse=false] - Se reverse == true, o cano é exibido de "ponta cabeça"
    */
    constructor(reverse = false) {
        this.element = document.createElement('div')
        this.boca = document.createElement('div')
        this.corpo = document.createElement('div')
        
        this.element.className = 'cano'
        this.boca.className = 'boca'
        this.corpo.className = 'corpo'
        if (reverse) {
            this.element.appendChild(this.corpo)
            this.element.appendChild(this.boca)
        }
        else {
            this.element.appendChild(this.boca)
            this.element.appendChild(this.corpo)
        }
    }
    /**
     * Define a altura do cano.
     * @param {Number} altura - Em pixels
    */
    setHeight(altura){
        this.corpo.style.height = `${altura}px`
    }
    /**
     * Retorna a altura do cano em pixels
     * @returns {Number}
    */
    getHeight(){
        return getPixel(this.corpo, 'height')
    }
}

class ParDeCanos {
    /**
     * Div que contém um par de canos
     * @param {Number} openingSize - Valor em pixel do tamanho da abertura do cano (distância entre os canos)
     * @param {Number} deslocamento - Valor em pixel que define quantidade de movimento por deslocamento
     * @param {Score} scoreObj - Objeto do placar
     * @param {Passarinho} passaroObj - Objeto do passarinho
    */
    constructor(openingSize, deslocamento, scoreObj, passaroObj) {
        this.openingSize = openingSize
        this.deslocamento = deslocamento
        this.scoreObj = scoreObj
        this.passaroObj = passaroObj
        this.canoTop = new Cano(true)
        this.canoBot = new Cano(false)
        this.gameDiv = document.querySelector('.jogo')

        this.element = document.createElement('div')
        this.element.className = 'parCanos'
        this.element.appendChild(this.canoTop.element)
        this.element.appendChild(this.canoBot.element)
        this.gameDiv.appendChild(this.element)
    }
    /**
     * Define a posição horizontal do par de canos
     * @param {Number} xPos - Valor em pixel da distância a partir borda esquerda 
    */
    setPipePos(xPos){
        this.element.style.left = `${xPos}px`
    }
    /**
     * Define aleatóriamente uma nova altura para os canos
     * @returns {Number} - Nova altura do cano superior
    */
    changeHeights(){
        const alturaJogo = this.gameDiv.getBoundingClientRect().height
        const newHeight = Math.random() * (alturaJogo - this.openingSize - 30) //30px = tamanho da boca
        this.canoTop.setHeight(newHeight) 
        this.canoBot.setHeight(alturaJogo - newHeight - this.openingSize)
        return newHeight
    }
    /**
     * Desloca o par de canos horizontalmente para a esquerda
     * @returns {Boolean} - true se o passaro colidiu com o cano, falso caso contrário
    */
    movePipe(){
        const xAtual = getPixel(this.element, 'left')
        const gameWidth = this.gameDiv.getBoundingClientRect().width
        const gameHeight = this.gameDiv.getBoundingClientRect().height
        let newX = xAtual - this.deslocamento
        // Checagem de rollover
        if (newX < -120) { //120 = largura máxima do cano
            newX = gameWidth + 500 // Alterar para um valor lógico dps  
            this.changeHeights()
        }
        this.setPipePos(newX)
        // Checagem para atualização do placar
        if (xAtual > (gameWidth / 2) - 30 && newX <= (gameWidth / 2) - 30) //(gameWidth/2)-30 = posicao horizontal do passarinho
            this.scoreObj.incScore() 
        // Checagem de colisão
        const alturaTop = this.canoTop.getHeight() + 30 // altura da boca = 30 pixels
        const alturaBot = this.canoBot.getHeight() + 30
        if(this.passaroObj.getY() < alturaTop || this.passaroObj.getY() + 50 > gameHeight - alturaBot){ // Checagem de colisão no eixo Y (50 = altura do passaro, 30 = altura da boca)
            if((gameWidth/2) + 30 >= newX && (gameWidth/2) - 30 <= newX + 120){ // Checagem de colisão no eixo X (120 = largura max do cano)
                return true
            }
        }
        return false
    }
}

class Passarinho {
    /**
     * Define o passarinho (personagem controlável)
     * @param {Number} upSpeed - Deslocamento em pixels por subida
     * @param {Number} downSpeed - Deslocamento em pixels por descida
    */
    constructor(upSpeed, downSpeed) {
        this.upSpeed = upSpeed
        this.downSpeed = downSpeed
        this.element = document.createElement('div')
        this.gameDiv = document.querySelector('.jogo')
        this.voando = true
        
        const img = document.createElement('img')

        this.element.classList = 'passaro'
        img.setAttribute('src', '../img/bird.png')
        this.element.appendChild(img)
        this.gameDiv.appendChild(this.element)

        window.onkeydown = () => this.voando = true
        window.onkeyup = () => this.voando = false
    }
    /**
     * Centraliza o passarinho na tela
    */
    recenter(){
        const alturaJogo = this.gameDiv.getBoundingClientRect().height
        this.element.style.top = `${alturaJogo / 2}px`
    }
    /**
     * Move o passarinho para cima ou para baixo
     * @returns {Number} Posição em pixels da distância do passarinho do topo (pós atualização)
    */
    animate(){
        const alturaJogo = this.gameDiv.getBoundingClientRect().height
        const yAtual = getPixel(this.element, 'top')
        let newY = yAtual + (this.voando ? -this.upSpeed : this.downSpeed)
        if (newY < 0)
            newY = 0
        else if (newY > alturaJogo - 54)
            newY = alturaJogo - 54 //50 = Altura da imagem, 4 = borda
        this.element.style.top = `${newY}px`
        return newY
    } 
    /**
     * Retorna a distância em pixels do topo
     * @returns {Number}
    */
    getY(){
        return getPixel(this.element, 'top')
    }
}

class Game {
    /**
     * Main class for running the game
     * @param {Number} spaceBetweenPipes - Vertical distance between pipes (px)
    */
    constructor(spaceBetweenPipes) {
        this.pontos = new Score()
        this.passarinho = new Passarinho(3, 2)
        this.canos = [
            new ParDeCanos(250, 1, this.pontos, this.passarinho),
            new ParDeCanos(250, 1, this.pontos, this.passarinho),
            new ParDeCanos(250, 1, this.pontos, this.passarinho),
            new ParDeCanos(250, 1, this.pontos, this.passarinho)
        ]
        
        const gameRect = document.querySelector('.jogo').getBoundingClientRect()
        this.canos[0].setPipePos(gameRect.width)
        this.canos[1].setPipePos(gameRect.width + spaceBetweenPipes)
        this.canos[2].setPipePos(gameRect.width + 2 * spaceBetweenPipes)
        this.canos[3].setPipePos(gameRect.width + 3 * spaceBetweenPipes)
        //Setups iniciais
        const startText = document.querySelector('.start')
        document.querySelector('.jogo').removeChild(startText)
        this.canos.forEach(e => e.changeHeights())
        this.passarinho.recenter()
    }
    /**
     * Starts the game loop
    */
    start(){ 
        const timer = setInterval(() => {
            this.passarinho.animate()
            this.canos.forEach(e => {
                // Game over
                if(e.movePipe()){
                    clearInterval(timer)
                    const gameOver = document.createElement('div')
                    gameOver.classList = 'gameover'
                    gameOver.innerHTML = '<h2>Game Over!</h2>' + '\n' + '<span>Refresh page to restart</span>'
                    document.querySelector('.jogo').appendChild(gameOver)
                }
            })
            
        },
        5)
    }
}
// Waits for input
const startGame = function(){
    var jogo = new Game(350)
    jogo.start()
}
window.onkeydown = startGame