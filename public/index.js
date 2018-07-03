
let $grid = $(".grid").masonry({
    itemSelector: ".grid-item",
    columnWidth: ".grid-sizer",
    percentPosition: true,
    gutter: 10
});
// layout Masonry after each image loads
$grid.imagesLoaded().progress( function() {
    $grid.masonry();
});