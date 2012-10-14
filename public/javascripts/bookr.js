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
      template: _.template("<input type='checkbox' class='book-check' /><div class='book'></div><span class='book-destroy'></span><input type='text' class='book-input' />"),
      events: {
        "click .book-check": "toggleSelected",
        "click .book-destroy": "clear"
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
        var isbn;
        title = this.model.get("title");
        this.$(".book").html(title);
        this.$(".book-input").val(isbn);
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
        return this.model.save({
          isbn: this.input.val("value")
        });
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
        Books.bind("reset", this.addAll);
        Books.bind("all", this.render);
        Books.fetch();
        return this;
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
        return this.$("#book-list").prepend(view);
      },
      addAll: function() {
        return Books.each(this.addOne);
      },
      createOnEnter: function(e) {
        if (e.keyCode !== 13) return;
        var isbn = this.input.val();
        var request = gapi.client.books.volumes.list({'q': {'isbn': isbn}});
        request.execute(function(response){
          Books.create(response.result.items[0].volumeInfo);
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

  function GoogleApiOnload(){
    gapi.client.setApiKey("AIzaSyAmiUyoMClSzHIRs47csnhCtC4QAK6FHBQ");
    gapi.client.load('books', 'v1');
  };