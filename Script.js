const canvas = document.getElementById('Canv');
const context = canvas.getContext("2d");
var body = document.getElementsByTagName("body")[0]
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var enemy_x = window.innerWidth / 2 - 400
var enemy_y = window.innerHeight / 2 - 300
var arena = new Image();
arena.src = "assets/arena.jpg";
var PunchSFX = new Audio('assets/sounds/Punch Sound effect.mp3');
var BlockSFX = new Audio('assets/sounds/Block Sound effect.mp3');

function playPunchSound() {
    var punchSoundClone = PunchSFX.cloneNode(true);
    punchSoundClone.play();
}

function playBlockSound() {
    var blockSoundClone = BlockSFX.cloneNode(true);
    blockSoundClone.play();
}


function check_lost(){
    if (Enemy.hp <= 0 || fighter.hp <=0){
        canvas.parentNode.removeChild(canvas);
        const para = document.createElement("p");
        const node = document.createTextNode("Round Over");
        para.appendChild(node);
        body.appendChild(para);

    }
    window.requestAnimationFrame(check_lost)
}


var damageCanvas = document.createElement('canvas');
document.body.appendChild(damageCanvas);
var damageContext = damageCanvas.getContext('2d');
damageCanvas.style.display = 'none';

function change_toRed(sprite,x,y,its){
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
            data[i + 3] = 40;
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
    constructor(name,player, health, damage1, damage2, StanceSprite_range,jab_range,block_range,cross_range,stance_folder,jab_folder,block_folder,cross_folder, x ,y,attack_cooldown) {
         // setup
         this.name = name;
         this.player = player
         //stats
         this.hp = health;
         this.original_hp = health
         this.dmg1 = damage1;
         this.dmg2 = damage2;
         //animations settings
         this.StanceSprite_range = StanceSprite_range;
         this.Jab_range  = jab_range
         this.block_range = block_range
         this.cross_range = cross_range
         this.stance_folder = stance_folder;
         this.jab_folder = jab_folder
         this.block_folder = block_folder
         this.cross_folder = cross_folder
         this.stance_animations = [];
         this.jab_animations = []
         this.block_animations = []
         this.cross_animations = []
         //logic
         this.x = x;
         this.y = y;
         this.hz = 0;
         this.take_time = 0;
         this.damage_time = new Date();
         this.action = 0;
         this.range = StanceSprite_range;
         this.atkcldn = attack_cooldown;
         this.attack_time = 0
         this.attack_time2 = 0        
         this.list = []
         this.cooldown = 100;
         this.damaged = false;
         this.blocking = false
         this.attacking = false
         this.holdingspace = false
         this.attack_type = 0
         
    }

    update_action = function(value){
        if (this.action!=value){
            this.hz = 0;
            this.action = value;}
    }

    draw = function() {
        let list;
        let hz;
        if (this.blocking && !(this.attacking)){
            this.update_action(2);
        }
        if (this.attacking){
            this.update_action(1);
        }
        if (this.attacking == false && this.blocking == false){
            this.update_action(0)
        }



        if(this.action == 1){
            if (this.attack_type == 1){
                list = this.jab_animations;
                hz = 1;
                this.cooldown = 50;}
            else if (this.attack_type ==2){
                list = this.cross_animations;
                hz = 1;
                this.cooldown = 50;
            }
            
        }
        else if(this.action == 2){
            list = this.block_animations
            hz = 1
            this.cooldown = 20;
        }
        else {
            list = this.stance_animations;
            hz = 1;
            this.cooldown = 100
        }
        if  (new Date() - this.take_time>=this.cooldown){   
            this.hz+=hz; 
            this.take_time = new Date()}
        if (this.hz >= list.length){
            if (this.blocking == false && this.attacking == false){
                this.hz = 0
                
            }
            else((this.hz= list.length - 1))
            this.attacking = false
        }
        this.model = list[this.hz];
        context.drawImage(this.model, this.x, this.y);
            
        if (this.damaged){
            change_toRed(list[this.hz],this.x,this.y,this)            
            if (new Date() - this.damage_time >= 800){
                this.damaged = false
                this.damage_time = new Date()}
            }
        
            
        window.requestAnimationFrame(() => {
            this.draw(); 
        });
    }

    attack = (other) => {
        let dmg;
        if (this.attack_type == 1){
            dmg = this.dmg1;
            this.attack_time = new Date(); 
        }
        else if(this.attack_type == 2){
            dmg = this.dmg2
            this.attack_time2 = new Date();
        }
        this.attacking = true;
        if (other.blocking) {
            other.hp -= dmg / 2;
            playBlockSound();
        } else {
            other.damaged = true;
            other.hp -= dmg;
            playPunchSound();
            
        }
        console.log(other.hp)
        
        
        other.damage_time = new Date();
    }
    
    moves = function(target) {
        document.addEventListener("keypress", (event) => {
            if (this.attacking == false){
            if (event.code == 'KeyJ') {
                if (new Date() - this.attack_time >= this.atkcldn) {
                    this.attack_type = 1;
                    this.attack(target); 
                    this.blocking = false;
                    if (this.holdingspace){
                    this.blocking = true}
                }
            }
        
            else if (event.code == 'KeyK'){
                if (new Date() - this.attack_time2 >= this.atkcldn){
                    this.attack_type = 2;
                    this.attack(target);
                    this.blocking = false;
                    if (this.holdingspace){
                        this.blocking = ture}
                }
            }}
        
        });
        document.addEventListener("keydown", (event) => {
            if (event.code == 'Space') {
                this.blocking = true;
                this.holdingspace = true;
            }
        });
        document.addEventListener("keyup", (event) => {
            if (event.code == "Space") {
                this.blocking = false;
                this.holdingspace = false
            }
        });
    }
    

    ai = (target) => {
        const randomAction = Math.random(); // Generate a random number between 0 and 1

        // 50% chance to attack, 50% chance to block
        if (randomAction < 0.2) {
            if (new Date() - this.attack_time >= this.atkcldn){
                    this.attack(target);
                    
        }   
        }
        
        
    }
    };




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
var Enemy = new Fighter("enemy", 0, 100, 5, 8, 7, 9, 2, 6,'assets/Enemy/stance/Enemy_Stance', 'assets/Enemy/jab/Enemy_Jab','assets/Enemy/block/Enemy_block','assets/Enemy/cross/Enemy_cross', enemy_x, enemy_y, 2000);
var fighter = new Fighter("fighter", 1, 100, 5, 8, 7, 10, 7,8 ,'assets/Fighter/stance/Fighter_hands', 'assets/Fighter/jab/jab', 'assets/Fighter/Block/Fighter_Block','assets/Fighter/cross/cross', enemy_x, 130, 1000);

