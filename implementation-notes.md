In the current implementation:

Green flag is handled mostly within _pytch.js. 
A document element with ID 'green-flag' is located, and passes through three states
  Not-clicked
  just-clicked
  has-been-clicked

The process_frame() event loop uses these to trigger the 'on green flag' functions.

mod.run() attaches an event handler to the green flag element.

##

_pytch.js has to hook into the surrounding HTML document. It currently
looks for the following things:

* table id=thread-monitor
   _pytch will insert an innerHTML for the tbody.
   
* Canvas id=pytch-canvas
  _pytch will draw to this, accessed via "mod.canvas_elt" and mod.canvas_ctx
  
  
* div id=shown-variables
  _pytch will set the innerHTML to monitor variables.
  
* ?? click-report
  set innherHTML to show clicks
  
* green-flag
  _pytch sets an onclick
  
* frame-idx

* skulpt-stdout


--- 

# Reloading Pytch programs

When the Pytch program is reloaded (recompiled) we need to detect it,
unhook any state that was associated with the previous program (if
there was one), and start a new one. There are three parts:

 On loading _pytch.js the module setup checks for an object called
  Sk.Pytch. If it does not exist it's created, with a member
  'instance_counter' initialised to 1.
  If Sk.Pytch does exist then we assume this is a re-compiled
  module. We increment the instance counter.
   TODO: This could be where we re-init the canvas?
  
  In process_frame() we check the captured 'instance_counter' against
  the global Sk.Pytch.instance_counter. If they differ then this run
  of process_frame is from a previous module, so we immediately
  return, without setting up a new animation frame.
  
   TODO: Confirm that this is the best way to do this (vs, say,
   checking for this in the Thread manager)?


(1) Detecting reloads
 via Sk.Pytch.instance_counter
 
(2) Resetting the canvas
The canvas setup now tries to reset a default state and clear the canvas.

(3) Cancelling any pytch threads that are running (this crosses over
with the 'red button' action of stopping a running program).

 Handled in process_frame() as noted above.
 
 TODO:
 
 A flag in Sk.Pytch that indicates that all threads should die? 
 Having some metadata attached to threads indicating which script they
 are from might be helpful in implementing 'stop this script' behaviour?
 
# Auto-registering stage and sprites

Can we do away with the explicit calls to
'register-{stage,sprite}-class' using Python reflection?

This seems to work in Trinket:

class Stage():
    pass
  
class X(Stage):
    pass
  

gs = globals()
for x in gs:
  if( issubclass(gs[x], Stage)):
    print(x, " is a Stage object")

(it identifies Stage as a Stage object too, but we can special case that)

This relies on the Sprite instances being global, of course. If
somebody gets fancy then this won't catch them.

Can we use metaclasses instead?

--- 

We need a credits file. For now:
balloon:
https://www.publicdomainpictures.net/en/view-image.php?image=77932&picture=balloon-purple-clip-art


--- 

Collision detection (and many other things) could come for free:
https://github.com/CreateJS/EaselJS/

--- 
variable output should be cleared on green flag?

