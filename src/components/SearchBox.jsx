export default function SearchBox({values, changed}) {
  return (
    <div className="pa2">
      <input
        className="pa3 ba b--g bg-lightest-blue"
        type="search"
        value={values}
        onChange={changed}
        placeholder="Search Robot Friend"
      />
    </div>
  );
}
