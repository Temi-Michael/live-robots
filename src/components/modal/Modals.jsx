import { useState } from "react";
import "./modals.css";

import PopUp from "./PopUp";

export default function Modals(props) {
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phoneNumber: "",
  });
  const [robotstyle] = useState({
    Robots: ".png?set=set1",
    Monsters: ".png?set=set2",
    Aliens: ".png?set=set3",
    Cats: ".png?set=set4",
  });
  const [selectedOptionKey, setSelectedOptionKey] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const handleSelectChange = (e) => {
    setSelectedOptionKey(e.target.value);
  };

  const handleGenerateClick = () => {
    if (user.firstname && user.lastname && selectedOptionKey) {
      const imageUrl = `https://robohash.org/${user.firstname}${user.lastname}${robotstyle[selectedOptionKey]}`;
      setGeneratedImageUrl(imageUrl);
    } else {
      alert("Please fill out first name, last name, and select a style to generate an image.");
    }
  };

  const handleInfo = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleAdd = async () => {
    const newRobot = {
      name: `${user.firstname} ${user.lastname}`.trim(),
      username: user.username,
      email: user.email,
      phone: user.phoneNumber,
      image: generatedImageUrl,
    };

    // 1. General validation
    if (
      !newRobot.name ||
      !newRobot.username ||
      !newRobot.email ||
      !newRobot.phone ||
      !newRobot.image
    ) {
      alert("Please fill out all fields and generate an image.");
      return;
    }

    try {
      // 2. Check if phone number already exists
      const checkPhoneRes = await fetch(`http://localhost:5000/api/robots/check-phone/${newRobot.phone}`);
      const phoneExistsData = await checkPhoneRes.json();

      if (phoneExistsData.exists) {
        alert("A robot with this phone number already exists. Please use a different number.");
        return; // Stop the function
      }

      // 3. If phone number is unique, proceed to add the robot
      const response = await fetch("http://localhost:5000/api/robots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRobot),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add robot.");
      }

      const addedRobot = await response.json();
      props.onAddRobot(addedRobot);

      // Reset form and close modal
      props.setTrigger(false);
      setGeneratedImageUrl("");
      setUser({
        firstname: "",
        lastname: "",
        username: "",
        phoneNumber: "",
        email: "",
      });
      setSelectedOptionKey("");
    } catch (error) {
      console.error("Error adding robot:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div>
      <PopUp trigger={props.trigger} setTrigger={props.setTrigger}>
        <form className="modal-form">
          <div className="form-row">
            <input
              type="text"
              value={user.firstname}
              name="firstname"
              id="firstname"
              placeholder="First Name"
              onChange={handleInfo}
            />
            <input
              type="text"
              value={user.lastname}
              name="lastname"
              id="lastname"
              placeholder="Last Name"
              onChange={handleInfo}
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              value={user.username}
              name="username"
              id="username"
              placeholder="Username"
              onChange={handleInfo}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              value={user.email}
              name="email"
              id="email"
              placeholder="Email"
              onChange={handleInfo}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              value={user.phoneNumber}
              name="phoneNumber"
              id="phoneNumber"
              placeholder="Phone Number"
              onChange={handleInfo}
            />
          </div>
          <div className="form-row">
            <select onChange={handleSelectChange} value={selectedOptionKey}>
              <option value="" disabled>
                -- Select Style --
              </option>
              {Object.keys(robotstyle).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleGenerateClick}
              className="modal-btn btn-generate"
            >
              Generate
            </button>
          </div>
        </form>
        {generatedImageUrl && (
          <div className="image-preview">
            <img
              src={generatedImageUrl}
              alt={`${user.firstname}_${user.lastname}`}
            />
            <p className="image-url">{generatedImageUrl}</p>
          </div>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="modal-btn btn-add"
            onClick={handleAdd}
          >
            Add Robot
          </button>
          <button
            type="button"
            className="modal-btn btn-close"
            onClick={() => {
              props.setTrigger(false);
              setGeneratedImageUrl("");
              setUser({
                firstname: "",
                lastname: "",
                username: "",
                email: "",
                phoneNumber: "",
              });
              setSelectedOptionKey("");
            }}
          >
            Close
          </button>
        </div>
      </PopUp>
    </div>
  );
}
