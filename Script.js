
function Singleplayer() {
const canvas = document.getElementById('Canv');
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var enemy_x = window.innerWidth / 2 - 400
var enemy_y = window.innerHeight / 2 - 300
var arena = new Image();
arena.src = "assets/arena.jpg";
var PunchSFX = new Audio('assets/sounds/Punch Sound effect.mp3');


var damageCanvas = document.createElement('canvas');
document.body.appendChild(damageCanvas);
var damageContext = damageCanvas.getContext('2d');
damageCanvas.style.display = 'none';

function change_toRed(sprite,x,y){
    damageCanvas.width = sprite.width; // Assuming all frames have the same width
    damageCanvas.height = sprite.height; // Assuming all frames have the same height
    damageContext.clearRect(0, 0, damageCanvas.width, damageCanvas.height);
    damageContext.globalCompositeOperation = 'source-over';
    damageContext.drawImage(sprite, 0, 0);
    const imageData = damageContext.getImageData(0, 0, damageCanvas.width, damageCanvas.height);
    const data = imageData.data;
            
            // Loop through the pixels and set damaged pixels to red
    for (let i = 0; i < data.length; i += 4) {
    // Check if the pixel is not transparent and mark it as damaged (red)
        if (data[i + 3] > 0) {
            data[i] = 255; // Red channel
            data[i + 1] = 0; // Green channel
            data[i + 2] = 0; // Blue channel
            data[i + 3] = 60;
        }
    }
    damageContext.putImageData(imageData, 0, 0);
    context.drawImage(damageCanvas, x, y);
}





const draw_arena = () => {
    context.beginPath()
    context.drawImage(arena, 0, 0, canvas.width, canvas.height);
    window.requestAnimationFrame(draw_arena);}


   

 

    
class Fighter {
    constructor(health, damage1, damage2, StanceSprite_range,jab_range,block_range,stance_folder,jab_folder,block_folder, x ,y,attack_cooldown) {
        this.hp = health;
        this.dmg1 = damage1;
        this.dmg2 = damage2;
        this.StanceSprite_range = StanceSprite_range;
        this.Jab_range  = jab_range
        this.block_range = block_range
        this.stance_folder = stance_folder;
        this.jab_folder = jab_folder
        this.block_folder = block_folder
        this.stance_animations = [];
        this.jab_animations = []
        this.block_animations = []
        this.x = x;
        this.y = y;
        this.hz = 0;
        this.take_time = 0;
        this.damage_time = new Date();
        this.action = 0;
        this.range = StanceSprite_range;
        this.atkcldn = attack_cooldown;
        this.attack_time = 0        
        
        
        this.cooldown = 100;
        this.damaged = false;
        this.blocking = false
        this.attacking = false
    }

    update_action = (value)=>{
        if (this.action!=value){
            this.hz = 0;
            this.action = value;}
    }

    draw = function() {
        let list;
        let hz;
        
        if(this.attacking == true){
            this.update_action(1)
            list = this.jab_animations;
            hz = 1;
            this.cooldown = 50;
            
        }
        else if(this.blocking == true){
            this.update_action(2)
            list = this.block_animations
            hz = 1
            this.cooldown = 20;
        }
        else {
            this.update_action(0)
            list = this.stance_animations;
            hz = 1;
            this.cooldown = 100
        }

        if  (new Date() - this.take_time>=this.cooldown){this.hz+=hz; this.take_time = new Date()}
        if (this.hz >= list.length){
            if (this.blocking != true){
                this.hz = 0
            }
            else((this.hz= list.length - 1))
            
            this.attacking = false
        }
        
        context.drawImage(list[this.hz], this.x, this.y);
        if (this.damaged) {
            change_toRed(list[this.hz],this.x,this.y)            
            if (new Date() - this.damage_time >= 1000){
                this.damaged = false}

        }
    
        window.requestAnimationFrame(() => {
            this.draw(); 
        });
    }
    moves = function(){
        document.addEventListener("keypress", function(event) {
            if (event.code == 'KeyJ'){;
                if (new Date() - fighter.attack_time >= fighter.atkcldn){
                fighter.attack(Enemy)}
                }
            });    
        document.addEventListener("keydown", function(event){
            if (event.code == 'Space'){
                if (fighter.attacking == false){
                fighter.blocking = true;}}
        });
        document.addEventListener("keyup", function(event){
            if (event.code == "Space"){
                fighter.blocking = false;}
            
        })
        
    } 

    attack = (other) => {
        this.attacking = true;
        console.log('hehe')
        console.log('haha')
        other.damage_time = new Date();
        other.hp -= this.dmg1;
        other.damaged = true;
        PunchSFX.play();
        console.log(other.hp);
        this.attack_time = new Date(); // Update the attack time here
        
    }
    


    ai = (target) => {
        const randomAction = Math.random(); // Generate a random number between 0 and 1
        
        // 50% chance to attack, 50% chance to block
        if (randomAction < 0.5) {
            this.attack(target);
        }
    };





}

function load_images(range, folder, animations_list) {
    return new Promise((resolve, reject) => {
        let filename;
        let loadedImages = 0;
        for (let i = 1; i <= range; i++) {
            filename = (i < 10) ? `${folder}0${i}.png` : `${folder}${i}.png`;
            let img = new Image();
            img.onload = () => {
                loadedImages++;
                console.log(`Image ${filename} loaded. (${loadedImages}/${range})`);
                console.log(loadedImages)
                if (loadedImages === range) {
                    resolve();
                }
            };
            img.src = filename;
            animations_list.push(img);
        }
    });
}
            
//--------------MAIN GAME LOOP ---------------------------
var Enemy = new Fighter(100, 5, 5, 7,1,1,'assets/Enemy/stance/Enemy_Stance','assets/Enemy/stance/Enemy_Stance','assets/Enemy/stance/Enemy_Stance',enemy_x,enemy_y,250);
var fighter = new Fighter(100, 5, 5, 7,10,7,'assets/Fighter/stance/Fighter_hands','assets/Fighter/jab/jab','assets/Fighter/Block/Fighter_Block',enemy_x,130,1500);
function Game_loop(){
    draw_arena();
    load_images(Enemy.StanceSprite_range, Enemy.stance_folder, Enemy.stance_animations).then(() => {
        Enemy.draw(); // 
    });
    load_images(fighter.StanceSprite_range, fighter.stance_folder, fighter.stance_animations,).then(() => {
        load_images(fighter.Jab_range, fighter.jab_folder, fighter.jab_animations).then(() =>{
        load_images(fighter.block_range,fighter.block_folder,fighter.block_animations).then(() =>{
            fighter.draw()
        });})});
    fighter.moves();
}

Game_loop();
}
  
    












function create_canvas() {
    let body = document.getElementsByTagName('body')[0];
    let b = document.getElementById('Single')
    body.removeChild(b)
    let canvas = document.createElement('canvas');
    canvas.id = 'Canv'; // Set the ID for the canvas element
    body.appendChild(canvas);
    Singleplayer()
}