# NG-Conf 2017 Product Demo

Product Demo for NG-Conf 2017.

## Setup

- `npm install`
- Make sure you have a running `carbonldp-platform`
- Prepare the default data by running (modify the command as needed):

	```bash
	npm run script:build -- \
		--protocol http \
		--domain localhost:8083 \
		--user your@agent-email.com \
		--pass YoURP344word
	```
	
- Run the server synchronizer:

	```bash
	npm run sync-server -- \
		--port 8090
	```

- Run the application:

	```bash
	npm start -- \
		--env.protocol http \
		--env.domain localhost:8083 \
		--env.user your@agent-email.com \
		--env.pass YoURP344word \
		--env.sync_host localhost:8090
	```
	
### Note

You may need to change the domain used to a different one (maybe even save it under your `hosts` file) so other machines
are able to display the form/graph.

## License

	Copyright (c) 2015-present, Base22 Technology Group, LLC.
	All rights reserved.

	This source code is licensed under the BSD-style license found in the
	LICENSE file in the root directory of this source tree.
