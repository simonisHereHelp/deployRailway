//  // Selecting elements that are supposed to be animated
let animateChatBot          = document.querySelector( ".chatBot" )
let animateChatSeparater    = document.querySelector( ".chatBot .chatBotHeading + hr" )
let triggerLabel = document.querySelector( "#chatOpenTrigger")
let animateChatBody         = document.querySelector( ".chatBot .chatBody" )
let animateChatForm         = document.querySelector( ".chatBot .chatForm" )
let animateChatForm2         = document.querySelector( ".chatBot .chatForm2" )

//  // Selecting trigger elements of animation
let chatOpenTrigger         = document.querySelector( ".chatBot .chatBotHeading #chatOpenTrigger" )
let chatCloseTrigger        = document.querySelector( ".chatBot .chatBotHeading #chatCloseTrigger" )
let chatHeading             = document.querySelector(".chatBotHeading")
//  // Setting up trigger for click event

//  // Selecting chat session to clear after conversation ends
let chatSession             = document.querySelector( ".chatBot .chatBody .chatSession" )

//  // Count the iteration for opening the ChatBot,
//  // If count is 0, Initialize chat
//  // Else continue the chat
var chatBotIteration        = 0
function halfChatBot() {
    chatCloseTrigger.style.display = "none";
    chatOpenTrigger.style.display = "none";
    animateChatForm.style.display = "none";
    animateChatForm2.style.display = "flex";
    chatHeading.style.display = "none"; 
    animateChatForm.classList.remove("active");
    animateChatBody.classList.remove("active");
    animateChatSeparater.classList.remove("active");
    setTimeout(function() {
        animateChatBot.classList.remove("active");
        animateChatForm2.classList.add("active");
    }, 250);
}

//  // Function to open ChatBot
function openChatBot() {
    chatOpenTrigger.style.display = "none";
    chatCloseTrigger.style.display = "block";
    animateChatForm2.style.display = "none";
    animateChatForm.style.display = "flex";
    chatHeading.style.display = "flex"; 
    setTimeout(function(){
        //  // Animate ChatBot
        animateChatBot.classList.add( "active" )
    }, 0)
    setTimeout(function(){
        //  // Animate ChatOpenTrigger
        chatOpenTrigger.classList.add( "active" )
    }, 250)
    setTimeout(function(){
        //  // Animate ChatSeperater
        animateChatSeparater.classList.add( "active" )
    }, 500)
    setTimeout(function(){
        //  // Animate ChatBody
        animateChatBody.classList.add( "active" )
    }, 750)
    setTimeout(function(){
        //  // Animate ChatForm
        animateChatForm.classList.add( "active" )
        animateChatForm2.classList.remove( "active" )
    }, 1000)
    if( chatBotIteration == 0 )
        setTimeout(function(){
            //  // Initiate chat
          //  initiateConversation() opt out 05/27
        }, 2000)
    chatBotIteration++

}

//  // Function to close ChatBot
function closeChatBot() {
    chatCloseTrigger.style.display = "none";
    chatOpenTrigger.style.display = "block";
    animateChatForm.style.display = "none";
    animateChatForm2.style.display = "none";
    chatHeading.style.display = "flex"; 
    setTimeout(function() {
        //  // Animate ChatForm
        animateChatForm.classList.remove( "active" )
        animateChatForm2.classList.remove( "active" )
    }, 0)
    setTimeout(function() {
        //  // Animate ChatBody
        animateChatBody.classList.remove( "active" )
    }, 250)
    setTimeout(function() {
        //  // Animate ChatSeperater
        animateChatSeparater.classList.remove( "active" )
    }, 500)
    setTimeout(function() {
        //  // Animate ChatOpenTrigger
        chatOpenTrigger.classList.remove( "active" )
    }, 750)
    setTimeout(function() {
        //  // Animate ChatBot
        animateChatBot.classList.remove( "active" )


        //  // Clear the chat
        //  // ------------ Uncomment the next line if you want to clear chat everytime you close the ChatBot.
        // chatSession.innerHTML = ""
    }, 1000)
}

function openBotStar() {
closeChatBot()
let botStar = document.querySelector('.chatbot-container')
botStar.style.display="block"
}

function closeBotStar() {
let botStar = document.querySelector('.chatbot-container')
botStar.style.display="none"
}