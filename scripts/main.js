var intro,
    progress,
    register,
    username,
    main,
    messages,
    message,
    savedData,
    snackbar;

intro = select("#intro");
progress = select("#progress");
register = select("#register");
username = select("#username");
main = select("#main");
messages = select("#messages");
message = select("#message");
snackbar = new Snackbar();
snackbar.init(document.body);

if (!localStorage.getItem("DATA")) {
    localStorage.setItem("DATA", JSON.stringify({
        userName: undefined,
        registered: false
    }));
}

window.onload = function () {
    update();
}

var tinterval = setInterval(() => {
    update();
}, 2000);

savedData = JSON.parse(localStorage.getItem("DATA"));

const user = {
    userName: savedData.userName,
    registered: savedData.registered
};

$M({
    "#intro": {
        adv: {
            ev: function (el) {
                var startProgress = 0,
                    endProgress = 100;
                var interval = setInterval(function () {
                    startProgress += 1;
                    progress.design("width", (startProgress * 2) + "px");
                    if (startProgress >= 100) {
                        clearInterval(interval);
                        if (user.registered) {
                            nextScene(el, main);
                        } else {
                            nextScene(el, register);
                        }
                    }
                }, 1000 / 40);
            }
        }
    },
    "#username": {
        onkeydown: function (_e) {
            var keyName = _e.key.toString().toLowerCase();
            if (keyName == "enter") {
                if (username.value.length >= 20) {
                    snackbar.show("Oops", "Your name is incorrect!", 3);
                } else {
                    user.userName = username.value;
                    user.registered = true;
                    mydb(user);
                    nextScene(register, main);
                }
            }
        }
    },
    "#message": {
        onkeydown: function (_e) {
            var keyName = _e.key.toString().toLowerCase();
            if (keyName == "enter") {
                if (_e.target.value.length >= 300) {
                    snackbar.show("Oops", "Message length is too long..", 3);
                } else {
                    var dt = new Date();
                    var hours = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
                    var minutes = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
                    var time = hours + ":" + minutes;

                    fetch("/sendMessage", {
                        method: "POST",
                        body: JSON.stringify({
                            time,
                            message: _e.target.value,
                            username: user.userName
                        }),
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        }
                    }).then(() => {
                        update();
                    });
                    _e.target.value = "";
                    update();
                }
            }
        }
    }
});

function update() {
    fetch("/messages").then(object => object.json()).then((data) => {
        if (Array.isArray(data.messages)) {
            manipulate(data.messages);
        } else {
            clearInterval(tinterval);
            snackbar.show("Oops", "Something happened in the server.. Please visit later");
        }
    });
}

function createMessage(_name, _message, time) {
    var uname = _name.replace(/(<|>)/, "");
    var message = _message.replace(/(<|>)/, "");

    return `
        <div class="message" >
            <div class="text">${message}</text>
                <div class="info">
                    <img class="icon" src="../res/images.png" alt="Unknown" />
                    <div title=${uname} class="username">${uname}</div>
                </div>
                <div class="time">${time}</div>
            </div>
        </div>
    `;
}

function manipulate(_data) {
    messages.innerHTML = "";
    _data.forEach((mess) => {
        var uname = mess.username;
        var message = mess.message;
        var time = mess.time;
        messages.innerHTML += createMessage(uname, message, time);
    });
}

function mydb(_value) {
    localStorage.setItem("DATA", JSON.stringify(_value));
}

function nextScene(el, el2) {
    el.style.animation = "1.2s fade-out linear";
    el.addEventListener("animationend", function () {
        el.classList.add("none");
        el2.classList.remove("none");
    });
}

function select(_name) {
    return document.querySelector(_name);
}