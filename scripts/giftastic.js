//var queryURL = "https://api.giphy.com/v1/gifs/search?api_key=m6YjsTmnbMqdyDwmmRVBy4CURcngYDyi";
var queryURL = "https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC";
//var characters = ["bugs bunny","daffy duck","elmer fudd","yosemite sam","tweety bird","sylvester the cat","yogi bear","top cat"];

var characters;
var defaultCharacters = ["bugs bunny","daffy duck","elmer fudd","yosemite sam","tweety bird","sylvester the cat","yogi bear","top cat"];

$(document).ready(function(){

    var currentImages; // To keep track of currently displayed images

    if(null != localStorage.getItem("saved-toon-characters")){
        // We have the toon characters saved in local storage. 
        // Retrieve them.
        characters = JSON.parse(localStorage.getItem("saved-toon-characters"));
        console.log(characters);
    } else {
        // They aren't present. Add them.
        characters = defaultCharacters;
        localStorage.setItem("saved-toon-characters",JSON.stringify(characters));
    }

    // Create the dynamic buttons and place them in the 'gif-buttons' div
    for(i = 0; i < characters.length; i++){
        var newButton = $("<button>");
        newButton.text(characters[i]);
        newButton.addClass("btn");
        newButton.addClass("btn-primary");
        newButton.addClass("gif-button");
        $("#gif-buttons").append(newButton);
    }

    // Create the text box and submit button for the user to enter
    // new search strings
    var newInput = $("<input>");
    newInput.attr("type","text");
    newInput.attr("id", "giphy-textbox");
    newInput.attr("width", "100%");

    var newLabel = $("<label>");
    newLabel.attr("for","giphy-textbox");
    newLabel.html("Type in a cartoon character : &nbsp");

    var newButton = $("<button>");
    newButton.attr("type","submit");
    newButton.addClass("btn");
    newButton.addClass("btn-primary");
    newButton.addClass("add-gif-btn");
    newButton.text("Submit");

    $("#add-buttons").append(newLabel);
    $("#add-buttons").append(newInput);
    $("#add-buttons").append("<br\>");
    $("#add-buttons").append(newButton);
    
    /**
     *  Function to display the gifs obtained from giphy
     */
    function addGifs(response){
        console.log(response);

        var newImgURL;
        var numImages = response.data.length;

        // Make sure we got atleast one gif
        if(numImages === 0){
            console.log("No results for specified query");
            return;
        }

        console.log("Got "+numImages+" images");

        // First, clear the currently displayed images
        $("#giphy-results").empty();

        // Loop through the images and add them to the giphy-results div
        for(var i = 0; i < numImages; i++){
            var newImg = $("<img>");
            var rating = response.data[i].rating.trim().toLowerCase();
            if(!("g" === rating || rating.includes("pg") || "y" === rating)){
            console.log("Error - the query returned a non g/pg rated image at index "+i);
            continue;
            }
            newImgURL = response.data[i].images.fixed_height.url;
            //console.log("URL for the image is "+newImgURL);
            newImg.attr("image-number",i);
            newImg.attr("animated",true);
            newImg.attr("src",newImgURL);
            newImg.addClass("gifimg");
            $("#giphy-results").append(newImg);
        }
    };

    /**
     *  Click handler for each giphy button. Queries giphy 
     *  for 10 images matching the search string.
     *  The query itself looks for images that are rated 
     * "g" , "pg" or "y".
     *
     *  However, despite the ratings filter, we're getting 
     *  "r" rated gifs. These are being skipped.
     */
    $(document).on("click","button.gif-button",function(){
        var character = $(this).text().trim();

        console.log("You clicked "+character);

        character = character.replace(/\s/g, "+")

        queryURL+= "&q="+character;
        queryURL+= "&(rating=g|rating=pg)";
        queryURL+= "&limit=10";

        console.log("The query is "+queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            addGifs(response);
            currentImages = response.data;
        });
    });

    /**
     *  Click handler for the currently displayed gifs
     *  Toggles them between still and animated.
     */
    $(document).on("click","img",function(){
        var imgNumber;
        var targetImg;

        console.log($(this));
        // Get the 'image-number' attribute
        imgNumber = $(this).attr("image-number");

        console.log("The target is image number "+imgNumber);

        targetImg = currentImages[imgNumber];

        // Toggle the animation status
        var isAnimated = $(this).attr("animated");

        if("true" === isAnimated){
            console.log("Currently animated, switching to still");
            $(this).attr("src", targetImg.images.fixed_height_still.url);
            $(this).attr("animated",false);
        }else{
            console.log("Currently still, switching to animated");
            $(this).attr("src", targetImg.images.fixed_height.url);
            $(this).attr("animated",true);
        }
    });

    /**
     *  Click handler to add a new gif button
     */
    $(document).on("click","button.add-gif-btn",function(event){
        event.preventDefault();

        console.log("New search string submitted");

        var newSearchStr = $("#giphy-textbox").val().trim().toLowerCase();

        if("" === newSearchStr){
            alert("Please enter a cartoon character");
            $("#giphy-textbox").val("");
            return;
        }

        if(characters.includes(newSearchStr)){
            alert(newSearchStr + " is already present");
        } else {
            var newButton = $("<button>");
            newButton.text(newSearchStr);
            newButton.addClass("btn");
            newButton.addClass("btn-primary");
            newButton.addClass("gif-button");
            $("#gif-buttons").append(newButton);

            characters.push(newSearchStr);
            localStorage.setItem("saved-toon-characters",JSON.stringify(characters));
        }
        $("#giphy-textbox").val("");
    })

});