var m = require("mithril");

//m.render(document.getElementById("app"), "hello there! mithril again!");

var root = document.body;
var app = document.getElementById("app");
        
var count = 0;

var Hello = {
    view: function() {
        return m("main", [
            m("h1", {class: "this-is-fine"}, "Hello there!"),
            m("h1", "This is Mithril"),
            m("button", {onclick: increment}, count + " Times"),
            m("a", {href: "#!/enter"}, m("h1", "Return to start"))
        ]);
    }
};

var Splash = {
    view: function(){
        return m("a", {href: "#!/hello_there_mithril"}, m("h1", "Click to Enter"));
    }
};

var increment = function(){
    m.request({
        method: "PUT",
        url: "//mithril-rem.fly.dev/api/tutorial/1",
        body: {count: count + 1},
        withCredentials: true
    }).then(function(data){
        count = parseInt(data.count);
    });
};

m.route(app, "/enter", {
    "/enter": Splash,
    "/hello_there_mithril": Hello
});
