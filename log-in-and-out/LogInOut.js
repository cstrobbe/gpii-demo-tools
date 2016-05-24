/*global document: false */

// var DEBUG = true;

/* Modifications after checking Willison's original code with JSHint: added "use strict" and changed "window.onload != 'function'" into "window.onload !== 'function'".*/
/**
 * Add a function to the list of functions that need to be called when
 * the HTML document has finished loading (in other words, after the <code>window.load</code> event).
 * @param {Function} func A function that needs to be invoked after <code>window.load</code>.
 * @static
 * @author Simon Willison
 * @see Simon Willison's article <a href="http://simonwillison.net/2004/may/26/addloadevent/">Executing JavaScript on page load</a> (26 May 2004).
 */
function addLoadEvent(func) {
    "use strict";
    var oldonload = window.onload;
    if (typeof window.onload !== 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            if (oldonload) {
                oldonload();
            }
            func();
        };
    }
}


// addListener from N.C. Zakas: Maintainable JavaScript, p. 58
// Note: this function is almost identical to DOMhelp.addEvent by C. Heilmann;
//       DOMhelp.addEvent also passes on useCapture (boolean) to addEventListener.
//       See Christian Heilmann: Beginning JavaScript, p. 156 and p. 166 (Scott Andrew's addEvent method).
/**
 * Add an event listener to an HTML element.
 * @param {Element} target The HTML element where the listener should be added.
 * @param {String} type The type of listener (click, focus, etcetera).
 * @param {Function} handler The function that will handle the event received by the element.
 * by the listener.
 * @author Nicholas C. Zakas
 */
function addListener(target, type, handler) {
    "use strict";
    if (target.addEventListener) {
        target.addEventListener(type, handler, false);
    } else if (target.attachEvent) {
        target.attachEvent("on" + type, handler);
    } else {
        target["on" + type] = handler;
    }
}



/**
 * @namespace Functions for logging in and out preference sets.
 */
