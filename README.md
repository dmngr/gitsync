# Git Sync

## Clones all repositories, public or private, of a specified user or organization.

## Credentials are required, they are present in a file named .gitsync.json place in the home folder.

### Installation:

```
~$ sudo npm install -g @deliverymanager/gitsync
```

### Usage:

#### For pull:

```
~$ gitsync --pull
```

--------------------------------------------------------------------------------

#### For clone:

```
~$ gitsync --clone
```

--------------------------------------------------------------------------------

#### For both:

```
~$ gitsync --all
```

##### Or:

```
~$ gitsync -a
```

--------------------------------------------------------------------------------

#### To (re)initialize credentials:

```
~$ gitsync --init
```

--------------------------------------------------------------------------------

#### To checkout to stable branches (production/mov5):

```
~$ gitsync --checkout
```

--------------------------------------------------------------------------------

##### The description is used to determine the exact path to which the repository will be cloned.

##### If the description is not a valid path, a warning appears.

### Examples:

Repository description: `path/to/folder` -> Will clone the repository in `./path/to/folder/<repository name>`

Repository description: `Some description` -> Will show a warning and __not__ clone

### Authentication:

#### The following file, .gitsync.json, must be placed in the home folder and is required for authentication with the GitHub API:

#### For only public repositories:

```
{
  "user": <github username>,
  "user_agent": <github user_agent>,
  "sync_account": <account from which to sync>,
  "org": <true/false> // whether the sync_account is an organization
}
```

#### For private repositories as well:

```
{
  "user": <github username>,
  "user_agent": <github user_agent>,
  "sync_account": <account from which to sync>,
  "org": <true/false> // whether the sync_account is an organization,
  "at": <github API access token>
}
```

#### To run the tests as well, the file must look like this:

```
{
  "user": <github username>,
  "at": <github API access token>,
  "test_repo_1": {
    "name": <repo name>,
    "full_name": <repo full name>,
    "local_path": <local path to which the repo will be cloned>
  },
  "test_repo_2": {
    "name": <repo name>,
    "full_name": <repo full name>,
    "local_path": <local path to which the repo will be cloned>
  },
  "user_agent": <github user_agent>,
  "sync_account": <account from which to sync>,
  "org": <true/false> // whether the sync_account is an organization
}
```

#### You can place the file yourself or you could run `~$ gitsync --init` which will prompt for user name and Github API access token.

```
~$ gitsync --init
```

#### If you try to use the script without the `.gitsync.json` file present in the home folder, you will be prompted to initialize it, and execution will continue after the file is created.

#### _Note_: You could omit the access token. The script will still work but _only_ for public repositories.

# API Reference
---

## Clone

### init_cred
Initializes/updates git credentials

<a name="exp_module_src/clone/lib/init_cred--module.exports"></a>

### module.exports([cred]) ⇒ <code>Promise</code> ⏏
**Kind**: Exported function  
**Returns**: <code>Promise</code> - Resolves to the the output of fs.writeFile or to message: 'Credentials not updated'  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [cred] | <code>object</code> | <code>{}</code> | Credentials to keep Reads file with credentials, prompts for creation if not found and for update if found. Creates/Updates credentials. |


### get_all_repos_names
Gets all user's or org's repos names

<a name="exp_module_src/clone/lib/get_all_repos_names--module.exports"></a>

### module.exports(name, org, user, at) ⇒ <code>repos</code> ⏏
**Kind**: Exported function  
**Returns**: <code>repos</code> - Mapped to have attributes name, full_name, local_path  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Github username |
| org | <code>boolean</code> | Whether the account belongs to an organization |
| user | <code>string</code> | User-Agent Header |
| at | <code>string</code> | Github authentication token |


### is_path_valid
Checks for validity of path, must be string and satisfy

<a name="exp_module_src/clone/lib/is_path_valid--module.exports"></a>

### module.exports(path) ⇒ <code>boolean</code> ⏏
**Kind**: Exported function  
**Returns**: <code>boolean</code> - Whether path is valid  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | Path under which to clone a repo |


### clone_repo
Clones a repo in path specified if path is valid. Else, clones to cwd

<a name="exp_module_src/clone/lib/clone_repo--module.exports"></a>

### module.exports(repo, at) ⇒ <code>Promise</code> ⏏
**Kind**: Exported function  
**Returns**: <code>Promise</code> - Resolves to the path under which the repo was cloned  

| Param | Type | Description |
| --- | --- | --- |
| repo | <code>object</code> | Repository info |
| repo.name | <code>string</code> |  |
| repo.full_name | <code>string</code> |  |
| repo.local_path | <code>string</code> | local path to which the repo will be cloned |
| at | <code>string</code> | Github authentication token |

---

## Pull

### get_existing_repos
Finds all repository folder paths under cwd. Used to update repos status

<a name="exp_module_src/pull/lib/get_existing_repos--module.exports"></a>

### module.exports() ⇒ <code>Array.&lt;string&gt;</code> ⏏
**Kind**: Exported function  
**Returns**: <code>Array.&lt;string&gt;</code> - The repository folder paths under cwd  

### get_status
Updates refs for cwd

<a name="exp_module_src/pull/lib/get_status--module.exports"></a>

### module.exports(path) ⇒ <code>string</code> ⏏
**Kind**: Exported function  
**Returns**: <code>string</code> - Repo status: diverged, fast-forward, up-to-date  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The absolute path to use as an cwd with exec |


### pull_all
Pulls all branches for repo

<a name="exp_module_src/pull/lib/pull_all--module.exports"></a>

### module.exports(path) ⇒ <code>string</code> ⏏
**Kind**: Exported function  
**Returns**: <code>string</code> - Success message  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The absolute path to use as an cwd with exec |


### get_all_branches
Returns all repo branches

<a name="exp_module_src/pull/lib/get_all_branches--module.exports"></a>

### module.exports(path) ⇒ <code>Array.&lt;string&gt;</code> ⏏
**Kind**: Exported function  
**Returns**: <code>Array.&lt;string&gt;</code> - The branch names  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The absolute path to use as an cwd with exec |


### track_missing_branches
Creates local branches production and branches with prodv prefix, if not found

<a name="exp_module_src/pull/lib/track_missing_branches--module.exports"></a>

### module.exports(path, branches) ⇒ <code>Array.&lt;string&gt;</code> ⏏
**Kind**: Exported function  
**Returns**: <code>Array.&lt;string&gt;</code> - The branches that were added  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | The absolute path to use as an cwd with exec |
| branches | <code>Array.&lt;string&gt;</code> | All repo branches |

