console.log("background is running");
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
  apiKey: "AIzaSyAgAyiDIcSNIg6HLghxzVIVGTdgUHZkfgE",
  authDomain: "bookmarks-6aec1.firebaseapp.com",
  databaseURL: "https://bookmarks-6aec1.firebaseio.com",
  projectId: "bookmarks-6aec1",
  storageBucket: "bookmarks-6aec1.appspot.com",
  messagingSenderId: "726870367785",
  appId: "1:726870367785:web:dcc1408e1e7ade26ffc638",
  measurementId: "G-8EZGTQVJN4",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

chrome.tabs.onActivated.addListener((tab) => {
  chrome.tabs.get(tab.tabId, (currentTab) => {
    checkDocExisted(currentTab.url);
  });
}); //end

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.status === "complete" && tab.url !== undefined) {
    checkDocExisted(tab.url);
  }
});

async function checkDocExisted(url) {
  let urlExisted = null;
  let localExisted = null;
  const urlKeyArr = [CryptoJS.MD5(url).toString()];
  chrome.storage.local.get(urlKeyArr, async (data) => {
    urlMD5 = Object.keys(data)[0];
    localExisted = data[urlMD5];
    if (localExisted !== null) {
      urlExisted = localExisted;
    } else {
      const snapshot = await db.collection("collections").get();
      const existedPromiseArr = snapshot.docs.map(
        async (docOfCollections) => {
          const doc = await db
            .collection(docOfCollections.data().name)
            .doc(CryptoJS.MD5(url).toString())
            .get();
          if (doc.exists) {
            return true;
          }
        }
      );
      const existedArr = await Promise.all(existedPromiseArr);
      urlExisted = existedArr.find((item) => item === true);
      if (urlExisted) {
        const storageObj = {};
        storageObj[urlKey] = true;
        chrome.storage.local.set(storageObj);
      } else {
        const storageObj = {};
        storageObj[urlKey] = false;
        chrome.storage.local.set(storageObj);
      }
    }
  
    if (urlExisted) {
      chrome.browserAction.setIcon({ path: "true.png" });
      chrome.browserAction.setPopup({ popup: "" });
    } else {
      chrome.browserAction.setIcon({ path: "false.png" });
      chrome.browserAction.setPopup({ popup: "popup.html" });
    }
  });

}
