### Events

#### "title" (text, type)
Emitted when the server sends a title.
* `text` - The text of the title
* `type` - The type of title: "title" or "subtitle"

#### "title_times" (fadeIn, stay, fadeOut)
Emitted when the server sends title timing information.
* `fadeIn` - The time in ticks for the title to fade in
* `stay` - The time in ticks for the title to stay
* `fadeOut` - The time in ticks for the title to fade out

#### "title_clear"
Emitted when the server clears all titles. 