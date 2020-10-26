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
  measurementId: "G-8EZGTQVJN4",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let liIds = [];
async function loadAllCategories() {
  liIds = [];
  const ul = document.getElementById("collections");
  while ((lis = ul.getElementsByTagName("li")).length > 0) {
    console.log(lis[0]);
    ul.removeChild(lis[0]);
  }

  const snapshot = await db.collection("collections").get();
  snapshot.docs.map((doc) => {
    // console.log(doc.id);
    liIds.push(doc.id);
    addChildToCategoryList(doc);
  });
}

function addChildToCategoryList(doc) {
  const ul = document.getElementById("collections");
  const li = document.createElement("li");
  if (doc.data().name === "unsorted") {
    li.innerHTML = `<label> <input id=${doc.id} class="with-gap" name="group1" type="radio" value="unsorted" checked /> <span>unsorted</span> </label>`;
    ul.appendChild(li);
  } else {
    li.innerHTML = `<label> <input id=${doc.id} class="with-gap" name="group1" type="radio" value=${doc.data().name}  /> <span>${doc.data().name}</span> </label>`;
    ul.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", loadAllCategories);

function createCategory() {
  const categoryText = document.getElementById("categoryText").value;
  if (categoryText !== "") {
    document.getElementById("spinnerSmall").classList.remove("hidden");
    document.getElementById("createCategoryBtn").classList.add("hidden");

    const newCategoryPromise = db
      .collection("collections")
      .doc(CryptoJS.MD5(categoryText).toString())
      .set({
        name: categoryText,
      });

    newCategoryPromise
      .then(() => {
        loadAllCategories();
        document.getElementById("categoryText").value = "";
        document.getElementById("createCategoryBtn").classList.remove("hidden");
        document.getElementById("spinnerSmall").classList.add("hidden");
      })
      .catch((err) => console.log(err));
  }
}

document.getElementById("categoryText").addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    createCategory();
  }
});
document
  .getElementById("createCategoryBtn")
  .addEventListener("click", createCategory);

chrome.tabs.query({ active: true, lastFocusedWindow: true }, async function (
  tabs
) {
  const tab = tabs[0];
  document.getElementById("url").value = tab.url;
  const website = tab.url
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.", "")
    .split(/[/?#]/)[0];
  const response = await fetch("https://" + website + "/favicon.ico").catch(
    function (error) {
      console.log(error);
    }
  );
  if (response) {
    document.getElementById("siteImg").src = response.url;
    document.getElementById("siteImg").addEventListener("error", () => {
      document.getElementById("siteImg").src = "16x16.png";
    });
  }

  const title = await getTitle(tab.url);
  document.getElementById("title").innerHTML = title;

  const snapshot = await db.collection("collections").get();
  snapshot.docs.map(async (docOfCollections) => {
    const doc = await db
      .collection(docOfCollections.data().name)
      .doc(CryptoJS.MD5(tab.url).toString())
      .get();
    if (doc.exists) {
      document.getElementById("createCategoryField").classList.add("hidden");
      document
        .getElementById("collections")
        .classList.add("hidden");
      document.getElementById("saveBtn").classList.add("hidden");
      document.getElementById("notification").classList.add("show");
    }
  });
});

async function getTitle(url) {
  const validUrl = /http/.test(url);
  if (!validUrl) return undefined;
  const response = await fetch(`${url}`).catch((err) => console.log(err));
  const html = await response.text();
  // console.log(html);
  const result = (() => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = doc.querySelectorAll("title")[0];
    return title.innerText;
  })(html);
  return result;
}

extractTitle = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const title = doc.querySelectorAll("title")[0];
  return title.innerText;
};

document.getElementById("saveBtn").addEventListener("click", () => {
  liIds.map(id => {
    // console.log(id)
    const radioBtn = document.getElementById(id);
    if (radioBtn.checked) {
      console.log(radioBtn.value);
      addDocumentToFirestore(radioBtn.value);
    }
  });
});

function addDocumentToFirestore(collectionName) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    const tab = tabs[0];

    document.getElementById("spinner").classList.add("show");
    document.getElementById("saveBtn").classList.add("hidden");
    db.collection(collectionName)
      .doc(CryptoJS.MD5(tab.url).toString())
      .set({
        link: tab.url,
      })
      .then(function () {
        console.log("Document successfully written!");
        document.getElementById("createCategoryField").classList.add("hidden");
        document
          .getElementById("collections")
          .classList.add("hidden");
        document.getElementById("saveBtn").classList.add("hidden");
        document.getElementById("spinner").classList.remove("show");
        document.getElementById("notification").classList.add("show");
        chrome.browserAction.setIcon({ path: "existed16x16.png" });
        chrome.browserAction.setPopup({ popup: "" });
      })
      .catch(function (error) {
        console.error("Error writing document: ", error);
      });
  });
}
