(function(){

  // Book
  window.Book = Backbone.Model.extend({
  
    toggle: function() {
      this.save({selected: !this.get("selected")});
    },

    // Remove this Book from *localStorage*, deleting its view.
    clear: function() {
      this.destroy();
      $(this.view.el).dispose();
    }
  
  });

  // Book List
  window.BookList = Backbone.Collection.extend({
  
    model: Book,
    localStorage: new Store("books"),
  
    // Returns all selected books.
    selected: function() {
      return this.filter(function(book){
        return book.get('selected');
      });
    },

    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    comparator: function(book) {
      return book.get('order');
    },

    pluralize: function(count) {
      return count == 1 ? 'item' : 'items';
    }
  
  });

  window.Books = new BookList;
  
  window.BookView = Backbone.View.extend({
  
    tagName: "li",
    className: "book",
  
    template: _.template("<input type='checkbox' class='book-check' /><div class='book-content'></div><span class='book-destroy'></span><input type='text' class='book-input' />"),
  
    events: {
      "click .book-check"      : "toggleSelected",
      "click .book-destroy"    : "clear",
      "keypress .book-input"   : "updateOnEnter"
    },
    
    initialize: function() {
      _.bindAll(this, 'render', 'close');
      this.model.bind('change', this.render);
      this.model.view = this;
    },
  
    render: function() {
      $(this.el).set('html', this.template(this.model.toJSON()));
      $(this.el).setProperty("id", "book-"+this.model.id);
      this.setContent();
      sortableBooks.addItems(this.el);
      return this;
    },
  
    setContent: function() {      
      var content = this.model.get('content');
      this.$('.book-content').set("html", content);
      this.$('.book-input').setProperty("value", content);
      
      if (this.model.get('selected')) {
        this.$(".book-check").setProperty("checked", "checked");
        $(this.el).addClass("selected");
      } else {
        this.$(".book-check").removeProperty("checked");
        $(this.el).removeClass("selected");
      }
      
      this.input = this.$(".book-input");
      this.input.addEvent('blur', this.close);
    },
    
    toggleSelected: function() {
      this.model.toggle();
    },
  
    close: function() {
      this.model.save({content: this.input.getProperty("value")});
      $(this.el).removeClass("editing");
    },
  
    updateOnEnter: function(e) {
      if (e.code == 13) this.close();
    },
    
    clear: function() {
      this.model.clear();
    }
  
  });

  var sortableBooks = new Sortables("book-list", {
    constrain: true,
    clone: true,
    handle: ".book-content",
    onComplete: function(ele){
      sortableBooks.serialize(false, function(element, index){
        book = Books.get(element.getProperty("id").replace("book-", ""));
        book.save({"order": index});
      });
    }
  });

  window.AppView = Backbone.View.extend({
  
    el: $("bookr"),
    statsTemplate: _.template('<% if (total) { %><span class="book-count"><span class="number"><%= remaining %></span><span class="word"> <%= remaining == 1 ? "book" : "books" %></span> yet to select.</span><% } %><% if (selected) { %><span class="book-clear"><a href="#">Add <span class="number-selected"><%= selected %> </span>selected <span class="word-selected"><%= selected == 1 ? "book" : "books" %></span></a></span><% } %>'),
  
    events: {
      "keypress #new-book" : "createOnEnter",
      "keyup #new-book"    : "showTooltip",
      "click .book-clear"  : "clearCompleted"
    },
  
    initialize: function() {
      _.bindAll(this, 'addOne', 'addAll', 'render');
    
      this.input = this.$("#new-book");
      
      Books.bind('add',     this.addOne);
      Books.bind('refresh', this.addAll);
      Books.bind('all',     this.render);
    
      Books.fetch();
    },
    
    render: function() {
      var selected = Books.selected().length;
      this.$("#book-stats").set("html",this.statsTemplate({
        selected:       selected,
        total:      Books.length,
        remaining:  Books.length - selected
      }));
    },
    
    addOne: function(book) {
      var view = new BookView({model: book}).render().el;
      this.$("#book-list").grab(view);
      sortableBooks.addItems(view);
    },
    
    addAll: function() {
      Books.each(this.addOne);
    },
  
    createOnEnter: function(e) {
      if (e.code != 13) return;
      Books.create({
        content: this.input.getProperty("value"),
        selected:    false
      });
      this.input.setProperty("value", "");
    },
  
    showTooltip: function(e) {      
      var tooltip = this.$(".ui-tooltip-top");
      tooltip.fade("out");
    
      if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
      
      if (this.input.getProperty("value") !== "" && this.input.getProperty("value") !== this.input.getProperty("placeholder")) {
        this.tooltipTimeout = setTimeout(function(){
          tooltip.fade("in");
        }, 1000);
      }
    },
    
    clearCompleted: function() {
      _.each(Books.selected(), function(book){ book.clear(); });
      return false;
    }
  
  });

  window.App = new AppView;

}());