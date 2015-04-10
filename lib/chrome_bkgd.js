var background;

var chrome_interface = {
    
    storage_access: function(on_load){
        
        chrome.storage.sync.get( {
            //defaults
            use_global_emotes: true,
            use_subscriber_emotes: true, 
            use_betterttv_emotes: false,

            replace_emotes_dynamically: true,

            use_twitch_smilies: false,
            twitch_smilies_mode: 'Robot',
            twitch_smilies_monkeys: false,

            emote_filter_mode: "None",
            emote_filter_list: "",

            site_filter_mode: "None",
            site_filter_list: ""
        }, function(data) {
            on_load(data);
        });
    },
    
    json_parser: function(url, on_load) {
        
        var XML_REQUEST;
        var json;

        XML_REQUEST = new XMLHttpRequest();

        XML_REQUEST.open('GET', url);

        XML_REQUEST.onload = function() {
            json = JSON.parse(XML_REQUEST.responseText);
            on_load(json);
        };

        XML_REQUEST.send();

    },
    
    script_injector: function(tab, on_load, data) {
        try {
            //nested script injectors, only way to load more than one script on chrome
            chrome.tabs.executeScript(tab.id, {file: "./data/jquery-2.1.3.min.js"}, function(){
                chrome.tabs.insertCSS(tab.id, {file: "./data/css/tipsy.css"}, function(){
                    chrome.tabs.executeScript(tab.id, {file: './data/jquery.tipsy.js'}, function(){
                        chrome.tabs.executeScript(tab.id, {file: './data/contentscript.js'}, function(){
                            chrome.tabs.executeScript(tab.id, {file: './data/chrome_content.js'}, function(){
                                chrome.tabs.sendMessage(tab.id, data);
                                //done with it
                                on_load();
                            });
                        });
                    });
                });
            });
        } catch (runtime_exception) {
            console(runtime_exception);
        }
    }
    
};


//tab somewhere finished loading, attempt to push it into the queue
chrome.tabs.onUpdated.addListener(function(tab_id, info, tab) {
    if (info.status === "complete") {
        background.add_tab(tab, tab.url);
    }
});

function initialize() {
    background = new Background(chrome_interface);
    background.initialize();
}

//if settings changes, reinitialize
chrome.storage.onChanged.addListener(function(changes, namespace) {
    initialize();
});

initialize();