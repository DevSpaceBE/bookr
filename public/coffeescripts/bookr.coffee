googleApiOnload = ()->
  gapi.client.setApiKey("AIzaSyAmiUyoMClSzHIRs47csnhCtC4QAK6FHBQ")
  gapi.client.load('books', 'v1')

window.googleApiOnload = googleApiOnload

window.Bookr =
  Models: {}
  Collections: {}
  Views: {}
  Routers: {}

class Bookr.Models.Book extends Backbone.Model
  toggle: ->
    @save selected: not @get("selected")

  clear: ->
    @destroy()
    $(@view.el).remove()

class Bookr.Collections.BookList extends Backbone.Collection
  model: Bookr.Models.Book
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

Books = new Bookr.Collections.BookList;

class Bookr.Views.AppView extends Backbone.View
  el: $("#bookr")
  statsTemplate: _.template("<% if (total) { %><span class=\"book-count\"><span class=\"number\"><%= remaining %></span><span class=\"word\"> <%= remaining == 1 ? \"book\" : \"books\" %></span> yet to select.</span><% } %><% if (selected) { %><span class=\"book-clear\"><a href=\"#\">Add <span class=\"number-selected\"><%= selected %> </span>selected <span class=\"word-selected\"><%= selected == 1 ? \"book\" : \"books\" %></span></a></span><% } %>")
  events:
    "keypress #new-book": "createOnEnter"
    "click .book-clear": "clearCompleted"

  initialize: ->
    _.bindAll(@, "addOne", "addAll", "render")
    @input = @$("#new-book")
    Books.bind("add", @addOne)
    Books.bind("reset", @addAll)
    Books.bind("all", @render)
    Books.fetch()
    @

  render: ->
    selected = Books.selected().length
    @$("#book-stats").html(@statsTemplate(
      selected: selected
      total: Books.length
      remaining: Books.length - selected
    ))

  addOne: (book)->
    view = new Bookr.Views.BookView(
      model: book
    ).render().el
    @$("#book-list").prepend(view)

  addAll: ->
    Books.each(@addOne)

  createOnEnter: (e)->
    if (e.keyCode == 13)
      isbn    = @input.val();
      request = gapi.client.books.volumes.list({'q': {'isbn': isbn}})
      request.execute (response)->
        Books.create(response.result.items[0].volumeInfo)
      @input.val("")

  clearCompleted: ->
    _.each Books.selected(), (book)->
      book.clear();
    false;

App = new Bookr.Views.AppView;

class Bookr.Views.BookView extends Backbone.View
  tagName:   "li"
  className: "book"
  template: _.template("<input type='checkbox' class='book-check' /><div class='book'></div><span class='book-destroy'></span><input type='text' class='book-input' />")
  events:
    "click .book-check": "toggleSelected"
    "click .book-destroy": "clear"

  initialize: ->
    _.bindAll(@, "render", "close")
    @model.bind("change", @render)
    @model.view = @

  render: ->
    $(@el).html(@template(@model.toJSON()))
    $(@el).attr("id", "book-" + @model.id)
    @setContent()
    @

  setContent: ->
    title = @model.get("title")
    @$(".book").html(title)
    @$(".book-input").val("")
    if (@model.get("selected"))
      @$(".book-check").prop("checked", true)
      $(@el).addClass("selected")
    else
      @$(".book-check").prop("checked", false)
      $(@el).removeClass("selected")
    @$(".book-input");

  toggleSelected: ->
    @model.toggle()

  close: ->
    @model.save isbn: @input.val("value")

  clear: ->
    @model.clear()