chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: 'popup.html',
    type: 'popup',
    width: 380,  // Largura ligeiramente maior para o padding e garantir espaço
    height: 600  // Altura ajustada. Pode precisar de pequenos ajustes no seu PC.
  });
});