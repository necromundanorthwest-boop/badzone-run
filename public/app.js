// One standalone entry point. Hash fragments never prevent the game from loading.
const root=document.getElementById('game');
try {
  if(new URLSearchParams(location.search).get('mode')==='solo'){
    const {mountBadzone}=await import('./badzone/ui.js');
    mountBadzone(root);
  }else{
    const {mountVersus}=await import('./badzone/online.js');
    mountVersus(root);
  }
} catch (error) {
  console.error('Badzone Run failed to start', error);
  root.replaceChildren();
  const message=document.createElement('p');
  message.className='boot-message';
  message.textContent='Badzone Run could not start. Reload this page to try again. Saved game data has not been deleted.';
  const retry=document.createElement('button');
  retry.textContent='Reload game';
  retry.addEventListener('click',()=>location.reload());
  message.append(document.createElement('br'),retry);
  root.append(message);
}
