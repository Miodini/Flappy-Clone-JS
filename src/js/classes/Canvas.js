import Bird from './Bird'
import Pipes from './Pipes'

const pWidth = 100, pipesDist = 300, gapSize = 150

export default class Canvas{
    constructor(height, gravity = -50){
        this.gravity = -gravity // Y axis is reversed on canvas
        this.element = document.createElement('canvas')
        this.ctx = this.element.getContext('2d')
        this.ctx.imageSmoothingEnabled = false
        
        this.element.height = height
        this.element.width = height*9/16 // 16:9 proportion
        this.bird = new Bird(100)
        this.pipesPairs = [
            new Pipes(this.element.width, gapSize, 1.5, pWidth, height),
            new Pipes(this.element.width + pipesDist, gapSize, 1.5, pWidth, height),
        ]
        this.pipesPairs.forEach((pair) => pair.setY(this.element.height))
        
        document.getElementById('screen').appendChild(this.element)
        addEventListener('keydown', () => this.bird.flap()) 
    }
    
    /**
     * Waits for all assets to be loaded
     * @returns {Promise} - Resolves on load finish. Rejects on error.
     */
    async load(){
        let error = false
        try{
            await this.bird.loadImg(this.element.width/2, this.element.height/2)
            this.pipesPairs.forEach(async (pair) => {
                await pair.loadImg()
            })
        }
        catch(e){ 
            console.error(e)
            error = true 
        }
        return new Promise((resolve, reject) => {
            if(error === false){
                console.log('Loaded.')
                resolve()
            }
            else{
                window.alert('There was an error loading the game. Refresh and try again.')
                reject()   
            }
        })
    }

    draw(){
        const time = .06
        // Background
        this.ctx.fillStyle = 'skyblue'
        this.ctx.fillRect(0, 0, this.element.width, this.element.height)
        // Bird position update
        this.bird.yVelocity += this.gravity * time
        this.bird.pos.y += (this.bird.yVelocity * time) + (this.gravity * time^2 / 2)
        // Screen collision detection
        if(this.bird.pos.y > this.element.height - this.bird.height){
            this.bird.pos.y = this.element.height - this.bird.height
            this.bird.yVelocity = 0
        }
        else if(this.bird.pos.y < 0){
            this.bird.pos.y = 0
            this.bird.yVelocity = 0
        }
        this.pipesPairs.forEach((pair) => pair.movePipe(this.element.height, pipesDist, this.pipesPairs.length))
        // Draws bird
        this.ctx.drawImage(
            this.bird.img, 
            this.bird.pos.x,
            this.bird.pos.y,
            this.bird.width,
            this.bird.height
        )
        // Draws pipes
        this.pipesPairs.forEach((pair) => {
            this.ctx.drawImage(
                pair.pipes.top.img,
                pair.x,
                pair.pipes.top.y,
                pair.width,
                pair.height
            )
            this.ctx.drawImage(
                pair.pipes.bottom.img,
                pair.x,
                pair.pipes.bottom.y,
                pair.width,
                pair.height
            )
        })
    }
}