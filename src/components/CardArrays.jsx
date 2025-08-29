export default function CardArrays({robots}) {

  // if (true) {
  //   throw new Error('Nooooooo')
  // }
  return (
    <>
      {robots.map((robot, index) => (
        <div key={index} className="bg-light-green tc dib br3 pa3 ma2 bw2 shadow-5 grow">
          <img src={robot.image} alt={robot.name} />
          <div>
            <h2>{robot.name}</h2>
            <p>{robot.email}</p>
          </div>
        </div>
      ))}
    </>
  );
}

