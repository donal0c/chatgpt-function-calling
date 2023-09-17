import {Configuration, OpenAIApi} from 'openai';

const configuration = new Configuration({
    organization: "org-uoGVFme600n1NwkDznXHJ2FZ",
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

// Define your function
function helloWorld(appendString) {
    console.log("Hello World! " + appendString)
    return "Hello World! " + appendString
}

function getTimeOfDay() {
    let date = new Date()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    let timeOfDay = "AM"
    if (hours > 12) {
        hours = hours - 12
        timeOfDay = "PM"
    }

    return hours + ":" + minutes + ":" + seconds + " " + timeOfDay;
}

async function callChatGPTWithFunctions(appendString) {
    let messages = [{
        role: "system",
        content: "Perform function requests for the user"
    }, {
        role: "user",
        content: "Hello, I am a user. I want to know the time of day."
    }]
    let chat = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0613",
        messages,
        functions: [{
            name: "helloWorld",
            description: "A function that returns the string 'Hello World!' along with the string passed to it",
            parameters: {
                type: "object",
                properties: {
                    appendString: {
                        type: "string",
                        description: "The string to append to the 'Hello World!' string"

                    }
                },
                require: ["appendString"]
            },
        }, {
            name: "getTimeOfDay",
            description: "Get the time of day.",
            parameters: {
                type: "object",
                properties: {
                },
                require: [],
            }
        }],
        function_call: "auto",
    })

    let wantsToUseFunction = chat.data.choices[0].finish_reason == "function_call"
    // console.log(chat)
    // console.log(wantsToUseFunction)
    let content = "";
    if (wantsToUseFunction) {
    }
    // console.log(chat.data.choices[0].message)
    if (chat.data.choices[0].message.function_call.name === "helloWorld") {
        let argumentObj = JSON.parse(chat.data.choices[0].message.function_call.arguments)
        content = helloWorld(argumentObj.appendString)
        // history
        messages.push(chat.data.choices[0].message)
        // response after function call
        messages.push({
            role: "function",
            name: "helloWorld",
            content: content
        })
        // console.log(messages);
    }
    if (chat.data.choices[0].message.function_call.name === "getTimeOfDay") {
        content = getTimeOfDay()
        messages.push(chat.data.choices[0].message)
        messages.push({
            role: "function",
            name: "getTimeOfDay",
            content
        })
    }

    let step4response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0613",
        messages,
    });
    console.log(step4response.data.choices[0])


}

callChatGPTWithFunctions()
