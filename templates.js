var templates = {};

templates.userList = [
"<div class='userCard' rel='<%= name %>' data-userid='<%= _id %>'>",
"<h3 class='userName'><%= name %></h3>",
"</div>"
].join("")

templates.message = [
"<div class='messageCard'>",
"<p class='userMessage'><%= content %><%= timeStamp %></p>",
"</div>"
].join("")
