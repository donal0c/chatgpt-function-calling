import {Configuration, OpenAIApi} from 'openai';
import sendEmail from "./sendEmail.js";

const configuration = new Configuration({
    organization: "FILL_IN_ORGANIZATION",
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

function helloWorld(appendString) {
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
        content: "Hello, I am a user, I would like to send an email to my friend"
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
        },
            {
                name: "sendEmail",
                description: "Sends an email to the recipient with the message passed to it",
                parameters: {
                    type: "object",
                    properties: {},
                    require: [],
                }
            },
            {
                name: "getTimeOfDay",
                description: "Get the time of day.",
                parameters: {
                    type: "object",
                    properties: {},
                    require: [],
                }
            }],
        function_call: "auto",
    })

    let wantsToUseFunction = chat.data.choices[0].finish_reason == "function_call"
    let content = "";
    if (wantsToUseFunction) {
    }

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

    if (chat.data.choices[0].message.function_call.name === "sendEmail") {
        content = await sendEmail()
        messages.push(chat.data.choices[0].message)
        messages.push({
            role: "function",
            name: "sendEmail",
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
