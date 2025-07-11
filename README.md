# nodenogg.in

nodenogg.in is an in-person collaborative multiscreen web tool that increases participation in feedback and critiques. Improves staff and student confidence, project outcomes and enhances a community of practice. Designed with privacy in mind, simple and quick to use, nodenogg.in supports your education practice by using networked technologies to enhance social learning spaces.

## Education Technology but different

- trust based
- free (libre) software.
- local-first (hosted-second)
  - data is local only never stored in the cloud
- You control and own your data

## Want to use a nodenogg.in

For guides and more detail on the overall project start here: https://docs.nodenogg.in

## About this code repo

All code is Licenced under a GNU Affero General Public License (AGPL) copyright the University of Southampton.

The GNU Affero General Public License is a free software license that lets anyone use, share, and modify software, as long as any copies or changes they distribute are also kept free and open under the same license. If you run modified versions of nodenogg.in software on a server and let people use it over a network (like a web app), you must also make the source code of your modified version available.

## How we have organised it

This project is organised as a pnpm monorepo. You can read more about pnpm's workspace feature [here](https://pnpm.io/workspaces).

## Setting up nodenogg.in

1. Install `pnpm` using [these instructions](https://pnpm.io/installation).
2. Install `node` using [these instructions](https://nodejs.org/en/download).
3. Download or pull this project (repository) to your machine.
4. Change to the root directory of the downloaded project.
5. Install dependencies for the project (in the root directory of the project) like so.

```bash
pnpm install
```

3. (Optional) We recommend using [VSCode](https://code.visualstudio.com/). For working with Vue code, we recommend installing the [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) plugin.

## Run locally for using on a private local network (and for testing)

First make sure you have the latest code from the main branch (git pull or download) and remember install/ updated dependencies in your projects root directory.

```bash
pnpm install
```

followed by

```bash
pnpm dev
```

This will run both the app and the Yjs (sync) server. You are now good to test the latest version of nodenogg.in.

visit

```bash
http://localhost:8080
```

## Local nodenogg.in documentation

If you would also like to run the nodenogg.in documentation locally you can, please note that any embedded YouTube videos will need an externally connected network connection (aka connection to the internet)

```bash
pnpm docs:dev
```

visit

```bash
http://localhost:8081/
```

## Container development for deployment

**NB these Steps are not completed**

The next steps are more for deployment related to hosting your own instance of the app nodenogg.in on a server, such as Azure, AWS or your own Virtual Private Server. You will want to be familiar with docker.

## Install docker locally

We recommend using [Docker Desktop](https://docs.docker.com/get-docker/) for development. See [docker's website](https://docs.docker.com/get-docker/) for instructions.

## Build and run the whole system
