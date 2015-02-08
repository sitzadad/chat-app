var chatApp = {
  config: {
    url: "http://tiy-fee-rest.herokuapp.com/collections/closetalkers"
  },

  init: function () {
    chatApp.initUser();//skips login screen if returning user (via localStorage)
    chatApp.initStyle();
    chatApp.initEvents();
  },
  initUser: function () {
    if(localStorage.localUser){//FYI: if server is wiped, make sure localStorage.localUser is deleted
      $.ajax({
        url:chatApp.config.url,
        type:'GET',
        success: function (retrievedUsers) {
          _.each(retrievedUsers, function (eachUser) {
            if(localStorage.localUser === eachUser.name){
              chatApp.loadMain();
              console.log('SUCCESS: initUser recognized \''+localStorage.localUser+'\'');
            }
          });
        },
        error: function (error) {
          console.log('WARNING: initUser');
        }
      });
    }else{
      //localStorage.localUser does not exist
      console.log('ALERT: initUser does NOT recognize user')
    }
  },
  initStyle: function () {

  },
  initEvents: function () {
    $('#enterUsernameForm').on('submit', function (e) {
      e.preventDefault();
      var userInput = {
        name: $(this).find('input[name="enterUsernameInput"]').val(),
        messages: ['']
      };
      chatApp.preventDuplicateUsername(userInput);//hand off to store or match userInput on server

      // //Uncomment this ajax and comment other code in function to delete server w/ "Send" button
      // delete localStorage.localUser;
      // $.ajax({
      //   url:chatApp.config.url,
      //   type:'DELETE',
      //   success: function(retrievedUsers){
      //   },
      //   error: function(error){
      //   }
      // });
    });
    $('#enterTextForm').on('submit', function (e) {
      e.preventDefault();
      chatApp.sendChat();
    });
    $('#logOutBtn').on('click', function (e) {
      e.preventDefault();
      chatApp.logOutUser();//enables log out
    });
    $('#refreshChatsBtn').on('click', function (e) {
      e.preventDefault();
      chatApp.renderChats();
    });
  },
  preventDuplicateUsername: function (passed) {
    $.ajax({
      url:chatApp.config.url,
      type:'GET',
      success: function(retrievedUsers){
        _.each(retrievedUsers, function(eachUser){
          if(eachUser.name.toLowerCase() === passed.name.toLowerCase()){
            localStorage.localUser = eachUser.name;
            chatApp.loadMain();
            console.log('SUCCESS: preventDuplicateUsername (\''+localStorage.localUser+'\')');
          }
        });
        if(!('localUser' in localStorage)){//passes off only if no matching username was found on server
          chatApp.createNewUser(passed);
        }
      },
      error: function(){
        console.log('WARNING: preventDuplicateUsername');
      }
    });
  },
  createNewUser: function (passed) {
    $.ajax({
      url: chatApp.config.url,
      data: passed,
      type: 'POST',
      success:function(){
        localStorage.localUser = passed.name;
        chatApp.loadMain();
        console.log('SUCCESS: createNewUser (\''+localStorage.localUser+'\')');
      },
      error:function(error){
        console.log('WARNING: createNewUser');
      }
    });
  },
  loadMain: function () {
    //grabbing/rendering usernames listed on server (IMPORTANT: this is where we get _id!)
    $.ajax({
      url: chatApp.config.url,
      type: 'GET',
      success: function (retrievedUsers) {
        var compiled = _.template(templates.userList);
        var markup = "";
        _.each(retrievedUsers, function (eachUser) {
          markup += compiled(eachUser);
        });
        $('#userList').html(markup);
        console.log('SUCCESS: loadMain rendered usernames from server');
      },
      error: function () {
        console.log('Warning: loadMain');
      }
    });
    //hiding login screen/showing main chat page
    $('#loginWrapper').addClass('invis');
    $('#mainWrapper').removeClass('invis');
    //auto update chats
    setInterval(chatApp.renderChats, 200);
  },
  logOutUser: function () {
    delete localStorage.localUser;
    console.log('SUCCESS: deleted localStorage.localUser');
    location.reload();
  },
  sendChat: function () {
    $.ajax({
      url:chatApp.config.url,
      type:'GET',
      success: function (retrievedUsers) {
        var serverMsgArray = [];
        var msg = {
          timeStamp: Date.now(),
          content: $('#enterTextForm input[name="enterTextInput"]').val(),
          name: localStorage.localUser
        }
        var updatedUserInput = {};
        var serverId = '';
        _.each(retrievedUsers,function (eachUser) {
          if(eachUser.name === localStorage.localUser){
            serverMsgArray = eachUser.messages;
            serverMsgArray.push(msg);//pushing current message to array retrieved from server
            updatedUserInput = {
                name: localStorage.localUser,
                messages: serverMsgArray
            }
            serverId = $('.userCard[rel='+localStorage.localUser+']').data('userid');
            console.log('SUCCESS: sendChat retrieved messages from server (_id: '+serverId+')');
            $.ajax({
               url: chatApp.config.url + '/' + serverId,
               data: updatedUserInput,
               type: 'PUT',
               success: function () {
                 $('#enterTextForm input[name="enterTextInput"]').val('');
                 console.log('SUCCESS: sendChat uploaded message to server (_id: '+serverId+')');
               },
               error: function () {
                 console.log('WARNING: sendChat failed to upload message to server');
               }
             });
           }
        });
      },
      error: function(){
        console.log('WARNING: sendChat failed to retrieve messages from server'+error);
      }
    });
  },
  renderChats: function () {
    $.ajax({
      url:chatApp.config.url,
      type:'GET',
      success: function(retrievedUsers){
        var masterMsgArray = [];
        _.each(retrievedUsers, function (eachUser) {
          _.each(eachUser.messages, function (usersMsgObj) {
            masterMsgArray.push(usersMsgObj);
          });
        });
        masterMsgArray = _.sortBy( masterMsgArray, 'timeStamp' );
        var compiled = _.template(templates.message);
        var markup = '';
        _.each(masterMsgArray, function (usersMsgObj) {
          markup += compiled(usersMsgObj);
        });
        $('#chatWindow').html(markup);
        $("#chatWindow").animate({
          scrollTop: $("#chatWindow").height()
        }, 0);
        console.log('SUCCESS: renderChats');
      },
      error: function(error){
        console.log('WARNING: renderChats');
      }
    });
  }
}

$(document).ready(function () {
  chatApp.init();
});
