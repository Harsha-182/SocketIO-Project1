import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [usersStatus, setUsersStatus] = useState({});

  const joinRoom = () => {
    if (room !== "" && username !== "") {
      socket.emit("join_room", { room, username });
    }
  };

  const sendMessage = () => {
    const messageData = {
      room,
      author: username,
      message,
      time: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, messageData]); // Add own message
    socket.emit("send_message", messageData);
    setMessage(""); // Clear input field after sending
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChatHistory((prev) => [...prev, data]); // Append incoming message
    });

    socket.on("user_status", ({ username, status }) => {
      setUsersStatus((prev) => ({ ...prev, [username]: status }));
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_status");
    };
  }, []);

  return (
    <div className="App">
      <h2>Chat App</h2>

      <div>
        <input
          placeholder="Username..."
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Room Number..."
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>

      <div className="chat-container">
        <div className="chat-box">
          {chatHistory
            .filter((msg) => msg.room === room)
            .map((msg, index) => (
              <div
                key={index}
                className={msg.author === username ? "my-message" : "other-message"}
              >
                <p>
                  <strong>{msg.author}</strong>: {msg.message}{" "}
                  <span className="time">{msg.time}</span>
                </p>
              </div>
            ))}
        </div>

        <div className="online-users">
          <h3>Online Users</h3>
          {Object.entries(usersStatus).map(([user, status], index) => (
            <p key={index} className={status === "online" ? "online" : "offline"}>
              {user} - {status}
            </p>
          ))}
        </div>
      </div>

      <div>
        <input
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
    </div>
  );
}

export default App;
