(function() {
  var googleApiOnload;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  googleApiOnload = function() {
    gapi.client.setApiKey("AIzaSyAmiUyoMClSzHIRs47csnhCtC4QAK6FHBQ");
    return gapi.client.load('books', 'v1');
  };

  window.googleApiOnload = googleApiOnload;

  window.Bookr = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {}
  };

  Bookr.Models.Book = (function() {

    __extends(Book, Backbone.Model);

    function Book() {
      Book.__super__.constructor.apply(this, arguments);
    }

    Book.prototype.toggle = function() {
      return this.selected = !this.get("selected");
    };

    Book.prototype.clear = function() {
      this.destroy();
      return $(this.view.el).remove();
    };

    return Book;

  })();

  Bookr.Collections.BookList = (function() {

    __extends(BookList, Backbone.Collection);

    function BookList() {
      BookList.__super__.constructor.apply(this, arguments);
    }

    BookList.prototype.model = Bookr.Models.Book;

    BookList.prototype.url = "/books";

    BookList.prototype.selected = function() {
      return this.filter(function(book) {
        return book.get("selected");
      });
    };

    BookList.prototype.nextOrder = function() {
      if (!this.length) return 1;
      return this.last().get("order") + 1;
    };

    BookList.prototype.comparator = function(book) {
      return book.get("order");
    };

    BookList.prototype.pluralize = function(count) {
      if (count === 1) {
        return "book";
      } else {
        return "books";
      }
    };

    return BookList;

  })();

  window.Books = new Bookr.Collections.BookList;

  Bookr.Views.AppView = (function() {

    __extends(AppView, Backbone.View);

    function AppView() {
      AppView.__super__.constructor.apply(this, arguments);
    }

    AppView.prototype.el = $("#bookr");

    AppView.prototype.statsTemplateId = "#stats-template";

    AppView.prototype.events = {
      "keypress #new-book": "createOnEnter",
      "click .book-clear": "clearCompleted"
    };

    AppView.prototype.initialize = function() {
      _.bindAll(this, "addOne", "addAll", "render");
      this.input = this.$("#new-book");
      Books.bind("add", this.addOne);
      Books.bind("reset", this.addAll);
      Books.bind("all", this.render);
      Books.fetch();
      return this;
    };

    AppView.prototype.render = function() {
      var remaining, selected;
      selected = Books.selected().length;
      this.statsTemplate = Handlebars.compile($(this.statsTemplateId).html());
      remaining = Books.length - selected;
      return this.$("#book-stats").html(this.statsTemplate({
        selected: selected,
        total: Books.length,
        remaining: remaining,
        one: remaining === 1,
        multiple_selected: selected !== 1,
        one_selected: selected === 1
      }));
    };

    AppView.prototype.addOne = function(book) {
      var view;
      view = new Bookr.Views.BookView({
        model: book
      }).render().el;
      return this.$("#book-list").prepend(view);
    };

    AppView.prototype.addAll = function() {
      return Books.each(this.addOne);
    };

    AppView.prototype.createOnEnter = function(e) {
      var isbn, request;
      if (e.keyCode === 13) {
        isbn = this.input.val();
        request = gapi.client.books.volumes.list({
          'q': {
            'isbn': isbn
          }
        });
        request.execute(function(response) {
          return Books.create(response.result.items[0].volumeInfo);
        });
        return this.input.val("");
      }
    };

    AppView.prototype.clearCompleted = function() {
      _.each(Books.selected(), function(book) {
        return book.clear();
      });
      return false;
    };

    return AppView;

  })();

  window.App = new Bookr.Views.AppView;

  Bookr.Views.BookView = (function() {

    __extends(BookView, Backbone.View);

    function BookView() {
      BookView.__super__.constructor.apply(this, arguments);
    }

    BookView.prototype.tagName = "li";

    BookView.prototype.className = "book";

    BookView.prototype.bookTemplateId = "#book-template";

    BookView.prototype.events = {
      "click .book-check": "toggleSelected",
      "click .book-destroy": "clear"
    };

    BookView.prototype.initialize = function() {
      _.bindAll(this, "render", "close");
      this.model.bind("change", this.render);
      return this.model.view = this;
    };

    BookView.prototype.render = function() {
      this.template = Handlebars.compile($(this.bookTemplateId).html());
      $(this.el).html(this.template(this.model.toJSON()));
      $(this.el).attr("id", "book-" + this.model.get('_id'));
      this.setContent();
      return this;
    };

    BookView.prototype.setContent = function() {
      this.$(".book-input").val("");
      if (this.model.get("selected")) {
        this.$(".book-check").prop("checked", true);
        $(this.el).addClass("selected");
      } else {
        this.$(".book-check").prop("checked", false);
        $(this.el).removeClass("selected");
      }
      return this.$(".book-input");
    };

    BookView.prototype.toggleSelected = function() {
      return this.model.toggle();
    };

    BookView.prototype.close = function() {
      return this.model.save({
        isbn: this.input.val("value")
      });
    };

    BookView.prototype.clear = function() {
      return this.model.clear();
    };

    return BookView;

  })();

}).call(this);
