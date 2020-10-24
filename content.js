console.log('chrome extension go go go og');

// let paragraphs = document.getElementsByTagName('p');

// for (let i = 0; i < paragraphs.length; i++) {
//   paragraphs[i].innerHTML = 'none';
// }

// for (elt of paragraphs) {
  // elt.style['background-color'] = '#FF00FF';
// }

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(request, sender, sendResponse) {
  console.log('msg.txt');
  console.log(request.url);
}