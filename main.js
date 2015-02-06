//locally generated ID
var localId = '';
//contains local user's info (including local ID/storedID)
var localUser = {};

var msgArray = []

var chatApp = {
  config: {
    url: "http://tiy-fee-rest.herokuapp.com/collections/closetalkers"
  },

  init: function () {
    chatApp.checkUser();
    chatApp.initStyle();
    chatApp.initEvents();
  },
  initStyle: function () {
    $('#mainWrapper').addClass('invis');
  },
  initEvents: function() {
    $('#enterUserForm').on('submit',function(e){
      e.preventDefault();


      //assigning unique local ID
      localId = Date.now();
      //assembling user info from form into object
      var userInput = {
        name: $(this).find('input[name="enterUsernameInput"]').val(),
        storedId: localId,
        message: msgArray,
      };
      chatApp.createUser(userInput);

    });
    $('#enterTextForm').on('submit',function(e){
      e.preventDefault();

      // $.ajax({
      //   url:chatApp.config.url,
      //   type:'DELETE',
      //   success: function(retrievedUsers){
      //
      //   },
      //   error: function(error){
      //
      //   }
      // });

      localId = Date.now();
      var foo = localStorage.name;
      var serverId = $('.userCard').attr('rel', foo).data('userid');
      console.log(serverId);

      var msg = $(this).find('input[name="enterMessageInput"]').val();

      var updatedUserInfo = {
          name: foo,
          storedId: localId,
          message: msgArray
        }

      msgArray.push(msg);

      chatApp.sendChat(serverId, updatedUserInfo);

      console.log('send was clicked');
    });
    $('.btn-danger').on('submit',function(e){
      e.preventDefault();
      $.ajax({
        url:chatApp.config.url,
        type:'DELETE',
        success: function(){
          console.log('Deleted!');
        },
        error: function(error){
          console.log('ALERT:delete ajax failure'+error);
        }
      });
    });

  },
  checkUser: function() {
    if(localStorage.closetalkersId===undefined){
      console.log('assuming user\'s first visit');
    }else{
      $.ajax({
        url:chatApp.config.url,
        type:'GET',
        success: function(retrievedUsers){
          _.each(retrievedUsers, function(eachUser){
            if(localStorage.closetalkersId === eachUser.storedId){
              localUser = eachUser;
            chatApp.loadMain();
            console.log('SUCCESS:checkUser matched local id with stored id on server');
            }
            chatApp.renderAllUsers();
          });
        },
        error: function(error){
          console.log('ALERT:checkUser ajax failure'+error);
        }
      });
    }
  },
  createUser: function (passedUser) {
    chatApp.preventDuplicateUsernames();
    //if username is not already taken, then go ahead and create it
    if($.isEmptyObject(localUser) === true){
      $.ajax({
        url: chatApp.config.url,
        data: passedUser,
        type: 'POST',
        success:function(data){
          //storing local ID for future visits
          localStorage.closetalkersId = localId;
          chatApp.loadMain();
          localUser = passedUser;
          console.log('SUCCESS:createUser POSTed username'+passedUser);
          chatApp.renderAllUsers();
        },
        error:function(error){
          console.log('ALERT:createUser ajax failure'+error);
        }
      });
    }else{
      console.log('SUCCESS:preventDuplicate recognized username');
    }
  },
  preventDuplicateUsernames: function () {
    $.ajax({
      url:chatApp.config.url,
      type:'GET',
      success: function(retrievedUsers){
        _.each(retrievedUsers, function(eachUser){
          if($('#enterUserForm input[name="enterUsernameInput"]').val() === eachUser.name){
            localStorage.closetalkersId = eachUser.storedId;
            //assigned so we can reference current user
            localUser = eachUser;
            chatApp.loadMain();
            chatApp.renderAllUsers();
          }
        });
      },
      error: function(error){
        console.log('ALERT:preventDuplicate ajax failure'+error);
      }
    });
  },
  loadMain: function () {
    $('#loginWrapper').addClass('invis');
    $('#mainWrapper').removeClass('invis');
  },
  renderAllUsers: function () {
    $.ajax({
      url: chatApp.config.url,
      type: 'GET',
      success: function (retrievedUsers) {

        var compiledUserTemplate = _.template(templates.userList);
        // $('.container').append(compiledTemplate);

        var markup = "";
        _.each(retrievedUsers, function (item, idx, arr) {
          markup += compiledUserTemplate(item);
        });
        console.log('markup is.....', markup);
        $('#userList').html(markup);
      },

      error: function (err) {
        console.log(err);
      }

    });
  },
  sendChat: function (id, msg) {


  $.ajax({
     url: chatApp.config.url + '/' + id,
     data: msg,
     type: 'PUT',
     success: function (data) {
       console.log(data);
      //  chatApp.renderAllMessages();
     },
     error: function (err) {
         console.log(err);
       }
   });



  },
  renderChats: function () {
    $.ajax({
      url:chatApp.config.url,
      type:'GET',
      success: function(retrievedUsers){
        _.each(retrievedUsers, function(eachUser){
          eachUser.chatMain;
            //CODE STILL NEEDS TO GO HERE
        });
        console.log('SUCCESS:renderChats ajax worked'+error);
      },
      error: function(error){
        console.log('ALERT:renderChats ajax failure'+error);
      }
    });
  }
}

$(document).ready(function () {
  chatApp.init();
});
