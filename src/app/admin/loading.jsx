// Shown inside the persistent admin shell while the next tab renders, so a
// click gets an immediate response instead of a frozen page.
export default function AdminLoading() {
  return (
    <div className="adm-route-loading" role="status" aria-label="Loading">
      <div
        className="adm-route-loading-bar"
        style={{ height: 28, width: 220 }}
      />
      <div
        className="adm-route-loading-bar"
        style={{ height: 16, width: 420 }}
      />
      <div className="adm-route-loading-bar" style={{ height: 96 }} />
      <div className="adm-route-loading-bar" style={{ height: 320 }} />
    </div>
  );
}
