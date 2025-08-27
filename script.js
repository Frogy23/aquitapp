const drawer = document.getElementById('drawer');
const menuBtn = document.getElementById('menuBtn');
const links = [...document.querySelectorAll('.drawer-nav a')];

function toggleDrawer(forceOpen){
  if(!drawer || !menuBtn) return;
  const open = forceOpen ?? !drawer.classList.contains('open');
  drawer.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
}
if(menuBtn) menuBtn.addEventListener('click', () => toggleDrawer());
links.forEach(a => a.addEventListener('click', () => toggleDrawer(false)));

const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if('IntersectionObserver' in window){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      const id = '#' + e.target.id;
      const link = links.find(l => l.getAttribute('href') === id);
      if(link){ link.classList.toggle('active', e.isIntersecting); }
    });
  }, {rootMargin: "-40% 0px -50% 0px", threshold: 0});
  sections.forEach(s => obs.observe(s));
}
