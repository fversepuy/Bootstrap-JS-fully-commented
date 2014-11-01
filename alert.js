/* ========================================================================
 * Bootstrap: alert.js v3.2.0
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/**********************************
Usage :                   
There are 2 different ways to activate dimiss functionnality on alerts (Bootstrap provides these 2 ways for every plugin) :
- With data-API (See the "ALERT DATA-API" section below) in your HTML markup
- By manually activating it in your main JS with $(".alert").alert(); (see the "ALERT PLUGIN DEFINITION" section below)
Nota : Those 2 sections are completely independant. We can fully remove the whole "ALERT PLUGIN DEFINITION" section and it still works, as long as we have the data-dismiss="alert" markup in our HTML.
Similarly we can remove the "ALERT DATA-API" section and use $(".alert").alert(); in our main JS file.
**********************************/

+function ($) {
// sans le "+", cela serait une "function déclaration" et non une "function expression". On pourrait aussi utiliser des parenthèses pour entourer le tout.
// Ainsi on peut faire une self invoking function expression (noter les parenthèse à la fin du fichier). Une "function declaration" ne peut pas être self-invoquée (surement à cause de l'hoisting qui ferait que la fonction serait éxécutée en début d'execution et non à l'endroit voulu)
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================
  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) { 
    $(el).on('click', dismiss, this.close) // The event handler is attached to $(el), but the second argument of the jQuery "on" method specifies that the event is DELEGATED to elements with attribute [data-dismiss="alert"]. We could have attached the handler directly to elements with attribute [data-dismiss="alert"], but binding document and use delegation allows us to add elements later without having to bind event handlers again.
    //We use the HTML5 data-* attributes, just for targeting the element we want. We could also have used a class or an ID to do the job.
  }

  Alert.VERSION = '3.2.0'

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')
    /* The plugin allows multiple ways to define the target we want to close. It looks if we defined on the button:
    first : a data-target attribute
    if not, second : a href attribute, like href="#myTarget"
    If not, third : if we have a class alert (in this case, only the button itself will be closed)
    Finally, if none of these : the button's parent is the target.
    */

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
      // The logical operator &&'s doc says : Returns expr1 if it can be converted to false; otherwise, returns expr2. Thus, when used with Boolean values, && returns true if both operands are true; otherwise, returns false.
      // Examples of expressions that can be converted to false are those that evaluate to null, 0, the empty string (""), or undefined.
      // so here, if the href is an empty string, expr1 ("selector") is returned and expr2 doesn't need to be evaluated.
    }

    var $parent = $(selector)
    // read carefully : selector was only a string. Now $parent is the targeted element.

    //if (e) e.preventDefault()
    e.preventDefault()
    // we test "if (e)" because we can call the method directly in our js, witout event listener, so the method can be called without passing in an event

    if (!$parent.length) { // if nothing is selected, $parent has no element inside
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))
    // We trigger an event that we name 'close.bs.alert'
    // Nota : Careful : here we change the value of e ! So don't be surprised if e.isDefaultPrevented() returns false (even if we see e.preventDefault() few lines before)
    // why do we override the value of e? to have a unique event namespace, whatever the method used (data API or manually in JS), I guess
    // why do we trigger this? This is a hook. We can hook on this event in our main JS. 
    // Usage : 
    // $('.alert').on('close.bs.alert', function () {
    //   console.log("The alert is going to close! Hurry up if you want to do things before it closes!");  
    // })


    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
      // here we trigger an event "closed.bs.alert" (so we can hook on this event to do stuffs after it has close). Of course if we didn't previously set an event with that name (using the .on method) in our main .js, the event doesn't exist and the trigger has no effect. This causes no error. 
      // Usage : 
      // $('.alert').on('closed.bs.alert', function () {
      //   console.log("The alert has been closed! Bye!");  
      // })
    }

    $.support.transition && $parent.hasClass('fade') ?
    // this uses the transition module.
    // how to use it? Mystery, the doc is so uncomplete...
      $parent
        .one('bsTransitionEnd', removeElement) //one is executed at most once
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================
  // Usage :
  // $(".alert").alert(); // initialized with defaults
  // $(".alert").alert("close"); // initializes and invokes "close" immediately
  function Plugin(option) {
    return this.each(function () { // for each matching element, i.e. for each div with the class alert, we do the following
    // It is useful for a jQuery plugin to return the jQuery object (here probably $(".alert")), in order to use chaining.
      var $this = $(this) // this = the div with the alert class
      var data  = $this.data('bs.alert') // get the value of the data bs.alert attached to our div, if it exists
      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      // If not, we add that attached data (named bs.alert) and set it's value to an instance of Class Alert (defined above).
      // This means that Alert IS executed here. And this is the important part : we set here the click event listener.
      // I don't really get the point of attaching it with data association... maybe it's for not setting again the event listeners if we call the function with a parameter : $.fn.alert('close'). But wouldn't it be easier to use a "if" condition here?
      if (typeof option == 'string') data[option].call($this)
      // if we called $(".alert").alert('close'), so option here is "close", then we call here the close method of the data object (see the close method in Class Alert).
    })
  }

  var old = $.fn.alert
  // If there already was a jquery plugin/function named "alert", we temporary stock it's value here, in order to give it back it's value later with the noConflict method (defined below)

  $.fn.alert             = Plugin 
  // We create a jQuery plugin, named alert (by adding the alert method to jquery prototype ($.fn)). The content of our alert function is defined above in the Plugin function. 
  // It is more common to create a jQuery plugin in only one line, like this: $.fn.alert = function() {...}
  
  $.fn.alert.Constructor = Alert
  // Each plugin also exposes its raw constructor on a Constructor property. This is useful if you want, for example, to change the default settings of the plugin (without modifying this file, of course). You can do it like this : 
  // $.fn.alert.Constructor.theVarIwantToChange = value;


  // ALERT NO CONFLICT
  // =================
  /* Usage :
  var bootstrapButton = $.fn.button.noConflict() // return $.fn.button to previously assigned value
  $.fn.bootstrapBtn = bootstrapButton // give $().bootstrapBtn the Bootstrap functionality */
  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============
//  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)
  /* Nota : first argument of the jQuery "on" method accepts namespaces that simplify removing or triggering the event. (chain them like css classes). Here we define 3 namespaces which are bs, alert and data-api. We can now remove the click event handler like this :
  - $(document).off("click") removes all click events binded on document which seems a bit overkilling...
  - $(document).off("click.bs.alert") removes click events which have been attached with the namespace bs.alert
  - $(document).off("click.data-api") removes all click events attached with the namespace data-api, i.e. it removes events from other bootstrap plugins (which also use on('click.anything.data-api'), not just alert
  - $(document).off("click.bs.alert.data-api") removes only click events attached with all these namespaces like here with .on('click.bs.alert.data-api')
  - any combination of the namespaces is possible since only one part has to match.
  Nota : here data-api is an arbitrary name for the namespace. It has no effect by itself. 

  // Second argument of the jQuery .on method : The event handler is attached to document, but the second argument of the jQuery "on" method specifies that the event is DELEGATED to elements with attribute [data-dismiss="alert"]. We could have attached the handler directly to elements with attribute [data-dismiss="alert"], but binding document and use delegation allows us to add elements later without having to bind event handlers again.
  We use the HTML5 data-* attributes, just for targeting the element we want. We could also have used a class or an ID to do the job.

  // 3rd argument : here we call the close method of the Alert Class without even instantiating the Alert Class. Indeed, in Javascript this is possible because prototype is an object, and the method has been defined on the prototype.
  */ 

}(jQuery);
