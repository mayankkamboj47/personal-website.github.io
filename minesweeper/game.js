const MINECOUNT = 10;
function randomise(array){
    array = array.slice();
    let l = array.length;
    for(let i=0;i<l;i++){
        let r = i + Math.floor(Math.random()*(l-i));
        let temp = array[r];
        array[r]=array[i]
        array[i] = temp;
    }
    return array;
}
function nearby(grid,x,y){
    console.log('searching grid at element',grid.get(x,y))
    let n = grid.get(x,y+1);
    let s = grid.get(x,y-1);
    let e = grid.get(x+1,y);
    let w = grid.get(x-1,y);
    let ne = grid.get(x+1,y+1);
    let nw = grid.get(x-1,y+1);
    let se = grid.get(x+1,y-1);
    let sw = grid.get(x-1,y-1);
    let dir = [n,s,e,w,ne,nw,se,sw];
    let count = [n,s,e,w,ne,nw,se,sw].reduce((total,e,index)=>{
        if(!e && typeof e!='number'){
            return total+1;} 
        return total;
    },0);
    return count;
}
class Grid{
    constructor(n){
        this.size = n;
        this.elements = new Array(n*n - MINECOUNT).fill(1);
        this.elements = this.elements.concat(new Array(MINECOUNT).fill(null));
        this.elements = randomise(this.elements);
        this.elements = this.elements.map((val,_index)=>{
            if(!val && typeof val!='number') return val;
            let x= _index % n;
            let y = parseInt(Math.floor(_index / n));
            return nearby(this,x,y);
        });
    }
    get(x,y){
        let ind = x+y*this.size;
        if(x>=0 && y>=0 && x<this.size && y < this.size)
            return this.elements[ind];
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
    constructor(grid,mask,status){
        this.grid = grid;
        this.mask = mask;
        this.status = status;
    }
    unmask(x,y){
        if(this.status=="lost") return this;
         let index = x+y*this.grid.size;
         let mask = this.mask.slice();
         let val = this.grid.get(x,y);
         let status;
         let bombed = false;
         if(!mask[index]){
            mask[index] = 1;
            if(typeof val=='number'){
                if(val==1){
                    let b = bomb(this.grid,mask,x,y);
                    bombed = true;
                    mask = b.mask;
                }
                else if(val==0){
                    mask = zeroFrenzy(x,y,this.grid,mask);
                }
                status = this.won(this.grid,mask)?"won":"playing"; /**add code for checking winning here */
                if(bombed && status=='playing') status = 'bombed';
            }
            else{
                mask = unmine(this.grid,mask);
                status = "lost";
            }
            
         }
         return new Level(this.grid,mask,status);
    }
    static start(grid){
        let mask = createMask(grid.size);
        return new Level(grid,mask,"playing",0);
    }
    won(grid,mask){
        for(let x=0;x<grid.size;x++){
            for(let y=0;y<grid.size;y++){
                if(mask[x+y*grid.size]==0 && typeof grid.get(x,y)=='number') return false;
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
function zeroFrenzy(x,y,grid,mask){
    console.log(`zero frenzy at ${x},${y} with the element ${grid.get(x,y)}`);
    if(x<0 || y <0 || x >= grid.size || y>=grid.size || grid.get(x,y)!==0) return mask;
    console.log('proceeding');
    let dirs = [[x,y+1],[x,y-1],[x+1,y],[x-1,y],[x-1,y-1],[x-1,y+1],[x+1,y-1],[x+1,y+1]];
    let recdirs = [];
    for(let dir of dirs){
        let [xdir,ydir] = [dir[0],dir[1]];
        console.log('in direction ',dir, 'mask is ',mask[xdir+ydir*grid.size]);
        console.log('element is a ',grid.get(xdir,ydir));
        if(mask[xdir+ydir*grid.size]==1 || xdir<0 || ydir<0 || xdir>=grid.size || ydir>=grid.size|| typeof grid.get(xdir,ydir)!='number') continue;
        console.log('revealing element');
        mask[xdir+ydir*grid.size] = 1;
        if(grid.get(xdir,ydir)==0) recdirs.push([xdir,ydir]);
    }
    for(let dir of recdirs){
        mask = zeroFrenzy(dir[0],dir[1],grid,mask);
    }
    return mask;
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
let classNames = {
    1:'one',
    2:'two',
    4:'four',
    5:'five',
    null:'mine'
};
function drawLevel(level,docNode){
    if(level.status=='won'){
        alert('you won !!!');
    }
    let mask = level.mask;
    let grid = level.grid;
    let game = elt('div',{class:'game'});
    let face = elt('div',{class:'face'},elt('text',faces[level.status]||faces['playing']));
    let reset = elt('input',{class:'reset',value:'New Game',type:'button'});
    let controls = elt('div',{class:'controls'},face,reset);
    reset.addEventListener('click',()=>newgame(docNode));
    docNode.appendChild(elt('div',{class:'game-container'},controls,game));
    let boxsize = 100/grid.size;
    for(let y=0;y<grid.size;y++){
        for(let x=0;x<grid.size;x++){
            let box = elt('div',{class:'box '+`${x}-${y}`});
            box.style.height = boxsize+'vmin';
            box.style.width = boxsize+'vmin';
            box.addEventListener('click',unveil(x,y,level,docNode));
            if(mask[x+y*grid.size]){
                let text = elt('text',typeof grid.get(x,y)=='number'?grid.get(x,y):"*");
                box.appendChild(text);
                box.classList.add('visible');
                if(classNames[grid.get(x,y)]) box.classList.add(classNames[grid.get(x,y)]);
                else console.log(grid.get(x,y));
            }
            game.appendChild(box);
        }
    }
}
function newgame(docNode){
    while(docNode.firstChild) docNode.removeChild(docNode.firstChild);
    let level = Level.start(new Grid(10));
    drawLevel(level,docNode);
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
newgame(document.querySelector('.gamemount'));