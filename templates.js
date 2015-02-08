var templates = {};

templates.userList = [
"<div class='userCard' rel='<%= name %>' data-userid='<%= _id %>'>",
"<h3 class='userName'><%= name %></h3>",
"</div>"
].join("")

templates.message = [
'<p class="messageCard">',
'<span class = "userIdentifier"><%= name %>:</span>',
'<span class = "userMessage"><%= content %></span>',
'</p>'
].join("")
