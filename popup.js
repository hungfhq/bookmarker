console.log('popup.js');
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAgAyiDIcSNIg6HLghxzVIVGTdgUHZkfgE",
    authDomain: "bookmarks-6aec1.firebaseapp.com",
    databaseURL: "https://bookmarks-6aec1.firebaseio.com",
    projectId: "bookmarks-6aec1",
    storageBucket: "bookmarks-6aec1.appspot.com",
    messagingSenderId: "726870367785",
    appId: "1:726870367785:web:dcc1408e1e7ade26ffc638",
    measurementId: "G-8EZGTQVJN4"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
// chrome.runtime.onMessage.addListener(gotMessage);

// function gotMessage(request, sender, sendResponse) {
//   console.log('msg.txt');
//   console.log(request.url);
// }
// document.addEventListener("DOMContentLoaded", event => {
//   const db = firebase.firestore();

//   // Add a new document in collection "cities"
//   db.collection("bookmarks").doc("LA").set({
//     link: "New Los Angeles"
//   })
//   .then(function() {
//     console.log("Document successfully written!");
//   })
//   .catch(function(error) {
//     console.error("Error writing document: ", error);
//   });

// });

async function loadAllCategories() {
  const elems = document.querySelectorAll('select');
  const select = elems[0];
  const length = select.options.length;
  for (i = length-1; i > 0; i--) {
    select.options[i] = null;
  }
  const snapshot = await db.collection('collections').get();
  snapshot.docs.map(doc => {
    // console.log(doc.data());
    const temp = document.createElement("option");
    if (doc.data().name !== 'unsorted') {
      temp.text = doc.data().name;
      select.options.add(temp);
    }
  });
  
  M.FormSelect.init(elems);
}

document.addEventListener('DOMContentLoaded', loadAllCategories);


document.getElementById('createCategoryBtn').addEventListener('click', function() {
  const categoryText = document.getElementById('categoryText').value;
  // alert(categoryText.value);
  if (categoryText !== '') {
    document.getElementById('spinnerSmall').classList.remove('hidden');
    document.getElementById('createCategoryBtn').classList.add('hidden');

    db.collection('collections').doc(CryptoJS.MD5(categoryText).toString()).set({
      name: categoryText
    })
    .then(function() {
      loadAllCategories();
      document.getElementById('categoryText').value = '';
      document.getElementById('createCategoryBtn').classList.remove('hidden');
      document.getElementById('spinnerSmall').classList.add('hidden');
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
  }
});

chrome.tabs.query({ active: true, lastFocusedWindow: true }, async function(tabs) {
  const tab = tabs[0];
  document.getElementById("url").innerHTML = tab.url;
  const snapshot = await db.collection('collections').get();
  snapshot.docs.map( async (docOfCollections) => {
    const doc = await db.collection(docOfCollections.data().name).doc(CryptoJS.MD5(tab.url).toString()).get();
    if (doc.exists) {
      document.getElementById('createCategoryField').classList.add('hidden');
      document.getElementById('categoriesSelectSection').classList.add('hidden');
      document.getElementById('saveBtn').classList.add('hidden');
      document.getElementById('notification').classList.add('show');
    } 
  });
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const category = document.getElementById('categoriesSelect').value;
  // alert(category);
  addDocumentToFirestore(category);
});

function addDocumentToFirestore(collectionName) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    // and use that tab to fill in out title and url
    const tab = tabs[0];
    // alert(tab.url);
    
    document.getElementById('spinner').classList.add('show');
    document.getElementById('saveBtn').classList.add('hidden');
    db.collection(collectionName).doc(CryptoJS.MD5(tab.url).toString()).set({
      link: tab.url
    })
    .then(function() {
      console.log("Document successfully written!");
      document.getElementById('createCategoryField').classList.add('hidden');
      document.getElementById('categoriesSelectSection').classList.add('hidden');
      document.getElementById('saveBtn').classList.add('hidden');
      document.getElementById('spinner').classList.remove('show');
      document.getElementById('notification').classList.add('show');
      chrome.browserAction.setIcon({path: 'existed16x16.png'});
      chrome.browserAction.setPopup({popup: ''});
    })
    .catch(function(error) {
      console.error("Error writing document: ", error);
    });
  });
}

// document.getElementById('url').addEventListener('click', function() {
//   chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
//     // and use that tab to fill in out title and url
//     const tab = tabs[0];
//     alert(tab.url);
//     console.log(tabs);
//   });
//   // chrome.tabs.onActivated.addListener(tab => {
//   //   chrome.tabs.get(tab.tabId, current_tab => {
//   //     alert(current_tab.url);
//   //     console.log(current_tab.url);
//   //   })
//   // });
// })



// const port = chrome.extension.connect({ name: "Sample Communication" });
//   port.onMessage.addListener(function(msg) {
//     document.getElementById("url").innerHTML = msg;
//     console.log(document.getElementsByTagName("button").length);
//     if (document.getElementsByTagName("BUTTON").length == 0) {
//       const btn = document.createElement("BUTTON");
//       btn.id = 'saveBtn';
//       btn.innerHTML = "Save";                   
//       document.body.appendChild(btn);   
//       btn.addEventListener('click', () => {
//         alert(msg);
//       });
//     } else {
//       document.getElementById('saveBtn').addEventListener('click', () => {
//         alert(msg);
//       });
//     }
    
//   });
