function getOperatorRedirectTarget(target) {
  const value = String(target || '').trim();

  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/admin';
  }

  return value;
}

function getOperatorNavbarState({ signedIn, authorized }) {
  return {
    showLogin: false,
  };
}

module.exports = {
  getOperatorRedirectTarget,
  getOperatorNavbarState,
};
