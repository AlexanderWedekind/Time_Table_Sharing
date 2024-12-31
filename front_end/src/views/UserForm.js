var m = require("mithril");

var User = require("../models/User.js");

var UserForm = {
    oninit: function(vnode){
        console.log("UserForm vnode: \" " + JSON.stringify(vnode) + " \"");
        User.load(vnode.attrs.id);
    },
    view: function(){
        return m("form", {
            onsubmit: function(e){
                e.preventDefault();
                User.save();
            }
        }, [
            m("label.label", "Firt Name"),
            m("input.input[type=text][placeholder=First Name]",{
                oninput: function(e){
                    User.current.firstName = e.target.value;
                },
                value: User.current.firstName
            }),
            m("label.label", "Last Name"),
            m("input.input[placeholder=Last Name]", {
                oninput: function(e){
                    User.current.lastName = e.target.value;
                },
                value: User.current.lastName
            }),
            m("button[type=submit]", "Save")
        ]);
    }
};

module.exports = UserForm;