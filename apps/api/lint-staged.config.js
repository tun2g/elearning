// Staged files under apps/api use this (the nearest) config.
// API lints with Prettier (see the "lint" script); format on commit.
module.exports = {
  '*.{js,ts}': ['prettier --write'],
  '*.{json,md,yaml,yml}': ['prettier --write'],
};
