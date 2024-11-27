// sections/featured-products
$(document).on(
  "staticClick.flickityt4s",
  ".t4s-imgs-preview.flickityt4s",
  function (event, pointer, cellElement, cellIndex) {
    if (!cellElement) {
      return;
    }
    event.preventDefault();
    var $this = $(cellElement).find("[data-t4s-click-on]");
    let action_to = $this.data("connect");
    $(".t4s-sc-f-colls .item--click-on.t4s--opend").removeClass("t4s--opend");
    $(action_to + ", .t4s-sc-f-colls--click-on").addClass("t4s--opend");
    setTimeout(function () {
      $(action_to).removeClass("t4s--opend").addClass("t4s--opended");
    }, 300);
    $(action_to)
      .attr("data-height", $(action_to).outerHeight() + "px")
      .css("--height", $(action_to).outerHeight() + "px");
    $(".t4s-sc-f-colls .t4s-sc-f-colls--click").css(
      "--height",
      $(action_to).attr("data-height")
    );
    $(action_to).find(".flickityt4s").flickityt4s("resize");
  }
);
$(document).on(
  "click",
  ".t4s-sc-f-colls .t4s-f-colls--close",
  function (event) {
    event.preventDefault();
    $(this)
      .parents(".t4s-sc-f-colls .item--click-on")
      .removeClass("t4s--opend t4s--opended");
    $(".t4s-sc-f-colls--click").css("--height", "");
    $(".t4s-sc-f-colls--click-on").removeClass("t4s--opend");
  }
);
setTimeout(function () {
  $.each($(".t4s-sc-f-colls .t4s-f-colls--desc"), function (index, id) {
    $(this).css("--height", $(this).outerHeight() + "px");
  });
}, 300);

// Product page
$(document).on("click", ".t4s-pr__video-btn", function (e) {
  $('[data-mdtype="video"]').trigger("click");
});

$(document).on("click", "[name=purchase_option]", function () {
  var el_mirror = $(this).attr("id");
  $(this)
    .parents("fieldset")
    .find("[name=selling_plan]")
    .attr("disabled", "disabled");
  $("label[for=" + el_mirror + "] [name=selling_plan]").removeAttr("disabled");
});

// Mobile Menu float
$(document)
  .on("click", ".t4s-menu-basic .t4s-mb-nav__icon-float", function (e) {
    e.preventDefault();
    var id_child = $(this).attr("data-child");
    $(id_child).addClass("is--opend");
    $(this).parents(".t4s-menu-item").first().addClass("is--opend");
    if (id_child.indexOf("item_grandchild") >= 0) {
      $(".t4s-drawer-menu__back")
        .css({ opacity: 1 })
        .attr({ "data-grandchild": id_child });
    } else {
      $(".t4s-drawer-menu__back")
        .css({ opacity: 1 })
        .attr({ "data-child": id_child });
    }
  })
  .on("click", ".t4s-menu-basic .t4s-title-parent", function (e) {
    e.preventDefault();
    $(this).parent().removeClass("is--opend");
    var id_child = $(this).parent().attr("id");
    $('[data-child="#' + id_child + '"]')
      .parents(".t4s-menu-item")
      .first()
      .removeClass("is--opend");
  })
  .on("click", ".t4s-menu-basic .t4s-only_icon_false", function (e) {
    e.preventDefault();
    $this = $(this).find(".t4s-mb-nav__icon-float");
    $($this.attr("data-child")).addClass("is--opend");
    $this.parents(".t4s-menu-item").first().addClass("is--opend");
  })
  .on("click", ".t4s-menu-basic .t4s-drawer-menu__back", function (e) {
    var id_child = $(this).attr("data-child");
    var id_gchild = $(this).attr("data-grandchild");
    if (id_gchild !== "") {
      $(id_gchild).removeClass("is--opend");
      $(this).attr("data-grandchild", "");
    } else {
      $(id_child).removeClass("is--opend");
      $(this).attr("data-child", "");
      $(".t4s-drawer-menu__back").css({ opacity: 0 });
    }
  });

$(".t4s-brands-filter button").click(function () {
  $(".t4s-brands-source__linklist").css({
    height: $(".t4s-brands-source__linklist").height(),
  });
  $(".t4s-brands-source__linklist .t4s-filter-item").each(function () {
    $(this).attr("data-height", $(this).height());
  });
  var dataFilter = $(this).data("filter");
  $(".t4s-brands-filter button").removeClass("is--active");
  $(this).addClass("is--active");

  if (dataFilter == "all") {
    $(".t4s-brands-source__linklist").css({ height: "" });
    $(".t4s-brands-source__linklist").children("div.t4s-filter-item").show(400);
  } else {
    $(".t4s-brands-source__linklist")
      .children("div:not(." + dataFilter + ")")
      .hide(400);
    var height = 0;
    $(".t4s-brands-source__linklist")
      .children("div." + dataFilter)
      .each(function () {
        height += $(this).height();
      });
    $(".t4s-brands-source__linklist").css({ height: height });
    $(".t4s-brands-source__linklist")
      .children("div." + dataFilter)
      .show(400);
  }
});

