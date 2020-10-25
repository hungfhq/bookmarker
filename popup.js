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

async function loadAllCategories() {
  const elems = document.querySelectorAll('select');
  const select = elems[0];
  const length = select.options.length;
  for (i = length-1; i > 0; i--) {
    select.options[i] = null;
  }
  const snapshot = await db.collection('collections').get();
  snapshot.docs.map(doc => {
    const temp = document.createElement("option");
    if (doc.data().name !== 'unsorted') {
      temp.text = doc.data().name;
      select.options.add(temp);
    }
  });
  
  M.FormSelect.init(elems);
}

document.addEventListener('DOMContentLoaded', loadAllCategories);


function createCategory() {
  const categoryText = document.getElementById('categoryText').value;
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
}

document.getElementById('createCategoryBtn').addEventListener('click', createCategory);

chrome.tabs.query({ active: true, lastFocusedWindow: true }, async function(tabs) {
  const tab = tabs[0];
  document.getElementById("url").value = tab.url;
  const website = tab.url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
  const response = await fetch('https://' + website + '/favicon.ico').catch(function(error) {
    console.log(error);
  });
  if (response) {
    document.getElementById("siteImg").src = response.url;
    document.getElementById("siteImg").addEventListener('error', () => {
    document.getElementById("siteImg").src = '16x16.png';
    });
  }

  async function getTitle(url) {
    const validUrl = /http/.test(url);
    if (!validUrl) return undefined;
    return fetch(`${url}`)
      .then((response) => response.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const title = doc.querySelectorAll('title')[0];
        return title.innerText;
      })
      .catch(err => console.log(err));
  };

  const title = await getTitle(tab.url);
  document.getElementById("title").innerHTML = title;

  
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
  addDocumentToFirestore(category);
});

function addDocumentToFirestore(collectionName) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
    const tab = tabs[0];
    
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

