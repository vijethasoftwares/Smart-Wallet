
// Create a list to store invalidated tokens
const invalidatedTokens = [];

// Function to check if a token is invalidated
function isTokenInvalid(token) {
  return invalidatedTokens.includes(token);
}

// Add both the access and refresh tokens to the list of invalidated tokens
function invalidateTokens(access, refresh) {
  invalidatedTokens.push(access); // access token
  // invalidatedTokens.push(refresh); // refresh token
}

// Function to remove tokens from the invalidated list when they expire or are manually revoked
function removeInvalidTokens(access, refresh) {
  const indexAccess = invalidatedTokens.indexOf(access);
  const indexRefresh = invalidatedTokens.indexOf(refresh);

  if (indexAccess !== -1) {
    invalidatedTokens.splice(indexAccess, 1);
  }

  if (indexRefresh !== -1) {
    invalidatedTokens.splice(indexRefresh, 1);
  }
}

module.exports = {
  isTokenInvalid,
  invalidateTokens,
  removeInvalidTokens,
};
