
  $(function() {
    window.Book = Backbone.Model.extend({
      toggle: function() {
        return this.save({
          selected: !this.get("selected")
        });
      },
      clear: function() {
        this.destroy();
        return $(this.view.el).remove();
      }
    });
    window.BookList = Backbone.Collection.extend({
      model: Book,
      url: "/books",
      selected: function() {
        return this.filter(function(book) {
          return book.get("selected");
        });
      },
      nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get("order") + 1;
      },
      comparator: function(book) {
        return book.get("order");
      },
      pluralize: function(count) {
        if (count === 1) {
          return "book";
        } else {
          return "books";
        }
      }
    });
    window.Books = new BookList;
    window.BookView = Backbone.View.extend({
      tagName: "li",
      className: "book",
      template: _.template("<input type='checkbox' class='book-check' /><div class='book-content'></div><span class='book-destroy'></span><input type='text' class='book-input' />"),
      events: {
        "click .book-check": "toggleSelected",
        "click .book-destroy": "clear",
        "keypress .book-input": "updateOnEnter"
      },
      initialize: function() {
        _.bindAll(this, "render", "close");
        this.model.bind("change", this.render);
        return this.model.view = this;
      },
      render: function() {
        $(this.el).html(this.template(this.model.toJSON()));
        $(this.el).attr("id", "book-" + this.model.id);
        this.setContent();
        return this;
      },
      setContent: function() {
        var content;
        content = this.model.get("content");
        this.$(".book-content").html(content);
        this.$(".book-input").val(content);
        if (this.model.get("selected")) {
          this.$(".book-check").prop("checked", true);
          $(this.el).addClass("selected");
        } else {
          this.$(".book-check").prop("checked", false);
          $(this.el).removeClass("selected");
        }
        return this.input = this.$(".book-input");
      },
      toggleSelected: function() {
        return this.model.toggle();
      },
      close: function() {
        this.model.save({
          content: this.input.val("value")
        });
        return $(this.el).removeClass("editing");
      },
      updateOnEnter: function(e) {
        console.log("est-ce qu'on arrive ici?");
        if (e.code === 13) return this.close();
      },
      clear: function() {
        return this.model.clear();
      }
    });
    window.AppView = Backbone.View.extend({
      el: $("#bookr"),
      statsTemplate: _.template("<% if (total) { %><span class=\"book-count\"><span class=\"number\"><%= remaining %></span><span class=\"word\"> <%= remaining == 1 ? \"book\" : \"books\" %></span> yet to select.</span><% } %><% if (selected) { %><span class=\"book-clear\"><a href=\"#\">Add <span class=\"number-selected\"><%= selected %> </span>selected <span class=\"word-selected\"><%= selected == 1 ? \"book\" : \"books\" %></span></a></span><% } %>"),
      events: {
        "keypress #new-book": "createOnEnter",
        "click .book-clear": "clearCompleted"
      },
      initialize: function() {
        _.bindAll(this, "addOne", "addAll", "render");
        this.input = this.$("#new-book");
        Books.bind("add", this.addOne);
        Books.bind("refresh", this.addAll);
        Books.bind("all", this.render);
        return Books.fetch();
      },
      render: function() {
        var selected;
        selected = Books.selected().length;
        return this.$("#book-stats").html(this.statsTemplate({
          selected: selected,
          total: Books.length,
          remaining: Books.length - selected
        }));
      },
      addOne: function(book) {
        var view;
        view = new BookView({
          model: book
        }).render().el;
        return this.$("#book-list").append(view);
      },
      addAll: function() {
        return Books.each(this.addOne);
      },
      createOnEnter: function(e) {
        if (e.keyCode !== 13) return;
        Books.create({
          content: this.input.val(),
          selected: false
        });
        return this.input.val("");
      },
      clearCompleted: function() {
        _.each(Books.selected(), function(book) {
          return book.clear();
        });
        return false;
      }
    });
    return window.App = new AppView;
  });
