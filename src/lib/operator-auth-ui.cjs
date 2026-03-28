function getOperatorRedirectTarget(target) {
  const value = String(target || "").trim();

  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

function getOperatorNavbarState({ signedIn, authorized }) {
  if (!signedIn) {
    return {
      showLogin: false,
      showAdminDashboard: false,
    };
  }

  if (authorized) {
    return {
      showLogin: false,
      showAdminDashboard: true,
    };
  }

  return {
    showLogin: false,
    showAdminDashboard: false,
  };
}

module.exports = {
  getOperatorRedirectTarget,
  getOperatorNavbarState,
};
