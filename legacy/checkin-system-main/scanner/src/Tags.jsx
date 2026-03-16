const badgeStyle = (bg, fg = "#fff") => ({
  display: "inline-block",
  padding: "10px 16px",
  borderRadius: "999px",
  backgroundColor: bg,
  color: fg,
  fontWeight: 700,
  margin: "10px",
});

function AcceptedTag() {
  return <span style={badgeStyle("#2e7d32")}>Welcome</span>;
}

function RefusedTag() {
  return <span style={badgeStyle("#d32f2f")}>Invalid token</span>;
}

function AllreadyAcceptedTag() {
  return <span style={badgeStyle("#f57c00")}>Already checked</span>;
}

export { AcceptedTag, RefusedTag, AllreadyAcceptedTag };
