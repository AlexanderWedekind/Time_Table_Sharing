var m = require("mithril");

var UsersLink = {
    function(){
        return m(m.route.Link, {href: "/home"}, "Users");
    }
};

var Home = {
    oninit: (vnode) => {
        console.log("Home vnode: \" " + JSON.stringify(vnode) + " \"");
    },
    view: function(){
        return m("div", {class: "home-div"}, [
            m("h1", "Home"),
            m("h2", {class: "go-to-users"}, [
                m("p", {class: "go-to-users-content"}, "Go to "),
                m(m.route.Link, {class: "go-to-users-content", href: "/users"}, "Users")
            ])
        ]);
    }
};

module.exports = Home;