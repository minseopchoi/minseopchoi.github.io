(function(){
  document.querySelectorAll('[data-email]').forEach(function(a){var p=a.dataset.email.split('|');a.href='mailto:'+p[0]+'@'+p[1];a.textContent=p[0]+'@'+p[1]});
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, canAnim=window.gsap&&!reduce;
  var btns=document.querySelectorAll('.switch button');
  btns.forEach(function(b){b.addEventListener('click',function(){
    if(b.getAttribute('aria-pressed')==='true')return;
    var sw=b.parentNode, stuck=sw.getBoundingClientRect().top<=1;
    btns.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');document.getElementById(x.dataset.t).hidden=x!==b});
    if(canAnim)gsap.fromTo('#'+b.dataset.t+' > li',{clipPath:'inset(0% 0% 100% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:.6,ease:'expo.out',stagger:.05,clearProps:'clipPath'});
    if(window.ScrollTrigger)ScrollTrigger.refresh();
    if(stuck){var list=document.getElementById(b.dataset.t);window.scrollTo({top:list.getBoundingClientRect().top+scrollY-sw.offsetHeight,behavior:reduce?'auto':'smooth'})}
  })});
  if(!canAnim)return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({defaults:{ease:'expo.out'}})
    .fromTo('.portrait',{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.2,clearProps:'clipPath'},.1)
    .fromTo('.word.l',{xPercent:-18,opacity:0},{xPercent:0,opacity:1,duration:1.2},.25)
    .fromTo('.word.r',{xPercent:18,opacity:0},{xPercent:0,opacity:1,duration:1.2},.35)
    .fromTo('.h-left,.h-right',{opacity:0},{opacity:1,duration:.6,ease:'power2.out'},.9);

  var st={trigger:'#hero',start:'top top',end:'bottom top',scrub:.5};
  gsap.to('.word.l',{x:function(){return -innerWidth*.07},ease:'none',scrollTrigger:st});
  gsap.to('.word.r',{x:function(){return innerWidth*.07},ease:'none',scrollTrigger:st});
  gsap.to('.portrait',{yPercent:7,ease:'none',scrollTrigger:st});

  gsap.fromTo('.state h2 em',{color:'#3A3A3E'},{color:'#FAFAF7',ease:'none',scrollTrigger:{trigger:'.state',start:'top 75%',end:'top 30%',scrub:.4}});
  gsap.fromTo('.end h2',{xPercent:-8},{xPercent:0,ease:'none',scrollTrigger:{trigger:'.end',start:'top bottom',end:'top 30%',scrub:.5}});
})();
