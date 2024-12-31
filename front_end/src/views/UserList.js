var m = require("mithril");

var User = require("../models/User.js");

var UserList = {
    oninit: function() {
        return User.loadList().then(
                function() {
                    console.log("User.list: \" " + JSON.stringify(User.list) + " \"")
                }
            )
    },
    view: function(){
        return m("div", {class: "user-list"}, User.list.map(function(user){
            return m(m.route.Link, {
                class: "user-list-item",
                href: "/edit/" + user.id
            }, user.firstName + " " + user.lastName);
        }));
    }
};

module.exports = UserList;