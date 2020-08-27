window.addEventListener('scroll',function(e){
    console.log(window.innerHeight);
    let el = document.querySelector('.in-view');
    let aniClass = /iv-([^\s]+)/.exec(el.className);
    if(aniClass&&inView(el)){
        console.log(aniClass[1]);
        el.classList.add(aniClass[1]);
    }
    else if(aniClass){
        el.classList.remove(aniClass[1]);
    }
    function inView(div,threshold=0){
        let rect = div.getBoundingClientRect();
        return (rect.bottom>threshold*rect.height && rect.bottom<window.innerHeight) ||
        (rect.top>0&&rect.top<window.innerHeight-threshold*rect.height);
    }
});