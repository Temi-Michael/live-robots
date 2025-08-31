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
  const [isLoading, setIsLoading] = useState(false);
  const handleSelectChange = (e) => {
    setSelectedOptionKey(e.target.value);
  };

  const handleGenerateClick = () => {
    if (user.firstname && user.lastname && selectedOptionKey) {
      const imageUrl = `https://robohash.org/${user.firstname}${user.lastname}${robotstyle[selectedOptionKey]}`;
      setGeneratedImageUrl(imageUrl);
    } else {
      alert(
        "Please fill out first name, last name, and select a style to generate an image."
      );
    }
  };

  const handleInfo = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleAdd = async () => {
    if (isLoading) return;

    const newRobot = {
      name: `${user.firstname} ${user.lastname}`.trim(),
      username: user.username,
      email: user.email,
      phone: user.phoneNumber,
      image: generatedImageUrl,
    };

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

    setIsLoading(true);

    try {
      const checkPhoneRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/robots/check-phone/${newRobot.phone}`
      );
      if (!checkPhoneRes.ok) {
        throw new Error(`HTTP error! status: ${checkPhoneRes.status}`);
      }
      const phoneContentType = checkPhoneRes.headers.get("content-type");
      if (!phoneContentType || !phoneContentType.includes("application/json")) {
        const text = await checkPhoneRes.text();
        throw new TypeError(
          `Expected JSON, got ${phoneContentType}. Response body: ${text}`
        );
      }
      const phoneExistsData = await checkPhoneRes.json();

      if (phoneExistsData.exists) {
        alert(
          "A robot with this phone number already exists. Please use a different number."
        );
      } else {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/robots`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newRobot),
          }
        );

        if (!response.ok) {
          const errorContentType = response.headers.get("content-type");
          if (
            errorContentType &&
            errorContentType.includes("application/json")
          ) {
            const errorData = await response.json();
            throw new Error(
              errorData.msg || `HTTP error! status: ${response.status}`
            );
          } else {
            const text = await response.text();
            throw new Error(
              `HTTP error! status: ${response.status}. Response body: ${text}`
            );
          }
        }

        const addedRobot = await response.json();
        props.onAddRobot(addedRobot);

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
      }
    } catch (error) {
      console.error("Error adding robot:", error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
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
            className={`modal-btn btn-add ${isLoading ? "btn-loading" : ""}`}
            onClick={handleAdd}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Robot"}
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