function drawHealthbar(object,x,y,width,height) {
    let ratio;
    ratio = object.hp / object.original_hp;
    context.beginPath();
    context.fillStyle = "red";
    context.fillRect(x, y, width , height);
    context.beginPath();
    context.fillStyle = "#06f008";
    context.fillRect(x, y, width * ratio,height);
    window.requestAnimationFrame(() => {drawHealthbar(object,x,y,width,height)}); // Request the next animation frame
}



function Game_loop(){
    draw_arena();
    load_images(Enemy.StanceSprite_range, Enemy.stance_folder, Enemy.stance_animations).then(() => {
        load_images(Enemy.Jab_range, Enemy.jab_folder, Enemy.jab_animations).then(() => {
            load_images(Enemy.block_range,Enemy.block_folder,Enemy.block_animations).then(() =>{
                load_images(Enemy.cross_range,Enemy.cross_folder,Enemy.cross_animations).then(() =>{
                    Enemy.draw();
                    drawHealthbar(Enemy,Enemy.x + 345, Enemy.y + 80,180,25)
                    })
                ;})})
         
    });
    load_images(fighter.StanceSprite_range, fighter.stance_folder, fighter.stance_animations,).then(() => {
        load_images(fighter.Jab_range, fighter.jab_folder, fighter.jab_animations).then(() =>{
            load_images(fighter.block_range,fighter.block_folder,fighter.block_animations).then(() =>{
                load_images(fighter.cross_range,fighter.cross_folder,fighter.cross_animations).then(() =>{
                fighter.draw()
                drawHealthbar(fighter,fighter.x + 300, fighter.y + 770,200,20)
                })
        });})});
    fighter.moves(Enemy);
    check_lost()
}




//------------------------------------------------------------

function Online() {
    var peer = new Peer();
    
    var connectButton = document.getElementById("connectButton");
    var Idheader = document.getElementById("idHeader");
    var conn; // Declare conn variable here
    var container = document.getElementById("container");
    var input = document.getElementById("idinput");
    peer.on('open', (id) => {
        Idheader.innerHTML = id;
    });
    var conn;
    connectButton.addEventListener("click", () => {
        var IdToConnect = input.value;
        conn = peer.connect(IdToConnect);
        console.log(IdToConnect);
        conn.on('open', () => {
            console.log("Connection opened!");
            conn.send("HandShaking");
            console.log('now');
        });
    });

    document.addEventListener('keypress', (event) => {
        if ( conn && conn.open) {
            if (event.code === 'KeyJ') {
                if (fighter.attacking == false){
                    if (new Date() - fighter.attack_time >= fighter.atkcldn){
                        conn.send("Jab");}}
            } 

            if (event.code ==="KeyK"){
                if (fighter.attacking==false){
                    if (new Date() - fighter.attack_time2 >= fighter.atkcldn){
                        conn.send("Cross");
                    }
                }
            }

            if (event.code === "Space"){
                conn.send("Block")
            }}
        else {            
            console.log("No open connection to send ");
            }
        

        
    });

    document.addEventListener('keyup', (event) =>{
        if ( conn && conn.open){
            if (event.code==="Space"){
                conn.send("No Block")
            }
        }
    })

    var ready = document.getElementById("ready"); // Define the ready variable here

    peer.on('connection', (connection) => {
        connection.on('data', (data) => {
            if (data == "Jab") {
                Enemy.attack_type = 1;
                Enemy.attack(fighter);
            }
            if (data=="Cross"){
                Enemy.attack_type = 2;
                Enemy.attack(fighter);
            }
            if (data=="Block"){
                Enemy.blocking = true;
            }
            if (data=="No Block"){
                Enemy.blocking = false;
                console.log()
            }
        });
    });

    ready.addEventListener('click', () => {
        if (conn.on) {
            container.parentNode.removeChild(container);
        }
        Game_loop();
    });
}

document.addEventListener("DOMContentLoaded", function() {
    Online();
});

