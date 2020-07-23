class Grid{
    constructor(n){
        this.elements = [];
        for(let i=0;i<n*n;i++){
            let rand = Math.random();
            if(rand<0.1) this.elements.push(null);
            else if(rand<0.6) this.elements.push(1);
            else if(rand<0.8) this.elements.push(2);
            else if(rand<0.9) this.elements.push(4);
            else this.elements.push(5);
        }
        this.size = n;
    }
    get(x,y){
        if(this.elements.length > x+y*this.size)
            return this.elements[x+y*this.size];
        return 0;
    }
}
function createMask(n){
    let mask = [];
    for(let i=0;i<n*n;i++){
        mask[i] = 0;
    }
    return mask;
}
class Level{
    constructor(grid,mask,status,score){
        this.grid = grid;
        this.mask = mask;
        this.status = status;
        this.score = score;
    }
    unmask(x,y){
        if(this.status=="lost") return this;
         let index = x+y*this.grid.size;
         let mask = this.mask.slice();
         let val = this.grid.get(x,y);
         let score = this.score, status;
         let bombed = false;
         if(!mask[index]){
            mask[index] = 1;
            if(val){
                score += val;
                if(val==1){
                    let b = bomb(this.grid,mask,x,y);
                    bombed = true;
                    mask = b.mask;
                    score = score + b.count;
                }
                status = this.won(this.grid,mask)?"won":"playing"; /**add code for checking winning here */
                if(bombed && status=='playing') status = 'bombed';
            }
            else{
                score = this.score;
                mask = unmine(this.grid,mask);
                status = "lost";
            }
            
         }
         return new Level(this.grid,mask,status,score);
    }
    static start(grid){
        let mask = createMask(grid.size);
        return new Level(grid,mask,"playing",0);
    }
    won(grid,mask){
        for(let x=0;x<grid.size;x++){
            for(let y=0;y<grid.size;y++){
                if(mask[x+y*grid.size]==0 && grid.get(x,y)) return false;
            }
        }
        return true;
    }   
}
function bomb(grid,mask,x,y){
    let newmask = mask.slice();
    let count = 0;
    for(let i=x+1;i<grid.size;i++){
        if(grid.get(i,y)==1 && !newmask[i+y*grid.size]) newmask[i+y*grid.size] = 1;
        else break;
        count++;
    }
    for(let i=x-1;i>=0;i--){
        if(grid.get(i,y)==1 && !newmask[i+y*grid.size]) newmask[i+y*grid.size] = 1;
        else break;
        count++;
    }
    for(let j=y+1;j<grid.size;j++){
        if(grid.get(x,j)==1 && !newmask[x+j*grid.size]) newmask[x+j*grid.size] = 1;
        else break;
        count++;
    }
    for(let j=y-1;j>=0;j--){
        if(grid.get(x,j)==1 && !newmask[x+j*grid.size]) newmask[x+j*grid.size] = 1;
        else break;
        count++;
    }
    return {mask:newmask,count};
}
function unmine(grid,mask){
    let newmask = mask.slice();
    for(let x=0;x<grid.size;x++){
        for(let y=0;y<grid.size;y++){
            if(grid.get(x,y)==null) newmask[x+y*grid.size] = 1;
        }
    }
    return newmask;
}
let faces = {
    'playing':String.fromCodePoint(0x1F642),
    'lost':String.fromCodePoint(0x1F635),
    'bombed':String.fromCodePoint(0x1F642),
    'amazed':String.fromCodePoint(0x1F62E)
};
function unveil(x,y,level,docNode){
    return function(){
        let newLevel = level.unmask(x,y);
        while(docNode.firstChild){
            docNode.removeChild(docNode.firstChild);
        }
        drawLevel(newLevel,docNode);
        if(newLevel.status!=='lost'){
            let face = docNode.querySelector('.face');
            face.innerHTML = faces['amazed'];
            setInterval(()=>{
                face.innerHTML = faces[newLevel.status] || faces['playing'];
            },200);
        }
    };
}

function fadeText(text){
    return elt('div',{class:'fadetext'},elt('text',text));
}
let classNames = {
    1:'one',
    2:'two',
    4:'four',
    5:'five',
    null:'mine'
};
function drawLevel(level,docNode){
    let mask = level.mask;
    let grid = level.grid;
    let game = elt('div',{class:'game'});
    let face = elt('div',{class:'face'},elt('text',faces[level.status]||faces['playing']));
    let score = elt('div',{class:'score-div'},elt('text','Score : '),elt('span',{class:'score'},elt('text',level.score)));
    docNode.appendChild(elt('div',{class:'game-container'},score,game));
    docNode.prepend(face);
    let boxsize = 100/grid.size;
    for(let y=0;y<grid.size;y++){
        for(let x=0;x<grid.size;x++){
            let box = elt('div',{class:'box'});
            box.style.height = boxsize+'vmin';
            box.style.width = boxsize+'vmin';
            box.addEventListener('click',unveil(x,y,level,docNode));
            if(mask[x+y*grid.size]){
                let text = elt('text',grid.get(x,y)?grid.get(x,y):"*");
                box.appendChild(text);
                box.classList.add('visible');
                if(classNames[grid.get(x,y)]) box.classList.add(classNames[grid.get(x,y)]);
            }
            game.appendChild(box);
        }
    }
}
function elt(name,attrs,...elements){
    if(name=='text') return document.createTextNode(attrs);
    let main = document.createElement(name);
    for(let attr in attrs){
        main.setAttribute(attr,attrs[attr]);
    }
    for(let element of elements){
        main.appendChild(element);
    }
    return main;
}
let level = Level.start(new Grid(10));
drawLevel(level,document.body);
