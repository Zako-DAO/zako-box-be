export const getSessionMessageKey = (address: string) => `session:message:${address}`
export const getGitHubOAuthStateKey = (stateUuid: string) => `github:oauth:state:${stateUuid}`