var loginout = {
    // @@TODO Move to configuration file. Cf. Zakas, Maintainable JS, p. 92-94 and Heilmann, Beginning JS, p. 140-141.
    hideClass: 'hide',      // class attribute value for things that should be hidden
    showClass: 'show',      // class attribute value for things that should be displayed
    logInUrlStart: 'http://localhost:8081/user/', // Note: http://localhost:8081/user/<TOKEN>/logonChange also works 
    prefSetUrlStart: 'http://preferences.gpii.net/preferences/', // replaces the old URL http://preferences.gpii.net/user/ 
    getLocalPrefsUrlStart: 'http://localhost:8081/preferences/',
    getTokensUrl: 'http://localhost:8081/userToken', // replaces the old URL http://localhost:8081/token

    /** 
     * Initialise the log in / log out form.
     * @author Christophe Strobbe (HdM)
     */
    init: function() {
        "use strict";
        // Check support for W3C DOM. (C. Heilmann: Beginning JavaScript Development ..., p. 66-68.)
        if (!document.getElementById || !document.createTextNode) { return; }
        
        this.addLogInListener();
        this.addLogOutListener();
        this.addResetListener();
        this.addShowTokensListener();
    },


    /**
     * Add log-in listener to the log-in button. 
     */
    addLogInListener: function() {
        "use strict";
        var loginBtn;
        loginBtn = document.getElementById("loginbutton");
        if (loginBtn !== null) {
            addListener(loginBtn, "click", loginout.handleLogInAction);
        }
    },


    /**
     * Add log-out listener to the log-out button. 
     */
    addLogOutListener: function() {
        "use strict";
        var logoutBtn;
        logoutBtn = document.getElementById("logoutbutton");
        if (logoutBtn !== null) {
            addListener(logoutBtn, "click", loginout.handleLogOutAction);
        }
    },


    /**
     * Add reset listener to the reset button. 
     */
    addResetListener: function() {
        "use strict";
        var resetBtn;
        resetBtn = document.getElementById("reset");
        if (resetBtn !== null) {
            addListener(resetBtn, "click", loginout.resetFormAndFrames);
        }
    },


    /**
     * Add listener to the "show tokens" button. 
     */
    addShowTokensListener: function() {
        "use strict";
        var getTokensBtn;
        getTokensBtn = document.getElementById("getTokensButton");
        if (getTokensBtn !== null) {
            addListener(getTokensBtn, "click", loginout.showTokens);
        }
    },



    handleLogInAction: function(event) {
        "use strict";
        event.preventDefault();
        event.stopPropagation();
        loginout.logInToken(/*event.target, event.type*/);//@@TODO check if we need to pass anything to the function.
    },


    handleLogOutAction: function(event) {
        "use strict";
        event.preventDefault();
        event.stopPropagation();
        loginout.logOutToken(/*event.target, event.type*/);//@@TODO check if we need to pass anything to the function.
    },


    /** 
     * Log in the "user" with the token in the input field.
     * @author Christophe Strobbe (HdM)
     */
    logInToken: function() {
        "use strict";
        var resultFrame,
            resultLink,
            resultSpan,
            prefsetFrame,
            prefsetLink,
            prefsetSpan,
            prefsetFrameLocal,
            prefsetLinkLocal,
            prefsetSpanLocal,
            loginUrl,
            loginUrlEnd,
            prefSetUrl,
            prefSetUrlLocal,
            tokenField,
            token;

        loginUrlEnd = "/login";
        // get the token from the input field
        tokenField = document.getElementById("token");
        token = tokenField.value;

        // create the URL for the preference set
        prefSetUrl = this.prefSetUrlStart + token; //@@TODO refactor
        // create the login URL
        loginUrl = this.logInUrlStart + token + loginUrlEnd; //@@TODO refactor

        // display the login URL in the heading above the iframe
        resultSpan = document.getElementById("resultlinkcontainer");
        resultLink = document.createElement("a");
        resultLink.setAttribute("href", loginUrl);
        resultLink.appendChild(document.createTextNode(loginUrl));
        resultSpan.appendChild(resultLink);
        resultSpan.setAttribute("class", this.showClass);

        // display the preference set in the iframe //@@TODO refactor
        prefsetFrame = document.getElementById("prefset"); // We lazily assume that this is an iframe; @@TODO check the element type
        prefsetFrame.setAttribute("src", prefSetUrl);
        //@@TODO add a check whether the server returns 200, 404 or something else

        // display the URL in the heading above the iframe
        prefsetSpan = document.getElementById("preflinkcontainer");
        prefsetLink = document.createElement("a");
        prefsetLink.setAttribute("href", prefSetUrl);
        prefsetLink.appendChild(document.createTextNode(prefSetUrl));
        prefsetSpan.appendChild(prefsetLink);
        prefsetSpan.setAttribute("class", this.showClass);

        // display the result of the log-in action in the other iframe
        resultFrame = document.getElementById("result"); // We lazily assume that this is an iframe; @@TODO check the element type
        resultFrame.setAttribute("src", loginUrl);
        //@@TODO add a check whether the server returns 200, 404 or something else

        // display the preference set in the iframe //@@TODO refactor
        prefsetFrameLocal = document.getElementById("prefsetlocal"); // We lazily assume that this is an iframe; @@TODO check the element type
        prefSetUrlLocal = this.getLocalPrefsUrlStart + token;
        prefsetFrameLocal.setAttribute("src", prefSetUrlLocal);
        //@@TODO add a check whether the server returns 200, 404 or something else

        // display the URL in the heading above the iframe
        prefsetSpanLocal = document.getElementById("preflinkcontainerlocal");
        prefsetLinkLocal = document.createElement("a");
        prefsetLinkLocal.setAttribute("href", prefSetUrlLocal);
        prefsetLinkLocal.appendChild(document.createTextNode(prefSetUrlLocal));
        prefsetSpanLocal.appendChild(prefsetLinkLocal);
        prefsetSpanLocal.setAttribute("class", this.showClass);

    },


    /** 
     * Log out the "user" with the token in the input field.
     * @author Christophe Strobbe (HdM)
     */
    logOutToken: function() {
        "use strict";
        var resultFrame,
            resultLink,
            resultSpan,
            prefsetFrame,
            logoutUrl,
            logoutUrlEnd,
            prefSetUrl,
            tokenField, 
            token;

        logoutUrlEnd = "/logout";

        // get the token from the input field
        tokenField = document.getElementById("token");
        token = tokenField.value;

        // create the URL for the preference set (GPII Preferences Server)
        prefSetUrl = this.prefSetUrlStart + token; //@@TODO refactor
        // create the logout URL
        logoutUrl = this.logInUrlStart + token + logoutUrlEnd; //@@TODO refactor
        // display the preference set in the iframe //@@TODO refactor
        prefsetFrame = document.getElementById("prefset"); // We lazily assume that this is a frame or iframe; @@TODO check the element type
        prefsetFrame.setAttribute("src", prefSetUrl);
        
        // create the URL for the preference set (local)
        prefSetUrl = this.logInUrlStart + token; //@@TODO refactor
        // display the local preference set in the iframe //@@TODO refactor
        prefsetFrame = document.getElementById("prefsetlocal"); // We lazily assume that this is a frame or iframe; @@TODO check the element type
        prefsetFrame.setAttribute("src", prefSetUrl);


        // display the login URL in the heading above the iframe
        resultSpan = document.getElementById("resultlinkcontainer");
        while (resultSpan.hasChildNodes()) {
            resultSpan.removeChild(resultSpan.lastChild);
        }
        resultLink = document.createElement("a");
        resultLink.setAttribute("href", logoutUrl);
        resultLink.appendChild(document.createTextNode(logoutUrl));
        resultSpan.appendChild(resultLink);
        resultSpan.setAttribute("class", this.showClass);

        // display the result of the log-out action in the other iframe
        resultFrame = document.getElementById("result"); // We lazily assume that this is a frame or iframe; @@TODO check the element type
        resultFrame.setAttribute("src", logoutUrl);
        //@@TODO add a check whether the server returns 200, 404 or something else
        
    },


    /** 
     * Empty the input field and reset the iframes to their original source/URL.
     * @author Christophe Strobbe (HdM)
     */
    resetFormAndFrames: function() {
        "use strict";
        var oldFrameSrc,
            resultFrame,
            resultSpan,
            prefsetFrame,
            prefsetSpan,
            tokenField,
            tokensFrame;

        oldFrameSrc = "LogInLogOutMrT.html";
        // empty the input field
        tokenField = document.getElementById("token");
        tokenField.value = "";
        // reset the result frame to its original source / url
        resultFrame = document.getElementById("result"); // We lazily assume that this is a frame or iframe; @@TODO check the element type
        resultFrame.setAttribute("src", oldFrameSrc);
        // reset the preference set frame (GPII) to its original source / url
        prefsetFrame = document.getElementById("prefset"); // We lazily assume that this is a frame or iframe; @@TODO check the element type
        prefsetFrame.setAttribute("src", oldFrameSrc);
        // reset the preference set frame (local) to its original source / url
        prefsetFrame = document.getElementById("prefsetlocal"); // We lazily assume that this is a frame or iframe; @@TODO check the element type
        prefsetFrame.setAttribute("src", oldFrameSrc);
        // reset the tokens frame to its original source / url
        tokensFrame = document.getElementById("loggedintokens");
        tokensFrame.setAttribute("src", oldFrameSrc);

        // remove the login /logout URL in the heading above the first iframe
        resultSpan = document.getElementById("resultlinkcontainer");
        while (resultSpan.hasChildNodes()) {
            resultSpan.removeChild(resultSpan.lastChild);
        }
        resultSpan.setAttribute("class", /*this.hideClass*/ "hide");

        // remove link from H2 above preference set frame
        prefsetSpan = document.getElementById("preflinkcontainer");
        while (prefsetSpan.hasChildNodes()) {
            prefsetSpan.removeChild(prefsetSpan.lastChild);
        }
        //prefsetSpan.removeAttribute("class");
        prefsetSpan.setAttribute("class", /*this.hideClass*/ "hide");

        // remove link from H2 above preference set frame
        prefsetSpan = document.getElementById("preflinkcontainerlocal");
        while (prefsetSpan.hasChildNodes()) {
            prefsetSpan.removeChild(prefsetSpan.lastChild);
        }
        //prefsetSpan.removeAttribute("class");
        prefsetSpan.setAttribute("class", /*this.hideClass*/ "hide");
    },


    /** 
     * Display the currently logged in tokens.
     * @author Christophe Strobbe (HdM)
     */
    showTokens: function() {
        "use strict";
        var tokensFrame;

        tokensFrame = document.getElementById("loggedintokens");
        tokensFrame.setAttribute("src", loginout.getTokensUrl);
    }//,

};


addLoadEvent(function() {
    "use strict";
    // Check support for W3C DOM. (C. Heilmann: Beginning JavaScript Development ..., p. 66-68.)
    if (!document.getElementById || !document.createTextNode) {return;}
    loginout.init();
});

