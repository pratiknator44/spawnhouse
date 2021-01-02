export interface INotification {
    icon?: String,
    type: String | Number,  // like, comment, follow
    user?: String,
    text: String,
    date: Number,   // new Date().getTime() | ago
}

export interface INavbarMessage {
    dpLink?: String,
    userid: String,
    username: String,   // fname lname or username
    text: String,
    totalunseen?: Number,
    time?: Number
}

export interface IMessage {
    senderid: String,
    receiverid?: String,
    dpLink?: String,
    text: String,
    seen: Boolean,
    time: Number
}