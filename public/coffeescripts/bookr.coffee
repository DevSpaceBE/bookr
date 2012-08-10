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
    template: _.template("<input type='checkbox' class='book-check' /><div class='book-content'></div><span class='book-destroy'></span><input type='text' class='book-input' />")
    events:
      "click .book-check": "toggleSelected"
      "click .book-destroy": "clear"
      "keypress .book-input": "updateOnEnter"

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
      content = @model.get("content")
      @$(".book-content").html content
      @$(".book-input").val content
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
      @model.save content: @input.val("value")
      $(@el).removeClass "editing"

    updateOnEnter: (e) ->
      console.log "est-ce qu'on arrive ici?"
      @close()  if e.code is 13

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
      Books.bind "refresh", @addAll
      Books.bind "all", @render
      Books.fetch()

    render: ->
      selected = Books.selected().length
      @$("#book-stats").html @statsTemplate(
        selected: selected
        total: Books.length
        remaining: Books.length - selected
      )

    addOne: (book) ->
      view = new BookView(model: book).render().el
      @$("#book-list").append view

    addAll: ->
      Books.each @addOne

    createOnEnter: (e) ->
      return unless e.keyCode is 13
      Books.create
        content: @input.val()
        selected: false

      @input.val("")

    clearCompleted: ->
      _.each Books.selected(), (book) ->
        book.clear()

      false
  )

  window.App = new AppView
