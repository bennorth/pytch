# List of Scratch blocks

This is a list of the Scratch 3 blocks, with some comments about Pytch support.

## Motion ##

- Move **n** steps
- turn right **n** degrees
- turn left **n** degrees
- go to (**random position** | **mouse pointer**)
- go to x: **n** y: **n**
- glide **n** secs to (**random position** | **mouse pointer**)
- glide **n** secs to x: **n** y : **n**
- point in direction **n**
- point towards (**mouse pointer** | **sprite name**)
- change x by **n**
- set x to **n**
- change y by **n**
- set y to **n**
- if on edge bounce
- set rotation style (**left-right** | **don't rotate** | **all around**)

Reporter blocks:

- x-position
- y-position
- direction

# Looks

- say **str** for **n** seconds
- say **str**
- think **str** for **n** seconds
- think **str**
- switch costume to **costume-name**
- switch backdrop to **backdrop-name**
- next backdrop
- change size by **n**
- set size to **n**%
- change (**color**|**fisheye**|**whorl**|**pixelate**|**mosaic**|**brightness**|**ghost**) effect by **n**
- set (**color**|**fisheye**|**whorl**|**pixelate**|**mosaic**|**brightness**|**ghost**) to **n**
- clear graphic effects
- show
- hide
- go to (**front**|**back**) layer
- go (**forward**|**back**) **n** layers

Reporter blocks:

- costume (**number**|**name**)
- backdrop (**number**|**name**)
- size

# Sound

- Play sound **sound-name** until done
- Start **sound-name**
- Stop all sounds
- change (**pitch**|**pan left-right**) effect by n 
- set (**pitch**|**pan left-right**) effect to n 
- clear sound effects
- change volume by **n**
- set volume to **n**%

Reporter blocks

- Volume

# Events

key-name is a standard key name, including symbolic names for up-arrow, etc., or it can be the special 'any key' value.

- When green flag clicked
- When **key-name** key pressed
- When this sprite clicked
- When backdrop switches to **backdrop-name**
- When (**loudness**|**timer**) > n
- When I receive **message-name**
- Broadcast **message-name**
- Broadcast **message-name** and wait

# Control

- wait **n** seconds
- Repeat **n**
- Forever
- if **condition** then **blocks**
- if **condition** then **blocks** else **blocks**
- wait **blocks** until **condition**
- repeat **blocks** until **condition**
- stop (**all**|**this script**|**other scripts in sprite**)
- When I start as a clone
- Create clone of (**myself**|**sprite name**)
- Delete this clone

# Sensing

- ask **str** and wait
- set drag mode (**draggable**|**not draggable**)
- Reset timer

Reporter blocks

- touching (**mouse pointer**|**edge**|**sprite name**)
- touching color **color-name**
- color **color-name** is touching **color-name**
- distance to (**mouse pointer**|**sprite name**)
- answer
- key **key-name** is pressed
- mouse down?
- mouse x
- mouse y
- loudness
- timer
- (**backdrop number**|**backdrop name**|**volume**|**variable-name**) of (**stage**|**sprite name**)
- current (**year**|**month**|**day of week**|**hour**|**minute**|**second**)
- days since 2000
- username

# Operators

Reporter blocks

- **n** + **n**
- **n** - **n**
- **n** * **n**
- **n** / **n**
- pick random **n** to **n**
- **n** > **n**
- **n** < **n**
- **n** = **n**
- **condition** and **condition**
- **condition** or **condition**
- not **condition**
- join **str** **str**
- letter **n** of **str**
- length of **str**
- **str** contains **str**?
- **n** mod **n**
- round **n**
- (**abs**|**floor**|**ceiling**|**sqrt**|**sin**|**cos**|**tan**|**asin**|**acos**|**atan**|**ln**|**log**|**e^**|**10^**) of **n**

# Variables

Make a variable

- Set **variable name** to **n**
- change **variable name** by n
- show variable **variable name**
- hide variable **variable name**

Reporter blocks

- **variable name**

Make a list

Lists can contain numbers, strings, or even other lists. 

If you say 'add list1 to list2' you get a copy of list1, not a reference to it.


- add **thing** to **list name**
- delete **n** of **list name**
- delete all of **list name**
- insert thing at **n** of **list name**
- replace item **n** of **list name** with **thing**
- show list **list name**
- hide list **list name**

Reporter blocks

- item **n** of **list name**
- item # of **thing** in **list name**
- length of **list name**
- **list name** contains **thing**?
- **list name**

Make a block

Creates a new block with inputs (name, boolean). The inputs are draggable from the parameter list. They are read-only inputs, not local variables (for example, they can't be used as the target of a 'set variable to n' block).
