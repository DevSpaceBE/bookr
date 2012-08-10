$ ->
  # Book
  window.Book = Backbone.Model.extend(
    toggle: ->
      @save selected: not @get("selected")

    # Remove this Book from *localStorage*, deleting its view.
    clear: ->
      @destroy()
      $(@view.el).remove()
  )

  # Book List
  window.BookList = Backbone.Collection.extend(
    model: Book
    url: "/books"

    # Returns all selected books.
    selected: ->
      @filter (book) ->
        book.get "selected"


    nextOrder: ->
      return 1  unless @length
      @last().get("order") + 1

    comparator: (book) ->
      book.get "order"

    pluralize: (count) ->
      (if count is 1 then "book" else "books")
  )

  window.Books = new BookList

  window.BookView = Backbone.View.extend(
    tagName: "li"
    className: "book"
    template: _.template("<input type='checkbox' class='book-check' /><div class='book-isbn'></div><span class='book-destroy'></span><input type='text' class='book-input' />")
    events:
      "click .book-check": "toggleSelected"
      "click .book-destroy": "clear"

    initialize: ->
      _.bindAll this, "render", "close"
      @model.bind "change", @render
      @model.view = this

    render: ->
      $(@el).html @template(@model.toJSON())
      $(@el).attr "id", "book-" + @model.id
      @setContent()
      this

    setContent: ->
      isbn = @model.get("isbn")
      @$(".book-isbn").html isbn
      @$(".book-input").val isbn
      if @model.get("selected")
        @$(".book-check").prop "checked", true
        $(@el).addClass "selected"
      else
        @$(".book-check").prop "checked", false
        $(@el).removeClass "selected"
      @input = @$(".book-input")

    toggleSelected: ->
      @model.toggle()

    close: ->
      @model.save isbn: @input.val("value")

    clear: ->
      @model.clear()
  )

  window.AppView = Backbone.View.extend(
    el: $("#bookr")
    statsTemplate: _.template("<% if (total) { %><span class=\"book-count\"><span class=\"number\"><%= remaining %></span><span class=\"word\"> <%= remaining == 1 ? \"book\" : \"books\" %></span> yet to select.</span><% } %><% if (selected) { %><span class=\"book-clear\"><a href=\"#\">Add <span class=\"number-selected\"><%= selected %> </span>selected <span class=\"word-selected\"><%= selected == 1 ? \"book\" : \"books\" %></span></a></span><% } %>")
    events:
      "keypress #new-book": "createOnEnter"
      "click .book-clear": "clearCompleted"

    initialize: ->
      _.bindAll this, "addOne", "addAll", "render"
      @input = @$("#new-book")
      Books.bind "add", @addOne
      Books.bind "reset", @addAll
      Books.bind "all", @render
      Books.fetch()
      @

    render: ->
      selected = Books.selected().length
      @$("#book-stats").html @statsTemplate(
        selected: selected
        total: Books.length
        remaining: Books.length - selected
      )

    addOne: (book) ->
      view = new BookView(model: book).render().el
      @$("#book-list").prepend view

    addAll: ->
      Books.each @addOne

    createOnEnter: (e) ->
      return unless e.keyCode is 13
      Books.create
        isbn: @input.val()
        selected: false

      @input.val("")

    clearCompleted: ->
      _.each Books.selected(), (book) ->
        book.clear()

      false
  )

  window.App = new AppView
