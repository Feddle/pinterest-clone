
let $grid = $(".grid").masonry({
    itemSelector: ".grid-item",
    columnWidth: ".grid-sizer",
    percentPosition: true,
    //gutter: 10
});
// layout Masonry after each image loads
$grid.imagesLoaded().progress(() => {
    $grid.masonry("layout");
});

$(() => {       
    $("form").on("submit", handleAddPin);
});


function handleAddPin(event) {   
    event.preventDefault(); 
    let inputs = $("input");
    let buttons = $("button");
    let div = $(".modal__status-div");
    let p = $(".modal__status-div p");
    let spinner = $(".modal__status-div div");

    inputs.addClass("disabled").prop("disabled", true);
    buttons.addClass("disabled").prop("disabled", true);    
    div.removeClass("d-none");
    spinner.removeClass("d-none");
    p.text("Adding pin, please wait").removeClass("text-danger");
    $.ajax({
        url: "/add",
        method: "POST",
        data: {link: $("#input_link").val(), title: $("#input_title").val()},            
        success: (d) => {            
            if(typeof d === "string") {
                p.text(d).addClass("text-danger");
                inputs.removeClass("disabled").prop("disabled", false);
                buttons.removeClass("disabled").prop("disabled", false);    
                spinner.addClass("d-none");
            }
            else {
                spinner.addClass("d-none");
                p.text("Pin added!").addClass("text-success");
                window.location.reload(true);
            }            
        },
        error: () => {
            p.text("Error occurred, please try again").addClass("text-danger");
            inputs.removeClass("disabled").prop("disabled", false);
            buttons.removeClass("disabled").prop("disabled", false);    
            spinner.addClass("d-none");
        }
    });
}