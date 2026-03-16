export default function Accepted({ data }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "10px", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="accepted attendee details">
        <thead>
          <tr style={{ background: "#f6f6f6" }}>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Attribute</th>
            <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ddd" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).map((attribute) => (
            <tr key={attribute}>
              <th scope="row" style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #eee" }}>
                {attribute}
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{data[attribute]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
