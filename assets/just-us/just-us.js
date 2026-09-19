
const album=document.querySelector('.album');
const scene=document.querySelector('.scene');
const main=document.querySelector('main');
const description=document.getElementById('face-description');
function fit(){
 const box=main.getBoundingClientRect();
 const css=getComputedStyle(main);
 const availableWidth=Math.min(box.width,window.innerWidth)-parseFloat(css.paddingLeft)-parseFloat(css.paddingRight);
 const availableHeight=window.innerHeight-document.querySelector('.header').getBoundingClientRect().height-parseFloat(css.paddingTop)-parseFloat(css.paddingBottom);
 const preferred=window.innerWidth<=700?availableWidth:Math.min(window.innerWidth*.74,960);
 scene.style.width=(.8*Math.max(160,Math.min(preferred,availableWidth,availableHeight*942/682)))+'px';
}
album.addEventListener('click',()=>{
 const back=album.getAttribute('aria-pressed')!=='true';
 album.setAttribute('aria-pressed',String(back));
 album.setAttribute('aria-label',back?'Turn record back to the Just Us cover':'Turn record over to see the set list');
 description.textContent=back?'The set list. Song title one, Artist name. Song title two, Artist name. Song title three, Artist name. Song title four, Artist name. Song title five, Artist name. Songs for our elopement.':'Just Us. Our elopement. Durham, NC. June 10, 2027.';
});
window.addEventListener('resize',fit);
document.fonts.ready.then(fit);
fit();