// Close search with ESC
window.closeCustomKey = function () {
  $(".show-search").removeClass("show-search");
};

// progress bar in article pages
let prevScrollpos = $(window).offset.top;

$(document).on("scroll", function () {
  // sticky
  let currentScrollPos = $(window).scrollTop();
  if ($(window).scrollTop() > 300) {
    if (prevScrollpos < currentScrollPos) {
      $("#scroll-bar-article").addClass("is--active");
    } else {
      $("#scroll-bar-article").removeClass("is--active");
    }
  }
  prevScrollpos = currentScrollPos;
  // progress bar
  let scrollTop2 = window.scrollY;
  let docHeight = document.body.offsetHeight;
  let winHeight = window.innerHeight;
  let scrollPercent = scrollTop2 / (docHeight - winHeight);
  let scrollPercentRounded = Math.round(scrollPercent * 100);
  $("#article-progress-bar").css("width", `${scrollPercentRounded}%`);
});
// scroll to comment
$(document).on("click", "#scroll-bar-comment", function () {
  $("html, body").animate(
    {
      scrollTop: $("#CommentForm").offset().top,
    },
    1000
  );
});

$(document).on("click", "#t4s-backTop", function () {
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    isBehaviorSmooth ? 0 : 800
  );
});

$(document).on("click", 'a[href*="preview_theme_id="]', function (event) {
  var $this = $(this);
  event.preventDefault();
  $.ajax({
    type: "POST",
    url: Shopify.routes.root + "cart.js",
    data: { "attributes[collection_items_per_row]": "" },
    dataType: "json",
  }).done(function () {
    window.location.href = $this.attr("href");
  });
});

/*! before-after.js */
(function ($) {
  function drags(dragElement, resizeElement, container) {
    let pos_css = isThemeRTL ? "right" : "left";
    // Initialize the dragging event on mousedown.
    dragElement.on("mousedown.ba-events touchstart.ba-events", function (e) {
      dragElement.addClass("ba-draggable");
      resizeElement.addClass("ba-resizable");

      // Check if it's a mouse or touch event and pass along the correct value
      var startX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;

      // Get the initial position
      var dragWidth = dragElement.outerWidth(),
        posX = dragElement.offset().left + dragWidth - startX,
        containerOffset = container.offset().left,
        containerWidth = container.outerWidth();

      // Set limits
      minLeft = containerOffset + 10 - 11;
      maxLeft = containerOffset + containerWidth - dragWidth - 10 + 11;

      // Calculate the dragging distance on mousemove.
      dragElement
        .parents()
        .on("mousemove.ba-events touchmove.ba-events", function (e) {
          // Check if it's a mouse or touch event and pass along the correct value
          var moveX = e.pageX ? e.pageX : e.originalEvent.touches[0].pageX;

          leftValue = moveX + posX - dragWidth;

          // Prevent going off limits
          if (leftValue < minLeft) {
            leftValue = minLeft;
          } else if (leftValue > maxLeft) {
            leftValue = maxLeft;
          }

          // Translate the handle's left value to masked divs width.
          widthValue =
            ((leftValue + dragWidth / 2 - containerOffset) * 100) /
            containerWidth;
          widthValue = isThemeRTL ? 100 - widthValue + "%" : widthValue + "%";

          // Set the new values for the slider and the handle.
          $(".ba-draggable").css(pos_css, widthValue);
          $(".ba-resizable").css("width", widthValue);
          // Bind mouseup events to stop dragging.
        })
        .on(
          "mouseup.ba-events touchend.ba-events touchcancel.ba-events",
          function () {
            dragElement.removeClass("ba-draggable");
            resizeElement.removeClass("ba-resizable");
            // Unbind all events for performance
            $(this).off(".ba-events");
          }
        );
      e.preventDefault();
    });
  }

  // Define plugin
  $.fn.beforeAfter = function () {
    var cur = this;
    // Adjust the slider
    //     var width = cur.width()+'px';
    //     cur.find('.resize img').css('width', width);
    // Bind dragging events
    drags(cur.find(".t4s-handlebeaf"), cur.find(".t4s-resizebeaf"), cur);

    // Update sliders on resize.
    // Because we all do this: i.imgur.com/YkbaV.gif
    //     $(window).resize(function(){
    //       var width = cur.width()+'px';
    //       cur.find('.resize img').css('width', width);
    //     });
  };
})(jQuery_T4NT);
jQuery_T4NT(document).ready(function ($) {
  if ($(".t4s-resizebeaf").length > 0) {
    $(".t4s-beafimg-inner").each(function () {
      $(this).beforeAfter();
    });
  }
});
