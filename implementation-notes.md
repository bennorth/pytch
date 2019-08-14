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
 
