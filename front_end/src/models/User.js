var m = require("mithril");

var User = {
    list: [],
    loadList: function(){
        return m.request(
            {
                method: "GET",
                url: "https://mithril-rem.fly.dev/api/users",
                withCredentials: true
            }
        ).then(
            function(result){
                User.list = result.data
            }
        )
    },
    current: {},
    load: function(id){
        return m.request({
            method: "GET",
            url: "https://mithril-rem.fly.dev/api/users/" + id,
            withCredentials: true,
        }).then(function(result){
            User.current = result;
        });
    },
    save: function(){
        return m.request({
            method: "PUT",
            url: "https://mithril-rem.fly.dev/api/users/" + User.current.id,
            body: User.current,
            withCredentials: true
        });
    }   
};

module.exports = User;
