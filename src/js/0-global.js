// set platforms array - CHANGE THIS TO UPDATE WEBSITE PLATFORMS
// GUIDE TO THE PLATFORMS ARRAY:
// officialName: The 'legal name' or official name for the OS. This is displayed on most pages.
// searchableName: a string that appears in the name of the binaries and checksums, that can be used to identify the platform.
// logo: examplefilename.png. The path to the logo folder is set below (the 'logoPath' var).
// binaryExtension: should include the dot at the beginning of the extension, e.g .tar.gz or .zip
// requirements: currently just displayed on the 'latest build' page. Should be a short string identifying the most important min. requirement of a machine to run the latest build.
// architecture: 64 or 32. May be required for differentiation between future builds.
// osDetectionString: this string is searched by the OS detection library platform.js to find a match. Include as many words as you like, separated by spaces.
var platforms = [
  {
    officialName: "Linux x86-64",
    searchableName: "X64_LINUX",
    logo: "linux.png",
    binaryExtension: ".tar.gz",
    installerExtension: "no-installer-available",
    architecture: "64",
    osDetectionString: "Linux Mint Debian Fedora FreeBSD Gentoo Haiku Kubuntu OpenBSD Red Hat RHEL SuSE Ubuntu Xubuntu hpwOS webOS Tizen"
  },
  {
    officialName: "Windows x86-64",
    searchableName: "X64_WIN",
    logo: "windows.png",
    binaryExtension: ".zip",
    installerExtension: ".exe",
    architecture: "64",
    osDetectionString: "Windows Win Cygwin"
  },
  {
    officialName: "macOS x86-64",
    searchableName: "X64_MAC",
    logo: "mac.png",
    binaryExtension: ".tar.gz",
    installerExtension: ".dmg",
    architecture: "64",
    osDetectionString: "Mac OS X OSX macOS Macintosh"
  },
  {
    officialName: "Linux s390x",
    searchableName: "S390X_LINUX",
    logo: "s390x.png",
    binaryExtension: ".tar.gz",
    installerExtension: "no-installer-available",
    architecture: "64",
    osDetectionString: "not-to-be-detected"
  },
  {
    officialName: "Linux ppc64le",
    searchableName: "PPC64LE_LINUX",
    logo: "ppc64le.png",
    binaryExtension: ".tar.gz",
    installerExtension: "no-installer-available",
    architecture: "64",
    osDetectionString: "not-to-be-detected"
  },
  {
    officialName: "Linux aarch64",
    searchableName: "AARCH64_LINUX",
    logo: "arm.png",
    binaryExtension: ".tar.gz",
    installerExtension: "no-installer-available",
    architecture: "64",
    osDetectionString: "not-to-be-detected"
  }
];

// FUNCTIONS FOR GETTING PLATFORM DATA
// allows us to use, for example, 'lookup["MAC"];'
var lookup = {};
for (var i = 0, len = platforms.length; i < len; i++) {
    lookup[platforms[i].searchableName] = platforms[i];
}

// gets the 'searchableName' when you pass in the full filename.
// If the filename does not match a known platform, returns false. (E.g. if a new or incorrect file appears in a repo)
function getSearchableName(filename) {
  var platform = null;
  platforms.forEach(function(eachPlatform) {
    if(filename.indexOf(eachPlatform.searchableName) >= 0) {
      platform = eachPlatform.searchableName;
    }
  });
  if(platform) {
    return (lookup[platform].searchableName);
  }
  else {
    return null;
  }
}

// set path to logos
var logoPath = "./dist/assets/";

// gets the OFFICIAL NAME when you pass in 'searchableName'
function getOfficialName(searchableName) {
  return (lookup[searchableName].officialName);
}

// gets the BINARY EXTENSION when you pass in 'searchableName'
function getBinaryExt(searchableName) {
  return (lookup[searchableName].binaryExtension);
}

// gets the INSTALLER EXTENSION when you pass in 'searchableName'
function getInstallerExt(searchableName) {
  return (lookup[searchableName].installerExtension);
}

// gets the LOGO WITH PATH when you pass in 'searchableName'
function getLogo(searchableName) {
  return (logoPath + (lookup[searchableName].logo));
}

// set value for loading dots on every page
var loading = document.getElementById("loading");

// set value for error container on every page
var errorContainer = document.getElementById('error-container');

// set variable names for menu elements
const menuOpen = document.getElementById('menu-button');
const menuClose = document.getElementById('menu-close');
const menu = document.getElementById('menu-container');

menuOpen.onclick = function() {
  menu.className = menu.className.replace( /(?:^|\s)slideOutLeft(?!\S)/g , ' slideInLeft' ); // slide in animation
  menu.className = menu.className.replace( /(?:^|\s)hide(?!\S)/g , ' animated' ); // removes initial hidden property, activates animations
}

menuClose.onclick = function() {
  menu.className = menu.className.replace( /(?:^|\s)slideInLeft(?!\S)/g , ' slideOutLeft' ); // slide out animation
}

// this function returns an object containing all information about the user's OS (from the 'platforms' array)
function detectOS() {
  // if the platform detection library's output matches the 'osDetectionString' of any platform object in the 'platforms' array...
  // ...set the variable 'matchedOS' as the whole object. Else, 'matchedOS' will be null.
  var matchedOS = null;
  platforms.forEach(function(eachPlatform) {
    var thisPlatformMatchingString = eachPlatform.osDetectionString.toUpperCase();
    /* eslint-disable */
    var platformFamily = platform.os.family.toUpperCase(); // platform.os.family is dependent on 'platform.js', loaded by index.html (injected in index.handlebars)
    /* eslint-enable */
    if(thisPlatformMatchingString.indexOf(platformFamily) >= 0) { // if the detected 'platform family' string appears in the osDetectionString value of a platform...
      matchedOS = eachPlatform;
    }
  });

  if(matchedOS){ return matchedOS; } else { return null; }
}

// when using this function, pass in the name of the repo (options: releases, nightly)
function loadReleasesJSON(repo, filename, callback) {
  if(msieversion() == true) { // if the browser is IE, display an error with advice, because important website features do not work in IE.
    loading.innerHTML = "";
    document.getElementById("error-container").innerHTML = "<p>Internet Explorer is not supported. Please use another browser, or see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
  }
  else {
    var url = ("https://raw.githubusercontent.com/AdoptOpenJDK/openjdk-" + repo + "/master/" + filename + ".json"); // the URL of the JSON built in the website back-end
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") { // if the status is 'ok', run the callback function that has been passed in.
        callback(xobj.responseText);
      } else if(xobj.status != "200") { // if the status is NOT 'ok', remove the loading dots, and display an error:
          loading.innerHTML = "";
          document.getElementById("error-container").innerHTML = "<p>Error... there's a problem fetching the releases. Please see the <a href='https://github.com/AdoptOpenJDK/openjdk-releases/releases' target='blank'>releases list on GitHub</a>.</p>";
      }
    };
    xobj.send(null);
  }
}

// check for IE browser
function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie >= 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true;
    }
    else { return false; }
}

// build the menu twisties
var submenus = document.getElementById("menu-content").getElementsByClassName("submenu");

for (i = 0; i < submenus.length; i++) {
  var twisty = document.createElement("span");
  var twistyContent = document.createTextNode(">");
  twisty.appendChild(twistyContent);
  twisty.className = "twisty";

  var thisLine = submenus[i].getElementsByTagName('a')[0];
  thisLine.appendChild(twisty);

  thisLine.onclick = function(){
    this.parentNode.classList.toggle("open");
  }
}
