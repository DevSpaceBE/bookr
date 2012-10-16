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
  idAttribute: "_id"

  toggle: ->
    selected = not @get("selected")
    @set('selected', selected)

  clear: ->
    @destroy
      wait: true
      success: @remove

  remove: =>
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

window.Books = new Bookr.Collections.BookList;

class Bookr.Views.AppView extends Backbone.View
  el: $("#bookr")
  statsTemplateId: "#stats-template"
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
    selected       = Books.selected().length
    @statsTemplate = Handlebars.compile($(@statsTemplateId).html())
    remaining      = Books.length - selected
    @$("#book-stats").html(@statsTemplate
      selected         : selected
      total            : Books.length
      remaining        : remaining
      one              : remaining == 1
      multiple_selected: selected != 1
      one_selected     : selected == 1
    )

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
        Books.create(
          response.result.items[0].volumeInfo
          { wait: true }
        )
      @input.val("")

  clearCompleted: ->
    false

window.App = new Bookr.Views.AppView;

class Bookr.Views.BookView extends Backbone.View
  tagName:   "li"
  className: "book"
  bookTemplateId: "#book-template"
  events:
    "click .book-check": "toggleSelected"
    "click .book-destroy": "clear"

  initialize: ->
    _.bindAll(@, "render", "close")
    @model.bind("change", @render)
    @model.view = @

  render: ->
    @template = Handlebars.compile($(@bookTemplateId).html())
    $(@el).html(@template(@model.toJSON()))
    $(@el).attr("id", "book-" + @model.get('_id'))
    @setContent()
    @

  setContent: ->
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