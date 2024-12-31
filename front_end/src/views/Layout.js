var m = require("mithril");

var Layout = {
    view: function(vnode){
        return m("main", {class: "layout"}, [
            m("nav", {class: "menu"}, [
                m(m.route.Link, {class: "nav-menu-item", href: "/users"}, "Users"),
                m(m.route.Link, {class: "nav-menu-item", href: "/home"}, "Home")
            ]),
            m("section", vnode.children)
        ])
    }
}

module.exports = Layout;
