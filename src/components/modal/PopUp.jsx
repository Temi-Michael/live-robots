export default function PopUp(props) {
  return (
    <div className={`modal ${props.trigger ? 'modal-active' : ''}`}>
      <div className="modal-content">
        {props.children}
      </div>
    </div>
  );
}
