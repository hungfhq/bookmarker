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
  chrome.browserAction.setIcon({ path: "16x16.png" });
  chrome.browserAction.setPopup({ popup: "popup.html" });

  chrome.tabs.get(tab.tabId, async (currentTab) => {
    const snapshot = await db.collection("collections").get();
    snapshot.docs.map(async (docOfCollections) => {
      const doc = await db
        .collection(docOfCollections.data().name)
        .doc(CryptoJS.MD5(currentTab.url).toString())
        .get();
      if (doc.exists) {
        chrome.browserAction.setIcon({ path: "existed16x16.png" });
        chrome.browserAction.setPopup({ popup: "" });
      }
    });
  });
}); //end

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  // console.log(changeInfo);
  // console.log(tab);
  if (tab.status === "complete" && tab.url !== undefined) {
    const urlExisted = await checkDocExisted(tab.url);
    // console.log(urlExisted);
    if (urlExisted) {
      chrome.browserAction.setIcon({ path: "existed16x16.png" });
      chrome.browserAction.setPopup({ popup: "" });
    } else {
      chrome.browserAction.setIcon({ path: "16x16.png" });
      chrome.browserAction.setPopup({ popup: "popup.html" });
    }
  }
});

async function checkDocExisted(url) {
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
  return existedArr.find((item) => item === true);
}
