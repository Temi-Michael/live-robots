import "./App.css";
import Card from "./components/Card";
import "tachyons";
import SearchBox from "./components/SearchBox";
import { useState, useEffect } from "react";
import Modals from "./components/modal/Modals";
import Scroll from "./components/Scroll";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [robot, setRobot] = useState([]);
  const [searched, setSearched] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("https://robo-friends-server.onrender.com/api/robots")
      .then((response) => response.json())
      .then((users) => setRobot(users))
      .catch(err => console.log('Error fetching robots: ', err));
  }, []);

  const handleChange = (e) => {
    setSearched(e.target.value);
  };

  const handleAddRobot = (newRobot) => {
    setRobot([...robot, newRobot]);
  };

  const filteredRobots = robot.filter((robot) => {
    return robot.name.toLowerCase().includes(searched.toLowerCase());
  });



  return (
    <div className="tc">
      <h1 className="f1">RoboFriends</h1>
      <SearchBox values={searched} changed={handleChange} />
      <button onClick={() => setShowModal(true)} className="bw0 br2 bg-blue pa2 white fw1 tc ttu tracked">
        Add New User
      </button>
      <Modals
        trigger={showModal}
        setTrigger={setShowModal}
        onAddRobot={handleAddRobot}
      />
      <Scroll>
        <ErrorBoundary>
          <Card robots={filteredRobots} />
        </ErrorBoundary>
      </Scroll>
    </div>
  );
}

export default App;