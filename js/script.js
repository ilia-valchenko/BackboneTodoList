var app = {};

app.Todo = Backbone.Model.extend({
  defaults: {
    title: '',
    completed: false
  },
  toggle: function() {
    this.save({completed:!this.get("completed")});
  }
});

app.TodoList = Backbone.Collection.extend({
  model: app.Todo,
  localStorage: new Store("backbone-todo")
});

// Renders individual todo item.
// Do you want to know where the model comes from?
// When we instanciate a Backbone View, it can receive
// any parameter that we need.
app.TodoView = Backbone.View.extend({
  tagName: "li",
  template: _.template($("#item-template").html()),
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    this.input = this.$(".edit");
    return this;
  },
  initialize: function() {
    this.model.on("change", this.render, this);
    this.model.on("destroy", this.remove, this);
  },
  events: {
    "dblclick label" : "edit",
    "keypress .edit" : "updateOnEnter",
    "blur .edit" : "close",
    "click .toggle" : "toggleCompleted",
    "click .destroy" : "destroy"
  },
  edit: function() {
    this.$el.addClass("editing");
    this.input.focus();
  },
  close: function() {
    var value = this.input.val().trim();

    if(value) {
      this.model.save({title:value});
    }

    this.$el.removeClass("editing");
  },
  updateOnEnter: function(e) {
    if(e.which == 13) {
      this.close();
    }
  },
  /*Call function from the model*/
  toggleCompleted: function() {
    this.model.toggle();
  },
  destroy: function() {
    if(confirm("Do you want to delete this item?")) {
      this.model.destroy();
    }
  }
});

app.todoList = new app.TodoList();

// App view
// Renders full list of todos
app.AppView = Backbone.View.extend({
  el: "#todoapp",
  initialize: function() {
    this.input = this.$("#new-todo");
    app.todoList.on("add", this.addOne, this);
    app.todoList.on("reset", this.addAll, this);
    app.todoList.fetch(); // loads all data from local storage
  },
  events: { "keypress #new-todo" : "createTodoOnEnter" },
  createTodoOnEnter: function(e) {
    // Number 13 is stand for 'Enter'
    if(e.which !== 13 || !this.input.val().trim()) {
      return;
    }
    // It created new todo, but doesn't add it on the web page.
    // That is why I need 'addOne' event.
    app.todoList.create(this.newAttributes());
    this.input.val(''); // clean input box
  },
  addOne: function(todo) {
    var view = new app.TodoView({model:todo});
    this.$("#todo-list").append(view.render().el);
  },
  addAll: function() {
    // clean todo list
    $("todo-list").html('');
    app.todoList.each(this.addOne, this);
  },
  newAttributes: function() {
    return {
      title: this.input.val().trim(),
      completed: false
    }
  }
});

app.appView = new app.AppView();
