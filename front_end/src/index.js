var m = require("mithril");

var app = document.getElementById("app");

var UserList = require("./views/UserList.js");

var UserForm = require("./views/UserForm.js");

var Home = require("./views/Home.js");

var Layout = require("./views/Layout.js");



m.route(app, "/home", {
    "/home": Home,
    "/users": {
        render: function(){
            return m(Layout, m(UserList))
        }
    },
    "/edit/:id": {
        render: function(vnode){
            return m(Layout, m(UserForm, vnode.attrs))
        }
    }
});
